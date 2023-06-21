import React from "react";
import {
  Collapse,
  ResultsCard,
  useSketchProperties,
  KeySection,
  InfoStatus,
} from "@seasketch/geoprocessing/client-ui";
import { ClassTable } from "../util/ClassTable";
import {
  ReportResult,
  ReportResultBase,
  toPercentMetric,
  percentWithEdge,
} from "@seasketch/geoprocessing/client-core";

import totals from "../../data/bin/ousDemographicPrecalcTotals.json";
import project from "../../project";
const precalcTotals = totals as ReportResultBase;

const Number = new Intl.NumberFormat("en", { style: "decimal" });

const overallMetricGroup = project.getMetricGroup(
  "ousOverallDemographicOverlap"
);
const sectorMetricGroup = project.getMetricGroup("ousSectorDemographicOverlap");
const islandMetricGroup = project.getMetricGroup("ousIslandDemographicOverlap");
const gearMetricGroup = project.getMetricGroup("ousGearDemographicOverlap");

const METRIC_ID = "ousPeopleCount";
const PERC_METRIC_ID = `${overallMetricGroup.metricId}Perc`;
const TOTAL_METRIC_ID = `${overallMetricGroup.metricId}Total`;

export const OusDemographics = () => {
  return (
    <>
      <ResultsCard
        title="Ocean Use Demographics"
        functionName="ousDemographicOverlap"
      >
        {(data: ReportResult) => {
          // Filter down to people count metrics for top-level sketch
          const singlePeopleCountMetrics = data.metrics.filter(
            (m) =>
              m.sketchId === data.sketch.properties.id &&
              m.metricId &&
              m.metricId === "ousPeopleCount"
          );

          const singlePeopleTotalCountMetrics = precalcTotals.metrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          );

          const singlePeopleTotalCountMetric = precalcTotals.metrics.find(
            (m) => m.classId === "ousPeopleCount_all"
          );
          if (!singlePeopleTotalCountMetric)
            throw new Error("Expected to find total people count metric");
          const singlePeopletotalCountFormatted = Number.format(
            singlePeopleTotalCountMetric.value as number
          );

          const singlePeopleCountMetric = singlePeopleCountMetrics.find(
            (m) => m.classId === "ousPeopleCount_all"
          );
          if (!singlePeopleCountMetric)
            throw new Error("Expected to find sketch people count metric");
          const singlePeopleCountFormatted = Number.format(
            singlePeopleCountMetric.value as number
          );

          const singlePeopleCountPercMetric = toPercentMetric(
            [singlePeopleCountMetric],
            singlePeopleTotalCountMetrics
          )[0];
          if (!singlePeopleCountPercMetric)
            throw new Error(
              "Expected to find sketch people count total metric"
            );
          const singlePeopleCountPercFormatted = percentWithEdge(
            singlePeopleCountPercMetric.value
          );

          const singleFullMetrics = [
            ...singlePeopleCountMetrics,
            ...toPercentMetric(
              singlePeopleCountMetrics,
              singlePeopleTotalCountMetrics,
              PERC_METRIC_ID
            ),
          ];

          const sectorClassIds = sectorMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const sectorTotalMetrics = singlePeopleTotalCountMetrics
            .filter((m) => m.classId && sectorClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const sectorMetrics = singleFullMetrics
            .filter((m) => m.classId && sectorClassIds.includes(m.classId))
            .concat(sectorTotalMetrics);
          const numSectors = sectorMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numSectorsFormatted = Number.format(numSectors);

          const islandClassIds = islandMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const islandTotalMetrics = singlePeopleTotalCountMetrics
            .filter((m) => m.classId && islandClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const islandMetrics = singleFullMetrics
            .filter((m) => m.classId && islandClassIds.includes(m.classId))
            .concat(islandTotalMetrics);
          const numIslands = islandMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numIslandsFormatted = Number.format(numIslands);

          const gearClassIds = gearMetricGroup.classes.map(
            (curClass) => curClass.classId
          );
          const gearTotalMetrics = singlePeopleTotalCountMetrics
            .filter((m) => m.classId && gearClassIds.includes(m.classId))
            .map((m) => ({ ...m, metricId: TOTAL_METRIC_ID }));
          const gearMetrics = singleFullMetrics
            .filter((m) => m.classId && gearClassIds.includes(m.classId))
            .concat(gearTotalMetrics);
          const numGears = gearMetrics.filter(
            (m) => m.metricId === "ousPeopleCount"
          ).length;
          const numGearsFormatted = Number.format(numGears);

          return (
            <>
              <InfoStatus
                size={32}
                msg={
                  <span>
                    This is a <b>draft</b> report. Further changes or
                    corrections may be made. Please report any issues. Survey
                    results last updated: 6/20/2023
                  </span>
                }
              />
              <p>
                This report summarizes the people that use the ocean within this
                nearshore plan, as represented by the Ocean Use Survey. Plans
                should consider the potential benefits and impacts to these
                people if access or activities are restricted.
              </p>
              <KeySection>
                <b>{singlePeopleCountFormatted}</b> of the{" "}
                <b>{singlePeopletotalCountFormatted}</b> people represented by
                this survey use the ocean within this plan. This is{" "}
                <b>{singlePeopleCountPercFormatted}</b> of the total people
                represented. They come from <b>{numIslandsFormatted} islands</b>{" "}
                across{" "}
                <b>
                  {numSectorsFormatted} sector
                  {numSectors > 1 ? "s" : ""}
                </b>
                . Those that fish within this plan use{" "}
                <b>{numGearsFormatted} gear types</b>.
              </KeySection>

              <p>
                What follows is a breakdown of the number of people represented{" "}
                <b>by sector</b>.
              </p>
              <ClassTable
                rows={sectorMetrics}
                metricGroup={sectorMetricGroup}
                columnConfig={[
                  {
                    columnLabel: "Sector",
                    type: "class",
                    width: 30,
                  },
                  {
                    columnLabel: "Total People Represented In Survey",
                    type: "metricValue",
                    metricId: TOTAL_METRIC_ID,
                    valueFormatter: (value) => Number.format(value as number),
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 20,
                    colStyle: { textAlign: "right" },
                  },
                  {
                    columnLabel: "People Using Ocean Within Plan",
                    type: "metricValue",
                    metricId: METRIC_ID,
                    valueFormatter: (value) => Number.format(value as number),
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 20,
                    colStyle: { textAlign: "right" },
                  },
                  {
                    columnLabel: "% People Using Ocean Within Plan",
                    type: "metricChart",
                    metricId: PERC_METRIC_ID,
                    valueFormatter: "percent",
                    chartOptions: {
                      showTitle: true,
                    },
                    width: 30,
                  },
                ]}
              />

              <Collapse title="Show by Gear Type (Commercial Fishing)">
                <p>
                  The following is a breakdown of gear types used by commercial
                  fishers and how specific gear type usage may be impacted by
                  the plan.
                </p>
                <p>
                  Note that commercial fishers can and did report multiple gear
                  types within each of their areas, so these gear type totals
                  <i> do not</i> sum to the total number of respondents above.
                </p>

                <ClassTable
                  rows={gearMetrics}
                  metricGroup={gearMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: "Gear Type",
                      type: "class",
                      width: 30,
                      colStyle: { textAlign: "left" },
                    },
                    {
                      columnLabel: "Total People Represented In Survey",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "People Using Gear Type Within Plan",
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 20,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "% People Using Gear Type Within Plan",
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 30,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title="Show by Island (All Sectors)">
                <p>
                  The following is a breakdown of the number of people
                  represented that use the ocean within this nearshore plan{" "}
                  <b>by island</b>.
                </p>
                <ClassTable
                  rows={islandMetrics}
                  metricGroup={islandMetricGroup}
                  columnConfig={[
                    {
                      columnLabel: "Island",
                      type: "class",
                      width: 20,
                      colStyle: { textAlign: "left" },
                    },
                    {
                      columnLabel: "Total People Represented In Survey",
                      type: "metricValue",
                      metricId: TOTAL_METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 25,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "People Using Ocean Within Plan",
                      type: "metricValue",
                      metricId: METRIC_ID,
                      valueFormatter: (value) => Number.format(value as number),
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 25,
                      colStyle: { textAlign: "right" },
                    },
                    {
                      columnLabel: "% People Using Ocean Within Plan",
                      type: "metricChart",
                      metricId: PERC_METRIC_ID,
                      valueFormatter: "percent",
                      chartOptions: {
                        showTitle: true,
                      },
                      width: 30,
                    },
                  ]}
                />
              </Collapse>

              <Collapse title="Learn more">
                <p>
                  ℹ️ Overview: an Ocean Use Survey was conducted that identified
                  who is using the ocean, and where they are using it.
                </p>
                <p>
                  This report provides a breakdown of the people that use the
                  ocean within this plan, by sector, gear type, and island.
                </p>
                <p>
                  Note, this report is only representative of the individuals
                  that were surveyed and the number of people they were said to
                  represent.
                </p>
                <p>
                  🎯 Planning Objective: there is no specific objective/target
                  for limiting the potential impact to groups of people.
                </p>
                <p>
                  📈 Report: Percentages are calculated by summing the number of
                  people that use the ocean within the boundaries of this plan
                  for each sector and dividing it by the total number of people
                  that use the ocean within the sector.
                </p>
              </Collapse>
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};
