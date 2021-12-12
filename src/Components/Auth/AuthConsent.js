import React from "react";

import Auth from "./Auth";
import ConsentDocument from "./ConsentDocument";

import "./ConsentDocument.css";

const AuthConsent = (props) => {
  return (
    <div id="App70">
      <ConsentDocument />
      <Auth {...props} />
    </div>
  );
};

export default AuthConsent;
