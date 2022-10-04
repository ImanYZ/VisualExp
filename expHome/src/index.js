import React from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router } from "react-router-dom";

import AppRouter from "./AppRouter";
import reportWebVitals from "./reportWebVitals";

import "./index.css";
import 'react-querybuilder/dist/query-builder.css';

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Router>
        <AppRouter />
      </Router>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
