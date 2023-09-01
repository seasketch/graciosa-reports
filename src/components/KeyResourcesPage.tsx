import React from "react";
import { GeoProp } from "../types";
import { LimpetCatch } from "./LimpetCatch";

export const KeyResourcesPage: React.FunctionComponent<GeoProp> = (props) => {
  return (
    <>
      <LimpetCatch geographyId={props.geographyId} />
    </>
  );
};
