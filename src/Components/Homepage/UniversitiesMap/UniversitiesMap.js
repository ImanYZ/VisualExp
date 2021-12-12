import React, { useState, useEffect, Suspense } from "react";

import { useRecoilValue } from "recoil";

import { firebaseOnecademyState } from "../../../store/AuthAtoms";

import "./UniversitiesMap.css";

const GoogleMapCom = React.lazy(() => import("./GoogleMapCom"));

const UniversitiesMap = (props) => {
  const firebase = useRecoilValue(firebaseOnecademyState);
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      const institutionsCollection = await firebase.db
        .collection("institutions")
        .get();
      let institutionsDataList = [];
      institutionsCollection.docs.map((institution) => {
        const institutionInfo = institution.data();
        institutionsDataList.push(institutionInfo);
      });
      setInstitutions(institutionsDataList);
    };
    if (firebase) {
      fetchInstitutions();
    }
  }, [firebase]);

  // console.log(institutions);
  // // API KEY: AIzaSyAl1Lfmndsmvax6PZVH48nwV0kEaBOVgDE
  // const MyMapComponent = compose(
  //   withProps({
  //     googleMapURL:
  //       "https://maps.googleapis.com/maps/api/js?key=AIzaSyAl1Lfmndsmvax6PZVH48nwV0kEaBOVgDE&v=3.exp&libraries=geometry,drawing,places",
  //     loadingElement: <div style={{ height: `100%` }} />,
  //     containerElement: (
  //       <div
  //         style={{
  //           maxHeight: `698px`,
  //           maxWidth: `1251px`,
  //           width: `100%`,
  //           height: `100%`,
  //           margin: "0 auto",
  //         }}
  //       />
  //     ),
  //     mapElement: <div style={{ height: `100%` }} />,
  //   }),
  //   withScriptjs,
  //   withGoogleMap
  // )((props) => (
  //   <GoogleMap
  //     defaultOptions={{ styles: mapStyle }}
  //     defaultZoom={5}
  //     defaultCenter={{ lat: 39.3844014, lng: -98.4084011 }}
  //   >
  // {institutions.map((inst) => {
  //   return (
  //     <Marker
  //       key={inst.name}
  //       position={{ lat: inst.lat, lng: inst.lng }}
  //       icon={{ url: inst.logoURL, scaledSize: new window.google.maps.Size(40, 40) }}
  //     />
  //   );
  // })}
  //   </GoogleMap>
  // ));

  return (
    <div className="UniversitiesAndColleges" ref={props.schoolsRef}>
      <div id="reasonGradientText">Our Researchers Are From</div>
      <div id="googleMapDiv">
        {institutions.length > 0 ? (
          <Suspense fallback={<div></div>}>
            <GoogleMapCom institutions={institutions} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(UniversitiesMap);
