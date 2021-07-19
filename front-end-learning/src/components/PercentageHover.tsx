import React, { useState, useEffect } from "react";
import { css } from "@emotion/css";
import { themeSpacing } from "../basicStyle/spacing";
import { Biomass } from "../img/fuelIcons/Biomass";
import { Hydro } from "../img/fuelIcons/Hydro";
import { Wind } from "../img/fuelIcons/Wind";
import { Solar } from "../img/fuelIcons/Solar";
import { Coal } from "../img/fuelIcons/Coal";
import { Gas } from "../img/fuelIcons/Gas";
import { Imports } from "../img/fuelIcons/Imports";
import { Nuclear } from "../img/fuelIcons/Nuclear";
import { Others } from "../img/fuelIcons/Others";

export interface FuelPercentage {
  biomass: number;
  hydro: number;
  solar: number;
  wind: number;
  coal: number;
  gas: number;
  imports: number;
  nuclear: number;
  other: number;
}

export const fuelTypeOrder: Array<FuelType> = [
  "biomass",
  "hydro",
  "wind",
  "solar",
  "coal",
  "gas",
  "imports",
  "nuclear",
  "other",
];

type FuelType = keyof FuelPercentage;

export const fuelDetailsFromFuelType: Record<
  FuelType,
  { title: string; color: string; Icon: (props: any) => JSX.Element }
> = {
  biomass: { title: "Biomass", color: "#78D5C6", Icon: Biomass },
  hydro: { title: "Hydro", color: "#40C1AC", Icon: Hydro },
  solar: { title: "Solar", color: "#259482", Icon: Solar },
  wind: { title: "Wind", color: "#216056", Icon: Wind },
  coal: { title: "Coal", color: "#F79CAB", Icon: Coal },
  gas: { title: "Gas", color: "#EE8092", Icon: Gas },
  imports: { title: "Imports", color: "#F1566F", Icon: Imports },
  nuclear: { title: "Nuclear", color: "#D22949", Icon: Nuclear },
  other: { title: "Other", color: "#BA0C2F", Icon: Others },
};

// FuelPercentage consists of name and number, need to implement this...
export const percentageFromData = (data: any): FuelPercentage => {
  return Object.fromEntries(
    data.data.generationmix.map((item: any) => [item.fuel, item.perc])
  ) as any;
};

// const onMouseMove = (e: any) => {
//   const x = `${e.clientY + 20}px`;
//   const y = `${e.clientX + 20}px`;
// };

// window.onmousemove = (e) => {
//   var x = e.clientX;
//   var y = e.clientY;
// };

export interface PercHoverProps {
  title: string;
  value: string;
}

export const PercentageHover = ({ title, value }: PercHoverProps) => {
  return (
    <div className={styles.hoverBackground}>
      <p>
        {title} : {value}
      </p>
    </div>
  );
};

const styles = {
  hoverBackground: css({
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "17%",
    height: "2rem",
    border: "1px solid #E8E8E8",
    borderRadius: "5px",
    position: "absolute",
    left: "40%",
    top: "9.5%",
  }),
};
