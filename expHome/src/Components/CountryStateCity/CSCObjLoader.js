

const CSCObjLoader = async  (CSCObj, setCSCObj, setAllCountries) => {

    if (!CSCObj) {
      const cscObj = await import("country-state-city");
      setCSCObj(cscObj);
      setAllCountries(cscObj.Country.getAllCountries());
    }



};

export default CSCObjLoader;
