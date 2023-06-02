import fs from "fs-extra";
import { $ } from "zx";

/**
 * Generates multiband raster from directory of singleband rasters
 * @param srcPath - directory of .tif or .tiff files
 * @param dstPath - directory to save output multiband raster to
 * @param datasourceId - output filename to use
 */
export async function genMultiband(
  srcPath: string,
  dstPath: string,
  datasourceId: string
) {
  // Creates array of raster filenames to be included in geotiff
  const filenames: string[] = fs
    .readdirSync(srcPath)
    .filter(
      (filename) => filename.endsWith(".tif") || filename.endsWith(".tiff")
    )
    .map((filename) => srcPath + "/" + filename);

  // Build virtual dataset of multiple singleband rasters
  await $`gdalbuildvrt -separate ${dstPath}/${datasourceId}.vrt ${filenames}`;

  // # Create COG multiband raster from virtual dataset
  await $`gdal_translate -r nearest -of COG -stats ${dstPath}/${datasourceId}.vrt ${dstPath}/${datasourceId}.tif`;

  await $`rm "${dstPath}/${datasourceId}.vrt"`;
}
