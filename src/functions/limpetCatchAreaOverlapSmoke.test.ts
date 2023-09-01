/**
 * @jest-environment node
 * @group smoke
 */
import { limpetCatchAreaOverlap } from "./limpetCatchAreaOverlap";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof limpetCatchAreaOverlap).toBe("function");
  });
  test("limpetCatchAreaOverlapSmoke - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await limpetCatchAreaOverlap(example);
      expect(result).toBeTruthy();
      writeResultOutput(
        result,
        "limpetCatchAreaOverlap",
        example.properties.name
      );
    }
  }, 120000);
});
