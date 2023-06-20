import fs from "fs-extra";
import { OusFeatureProperties } from "../../src/util/overlapOusDemographic";
import { FeatureCollection, Polygon } from "@seasketch/geoprocessing";

// Assumes already done:
// join spatial and tabular data
// remove extraneous fields or those uniquely identifying people

const shapeFc = fs.readJSONSync(
  "./data/src/Analytics/nearshore_reports/OUS_Demographics/ous_demographics.geojson"
) as FeatureCollection<Polygon, OusFeatureProperties>;

// sort by respondent_id (string)
const sortedShapes = shapeFc.features.sort(
  (a, b) => a.properties.resp_id - b.properties.resp_id
);
fs.writeFileSync(
  "./data/src/Analytics/nearshore_reports/OUS_Demographics/ous_demographics_sorted.geojson",
  JSON.stringify({ ...shapeFc, features: sortedShapes })
);
