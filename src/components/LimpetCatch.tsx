import React from "react";
import {
  Collapse,
  ClassTable,
  SketchClassTable,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  squareMeterToKilometer,
  valueFormatter,
  Metric,
  MetricGroup,
} from "@seasketch/geoprocessing/client-core";
import {
  getPrecalcMetrics,
  toPercentMetric,
} from "../../data/bin/getPrecalcMetrics";

import project from "../../project";
import Translator from "./TranslatorAsync";
import { Trans, useTranslation } from "react-i18next";
import { GeoProp } from "../types";

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const LimpetCatch: React.FunctionComponent<GeoProp> = (props) => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const metricGroup = project.getMetricGroup("limpetCatchAreaOverlap");
  const precalcMetrics = getPrecalcMetrics(
    metricGroup,
    "area",
    props.geographyId
  );

  const mapLabel = t("Map");
  const benthicLabel = t("Habitat Type");
  const areaWithin = t("Area Within Plan");
  const percAreaWithin = t("% Area Within Plan");
  const sqKmLabel = t("km²");
  const reportTitleLabel = t("Limpet Catch Areas");

  return (
    <>
      <ResultsCard
        title={reportTitleLabel}
        functionName="limpetCatchAreaOverlap"
        extraParams={{ geographyIds: [props.geographyId] }}
        useChildCard
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(
              singleMetrics,
              precalcMetrics,
              project.getMetricGroupPercId(metricGroup)
            ),
          ];

          return (
            <ToolbarCard
              title={reportTitleLabel}
              items={
                <LayerToggle
                  label={mapLabel}
                  layerId={metricGroup.layerId}
                  simple
                />
              }
            >
              <Trans i18nKey="Limpet Catch Areas Card">
                <p>
                  This report displays the amount of limpet catch areas which
                  overlap with your plan.
                </p>
              </Trans>
              <Translator>
                <ClassTable
                  rows={finalMetrics}
                  metricGroup={metricGroup}
                  columnConfig={[
                    {
                      columnLabel: benthicLabel,
                      type: "class",
                      width: 30,
                    },
                    {
                      columnLabel: areaWithin,
                      type: "metricValue",
                      metricId: metricGroup.metricId,
                      valueFormatter: (val: string | number) =>
                        Number.format(
                          Math.round(
                            squareMeterToKilometer(
                              typeof val === "string" ? parseInt(val) : val
                            )
                          )
                        ),
                      valueLabel: sqKmLabel,
                      width: 30,
                    },
                    {
                      columnLabel: percAreaWithin,
                      type: "metricChart",
                      metricId: project.getMetricGroupPercId(metricGroup),
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                        targetLabelPosition: "bottom",
                        targetLabelStyle: "tight",
                        barHeight: 11,
                      },
                      width: 30,
                      targetValueFormatter: (
                        value: number,
                        row: number,
                        numRows: number
                      ) => {
                        if (row === 0) {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")} ${t(
                              "Target"
                            )}`;
                        } else {
                          return (value: number) =>
                            `${valueFormatter(value / 100, "percent0dig")}`;
                        }
                      },
                    },
                    {
                      columnLabel: mapLabel,
                      type: "layerToggle",
                      width: 10,
                    },
                  ]}
                />
              </Translator>

              {isCollection && (
                <Collapse title={t("Show by MPA")}>
                  {genSketchTable(data, precalcMetrics, metricGroup)}
                </Collapse>
              )}

              <Collapse title={t("Learn more")}>
                <Trans i18nKey="Limpet Catch Card - learn more">
                  <p>
                    ℹ️ Overview: Limpets are a key species with known catch
                    areas around Graciosa. Plans should take into account the
                    impact of further protections in known limpet catch areas.
                  </p>
                  <p>
                    🎯 Planning Objective: No identified planning objectives for
                    limpet catch areas.
                  </p>
                  <p>
                    🗺️ Source Data: Regulamentos Pesca Areas Reserva Regime
                    Apanha Portaria
                  </p>
                  <p>
                    📈 Report: The percentage of each feature type within this
                    plan is calculated by finding the overlap of each feature
                    type with the plan, summing its area, then dividing it by
                    the total area of each feature type found within the
                    selected nearshore planning area. If the plan includes
                    multiple areas that overlap, the overlap is only counted
                    once.
                  </p>
                </Trans>
              </Collapse>
            </ToolbarCard>
          );
        }}
      </ResultsCard>
    </>
  );
};

const genSketchTable = (
  data: ReportResult,
  precalcMetrics: Metric[],
  metricGroup: MetricGroup
) => {
  // Build agg metric objects for each child sketch in collection with percValue for each class
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(
      data.metrics.filter((m) => m.metricId === metricGroup.metricId),
      childSketchIds
    ),
    precalcMetrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    metricGroup.classes,
    childSketches
  );
  return (
    <SketchClassTable rows={sketchRows} metricGroup={metricGroup} formatPerc />
  );
};
