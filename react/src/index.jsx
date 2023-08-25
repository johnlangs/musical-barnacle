import React from "react";
import ReactDOM from "react-dom";
import '@radix-ui/themes/styles.css';
import "./index.css";
import MyApp from "./MyApp";
import { Theme } from '@radix-ui/themes';


ReactDOM.render(
  <React.StrictMode>
      <Theme>
        <MyApp></MyApp>
      </Theme>
  </React.StrictMode>,
  document.getElementById("root")
);
