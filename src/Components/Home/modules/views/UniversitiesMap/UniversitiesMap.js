import React, { useState, useEffect, Suspense } from "react";



import "./UniversitiesMap.css";
import { Box } from "@mui/material";
import { firebaseOne } from "../../../../firebase/firebase";
import { useInView } from "../../hooks/useObserver";

const GoogleMapCom = React.lazy(() => import("./GoogleMapCom"));

const UniversitiesMap = props => {
  const { db } = firebaseOne;
  const [institutions, setInstitutions] = useState([]);
  const { inViewOnce: universityMapInViewOnce, ref: universityMapRef } = useInView();

  useEffect(() => {
    const fetchInstitutions = async () => {
      const institutionsCollection = await db.collection("institutions").where("hasLogo", "==", true).get();
      let institutionsDataList = [];
      institutionsCollection.docs.forEach(institution => {
        const institutionInfo = institution.data();
        institutionsDataList.push(institutionInfo);
      });
      setInstitutions(institutionsDataList);
    };
    if (firebaseOne) {
      fetchInstitutions();
    }
  }, [db]);

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
    <Box
      id="SchoolsSection"
      ref={universityMapRef}
      className={universityMapInViewOnce ? "slide-bottom-top" : "hide"}
      component="section"
      sx={{ minHeight: 400 }}
    >
      <div className="UniversitiesAndColleges" ref={props.schoolsRef}>
        {/* <Typography
          variant="h4"
          marked="center"
          align="center"
          component="h2"
          sx={{ mb: 7, color: "#f8f8f8" }}
        >
          Our Researchers Are From
        </Typography> */}
        <div id="googleMapDiv">
          {institutions.length > 0 ? (
            <Suspense fallback={<div></div>}>
              <GoogleMapCom institutions={institutions} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </Box>
  );
};

export default React.memo(UniversitiesMap);
