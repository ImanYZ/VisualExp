import { useEffect, useCallback } from "react";

const CSCObjLoader = (CSCObj, setCSCObj, setAllCountries) => {
  const loadCSCObj = useCallback(async () => {
    if (!CSCObj) {
      const cscObj = await import("country-state-city");
      setCSCObj(cscObj);
      setAllCountries(cscObj.Country.getAllCountries());
    }
  }, [CSCObj, setCSCObj, setAllCountries]);

  useEffect(() => {
    loadCSCObj();
  }, []);

  return loadCSCObj;
};

export default CSCObjLoader;
