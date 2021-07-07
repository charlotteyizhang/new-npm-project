import React from "react";
import { css } from "@emotion/css";
import { themeSpacing } from "../basicStyle/spacing";
import LineGraph from "../img/LineGraph.png";
import Pointer from "../img/Pointer.svg";
import NonRenewKey from "../img/NonRenewKey.svg";
import RenewKey from "../img/RenewKey.svg";

export const LineForecast = () => {
  return (
    <div className={styles.forecast}>
      <h2>Carbon intensity forecast</h2>
      <hr></hr>
      <div className={styles.linegraph}>
        <img src={LineGraph} alt="line graph" />
        <div className={styles.keys}>
          <div className={styles.key}>
            <img src={RenewKey} alt="renewable fuel key" />
            <p>Renewable Energy Intensity</p>
          </div>
          <div className={styles.key}>
            <img src={NonRenewKey} alt="non renewable fuel key" />
            <p>Non-Renewable Energy Intensity</p>
          </div>
          <div className={styles.key}>
            <img src={Pointer} alt="current fuel pointer" />
            <p>Current Carbon Intensity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  forecast: css({
    backgroundColor: "white",
    border: "1px solid #E8E8E8",
    flex: 1,
    padding: "1rem",
    h2: {
      color: "#555761",
      marginBottom: "0.5rem",
    },
    hr: {
      color: "#39393B",
      opacity: "0.3",
    },
  }),
  linegraph: css({
    display: "flex",
    flexDirection: "row",
    paddingRight: themeSpacing.default,
    img: {
      width: "60%",
    },
  }),
  keys: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: themeSpacing.default,
    paddingLeft: themeSpacing.default,
    img: {
      width: "30px",
      height: "30px",
    },
  }),
  key: css({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    p: {
      fontSize: "14px",
      paddingLeft: themeSpacing.default,
    },
  }),
};
