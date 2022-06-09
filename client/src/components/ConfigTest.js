import React from "react";
import {config} from "./tabsConfig";

export const data = () => {
  return (
    <>
      <div className="stock-container">
        {config.map((tabData) => {
          return (
            <div>
              {tabData.tabName}
            </div>
          );
        })}
      </div>
    </>
  );
};