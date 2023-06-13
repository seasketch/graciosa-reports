import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { OUSCard } from "./OUSCard";

const ReportPage = () => {
  return (
    <>
      <SizeCard />
      <OUSCard />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
