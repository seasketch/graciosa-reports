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

export async function limpetCatchAreaOverlap(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>,
  extraParams?: ExtraParams
): Promise<ReportResult> {
  const geographyId = extraParams
    ? getParamStringArray("geographyIds", extraParams)[0]
    : undefined;
  const clippedSketch = await clipSketchToGeography(sketch, geographyId);
  const box = clippedSketch.bbox || bbox(clippedSketch);
  const metricGroup = project.getMetricGroup("limpetCatchAreaOverlap");

  let cachedFeatures: Record<string, Feature<Polygon>[]> = {};

  const features = (
    await Promise.all(
      metricGroup.classes.map(async (curClass) => {
        if (!curClass.datasourceId) {
          throw new Error(`Missing datasourceId ${curClass.classId}`);
        }
        const ds = project.getDatasourceById(curClass.datasourceId);
        if (isInternalVectorDatasource(ds)) {
          const url = `${project.dataBucketUrl()}${getFlatGeobufFilename(ds)}`;
          console.log("url", url);
          // Fetch for entire project area, we want the whole thing
          const polys = await fgbFetchAll<Feature<Polygon>>(url, box);
          return polys;
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
          features[curClass.classId],
          sketch
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

export default new GeoprocessingHandler(limpetCatchAreaOverlap, {
  title: "limpetCatchAreaOverlap",
  description: "Calculate sketch overlap with Limpet Catch Area polygons",
  executionMode: "async",
  timeout: 600,
  requiresProperties: [],
});
