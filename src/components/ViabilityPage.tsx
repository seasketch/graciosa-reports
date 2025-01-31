import React from "react";
import { SizeCard } from "./SizeCard";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client-ui";
import { OUSCard } from "./OUSCard";
import { OusDemographics } from "./OusDemographic";
import { OUSByIslandCard } from "./OUSByIslandCard";
import { ProtectionCard } from "./ProtectionCard";
import { BathymetryCard } from "./BathymetryCard";
import { GeoProp } from "../types";

const ReportPage: React.FunctionComponent<GeoProp> = (props) => {
  return (
    <>
      <ProtectionCard />
      <SizeCard geographyId={props.geographyId} />
      <BathymetryCard geographyId={props.geographyId} />
      <OUSCard geographyId={props.geographyId} />
      <OUSByIslandCard
        hidden={props.geographyId === "nearshore"}
        geographyId={props.geographyId}
      />
      <OusDemographics geographyId={props.geographyId} />
      <SketchAttributesCard autoHide />
    </>
  );
};

export default ReportPage;
