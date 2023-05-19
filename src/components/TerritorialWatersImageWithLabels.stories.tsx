import React from "react";
import { Card, ReportDecorator } from "@seasketch/geoprocessing/client-ui";
import { TerritorialWatersImageWithLabels } from "./TerritorialWatersImageWithLabels";
import Translator from "./TranslatorAsync";

export default {
  component: TerritorialWatersImageWithLabels,
  title: "Components/TerritorialWatersImageWithLabels",
  decorators: [ReportDecorator],
};

export const simple = () => (
  <Card>
    <Translator>
      <TerritorialWatersImageWithLabels />
    </Translator>
  </Card>
);

export const updateLabel = () => (
  <Card>
    <Translator>
      <TerritorialWatersImageWithLabels
        labels={[
          {
            key: "nearshore",
            labelText: "Nearshore\n(0-6 nautical miles)",
            style: {
              font: "12pt Helvetica, Arial, sans-serif",
              whiteSpace: "pre",
            },
          },
          { key: "offshore", labelText: "Offshore\n(6-200 nautical miles)" },
          { key: "eez", y: 250 },
          {
            key: "eez",
            style: {
              font: "10pt Helvetica, Arial, sans-serif",
            },
          },
        ]}
      />
    </Translator>
  </Card>
);

export const removeLabel = () => (
  <Card>
    <Translator>
      <TerritorialWatersImageWithLabels
        labels={[{ key: "land", labelText: "" }]}
      />
    </Translator>
  </Card>
);

export const addLabel = () => (
  <Card>
    <Translator>
      <TerritorialWatersImageWithLabels
        labels={[
          {
            key: "internationWaters",
            labelText: "International Waters",
            x: 200,
            y: 50,
          },
        ]}
      />
    </Translator>
  </Card>
);
