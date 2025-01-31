import path from "path";
import fs from "fs-extra";
import {
  Histogram,
  Polygon,
  FeatureCollection,
  MultiPolygon,
  Georaster,
  Metric,
} from "@seasketch/geoprocessing/client-core";
import {
  datasourceConfig,
  createMetric,
  getCogFilename,
  isInternalVectorDatasource,
  InternalRasterDatasource,
  ImportRasterDatasourceOptions,
  ImportRasterDatasourceConfig,
  ProjectClientBase,
  getSum,
  getHistogram,
  bboxOverlap,
  BBox,
} from "@seasketch/geoprocessing";
import { genRasterConfig } from "@seasketch/geoprocessing/scripts";
import projectClient from "../../project";
import bbox from "@turf/bbox";

// @ts-ignore
import geoblaze from "geoblaze";
import { Geography } from "../../src/types";

/**
 * Returns Metric array for raster datasource and geography
 * @param datasource InternalRasterDatasource that's been imported
 * @param geography Geography to be calculated for
 * @returns Metric[]
 */
export async function precalcRasterDatasource(
  datasource: InternalRasterDatasource,
  geography: Geography
): Promise<Metric[]> {
  // @ts-ignore
  const rasterConfig = genRasterConfig(projectClient, datasource, undefined);
  const tempPort = 8080;
  const url = `${projectClient.dataBucketUrl(true, tempPort)}${getCogFilename(
    rasterConfig.datasourceId
  )}`;
  const raster: Georaster = await geoblaze.parse(url);

  const rasterMetrics = await genRasterMetrics(raster, rasterConfig, geography);

  return rasterMetrics;
}

/**
 * Returns Metric array for raster datasource and geography
 * @param raster Georaster parsed with geoblaze
 * @param rasterConfig ImportRasterDatasourceConfig, datasource to calculate metrics for
 * @param geography Geography to calculate metrics for
 * @returns Metric[]
 */
export async function genRasterMetrics(
  raster: Georaster,
  rasterConfig: ImportRasterDatasourceConfig,
  geography: Geography
): Promise<Metric[]> {
  // Reads in geography vector data as FeatureCollection
  const geographyFeatureColl = await (async () => {
    if (!geography) throw new Error(`Expected geography`);
    else if (
      !isInternalVectorDatasource(
        projectClient.getDatasourceById(geography.datasourceId)
      )
    )
      throw new Error(
        `Expected ${geography.datasourceId} to be an internal vector datasource`
      );
    else {
      const polys = fs.readJsonSync(
        getJsonPath(rasterConfig.dstPath, geography.datasourceId)
      ) as FeatureCollection<Polygon | MultiPolygon>;
      return polys;
    }
  })();

  console.log(
    `Precalculating ${rasterConfig.measurementType}, for raster ${rasterConfig.datasourceId} and geography ${geography.datasourceId}`
  );

  const rasterBbox: BBox = [raster.xmin, raster.ymin, raster.xmax, raster.ymax];

  // If there's no overlap between geography and raster, return empty metric
  if (!bboxOverlap(bbox(geographyFeatureColl), rasterBbox)) {
    console.log("No overlap -- returning 0 sum");
    return [
      createMetric({
        geographyId: geography.geographyId,
        classId: rasterConfig.datasourceId + "-total",
        metricId: "sum",
        value: 0,
      }),
    ];
  }

  // Creates metric for simple continous raster
  if (rasterConfig.measurementType === "quantitative") {
    return [
      createMetric({
        geographyId: geography.geographyId,
        classId: rasterConfig.datasourceId + "-total",
        metricId: "sum",
        value: await getSum(raster, geographyFeatureColl),
      }),
    ];
  }

  // Creates metrics for categorical raster (histogram, count by class)
  if (rasterConfig.measurementType === "categorical") {
    const metrics: Metric[] = [];
    const histogram = (await getHistogram(raster)) as Histogram;
    if (!histogram) throw new Error("Histogram not returned");

    Object.keys(histogram).forEach((curClass) => {
      metrics.push(
        createMetric({
          geographyId: geography.geographyId,
          classId: rasterConfig.datasourceId + "-" + curClass,
          metricId: "count",
          value: histogram[curClass],
        })
      );
    });
  }

  throw new Error(
    `Something is malformed, check raster ${rasterConfig.datasourceId} and geography ${geography.datasourceId}]`
  );
}

/**
 * Builds JSON path from dist folder path and datasourceId
 * @param dstPath string path to dist folder
 * @param datasourceId string id for datasource
 * @returns string path to datasource file
 */
function getJsonPath(dstPath: string, datasourceId: string) {
  return path.join(dstPath, datasourceId) + ".json";
}
