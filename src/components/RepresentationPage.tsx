import React from "react";
import { SDMCard } from "./SDMCard";
import { Geomorphology } from "./Geomorphology";
import Translator from "./TranslatorAsync";

const ReportPage = () => {
  return (
    <>
      <SDMCard />
      <Geomorphology />
    </>
  );
};

export default ReportPage;
