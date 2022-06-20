import React, { useState, useEffect } from "react";

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: `100%`,
  height: `50vh`,
  margin: "0 auto",
};

const center = {
  lat: 39.3844014,
  lng: -98.408401,
};

function GoogleMapCom(props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAl1Lfmndsmvax6PZVH48nwV0kEaBOVgDE",
  });
  const renderMap = () => {
    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4}
        options={{ mapId: "6422800f6b1b1ed4" }}
      >
        {props.institutions.map((inst) => {
          return (
            <Marker
              key={inst.name}
              position={{ lat: inst.lat, lng: inst.lng }}
              icon={{ url: inst.logoURL, scaledSize: new window.google.maps.Size(40, 40) }}
            />
          );
        })}
      </GoogleMap>
    );
  };

  return isLoaded ? renderMap() : <></>;

  //   return (
  //     <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
  //       {props.institutions.map((inst) => {
  //         return (
  //           <Marker
  //             key={inst.name}
  //             position={{ lat: inst.lat, lng: inst.lng }}
  //             icon={{ url: inst.logoURL, scaledSize: new window.google.maps.Size(40, 40) }}
  //           />
  //         );
  //       })}
  //       <></>
  //     </GoogleMap>
  //   );
}

export default React.memo(GoogleMapCom);
