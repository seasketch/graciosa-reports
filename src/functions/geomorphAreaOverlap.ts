import {
  Sketch,
  Feature,
  GeoprocessingHandler,
  Metric,
  Polygon,
  ReportResult,
  SketchCollection,
  toNullSketch,
  rekeyMetrics,
  getFlatGeobufFilename,
  isInternalVectorDatasource,
} from "@seasketch/geoprocessing";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";
import bbox from "@turf/bbox";
import project from "../../project";
import { clipSketchToGeography } from "../util/clipSketchToGeography";
import { overlapFeatures } from "../util/overlapFeatures";
import { ExtraParams } from "../types";
import { getParamStringArray } from "../util/extraParams";

export async function geomorphAreaOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>,
  extraParams?: ExtraParams
): Promise<ReportResult> {
  const geographyId = extraParams
    ? getParamStringArray("geographyIds", extraParams)[0]
    : undefined;
  const clippedSketch = await clipSketchToGeography(sketch, geographyId);
  const box = clippedSketch.bbox || bbox(clippedSketch);
  const metricGroup = project.getMetricGroup("geomorphAreaOverlap");

  let cachedFeatures: Record<string, Feature<Polygon>[]> = {};

  const polysByBoundary = (
    await Promise.all(
      metricGroup.classes.map(async (curClass) => {
        if (!curClass.datasourceId) {
          throw new Error(`Missing datasourceId ${curClass.classId}`);
        }
        const ds = project.getDatasourceById(curClass.datasourceId);
        if (isInternalVectorDatasource(ds)) {
          const url = `${project.dataBucketUrl()}${getFlatGeobufFilename(ds)}`;

          // Fetch features overlapping with sketch, pull from cache if already fetched
          const dsFeatures =
            cachedFeatures[curClass.datasourceId] ||
            (await fgbFetchAll<Feature<Polygon>>(url, box));
          cachedFeatures[curClass.datasourceId] = dsFeatures;

          // If this is a sub-class, filter by class name, exclude null geometry too
          // ToDo: should do deeper match to classKey
          const finalFeatures =
            ds.classKeys.length > 0 &&
            curClass.classId !== `${ds.datasourceId}_all`
              ? dsFeatures.filter((feat) => {
                  return (
                    feat.geometry &&
                    feat.properties![ds.classKeys[0]] === curClass.classId
                  );
                }, [])
              : dsFeatures;

          return finalFeatures;
        }
        return [];
      })
    )
  ).reduce<Record<string, Feature<Polygon>[]>>((acc, polys, classIndex) => {
    return {
      ...acc,
      [metricGroup.classes[classIndex].classId]: polys,
    };
  }, {});

  const metrics: Metric[] = (
    await Promise.all(
      metricGroup.classes.map(async (curClass) => {
        const overlapResult = await overlapFeatures(
          metricGroup.metricId,
          polysByBoundary[curClass.classId],
          clippedSketch
        );
        return overlapResult.map(
          (metric): Metric => ({
            ...metric,
            classId: curClass.classId,
          })
        );
      })
    )
  ).reduce(
    // merge
    (metricsSoFar, curClassMetrics) => [...metricsSoFar, ...curClassMetrics],
    []
  );

  return {
    metrics: rekeyMetrics(metrics),
    sketch: toNullSketch(clippedSketch, true),
  };
}

export default new GeoprocessingHandler(geomorphAreaOverlap, {
  title: "geomorphAreaOverlap",
  description: "Calculate sketch overlap with geomorphology polygons",
  executionMode: "async",
  timeout: 600,
  requiresProperties: [],
});
