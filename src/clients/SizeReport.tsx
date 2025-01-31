import React, { useState } from "react";
import Translator from "../components/TranslatorAsync";
import { SizeCard } from "../components/SizeCard";
import geographies from "../../project/geographies.json";
import { Card } from "@seasketch/geoprocessing/client-ui";

export const SizeReport = () => {
  const [geography, setGeography] = useState("nearshore");

  const geographySwitcher = (e: any) => {
    setGeography(e.target.value);
  };
  return (
    <Translator>
      <Card>
        <p>
          Nearshore planning area:{" "}
          <select onChange={geographySwitcher}>
            {geographies.map((geography) => {
              return (
                <option value={geography.geographyId}>
                  {geography.display}
                </option>
              );
            })}
          </select>
        </p>
      </Card>
      <SizeCard geographyId={geography} />
    </Translator>
  );
};
