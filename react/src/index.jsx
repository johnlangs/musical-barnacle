import React from "react";
import ReactDOM from "react-dom";
import "./index.css"
import MyApp from "./myApp";
import '@radix-ui/themes/styles.css';


ReactDOM.render(
  <React.StrictMode>
    <MyApp></MyApp>
  </React.StrictMode>,
  document.getElementById("root")
);
