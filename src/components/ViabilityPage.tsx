import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { OUSCard } from "./OUSCard";
import { OusDemographics } from "./OusDemographic";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <OUSCard />
      <OusDemographics />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
