import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { OUSCard } from "./OUSCard";
import { OusDemographics } from "./OusDemographic";
import { OUSByIslandCard } from "./OUSByIslandCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <OUSCard />
      <OUSByIslandCard />
      <OusDemographics />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
