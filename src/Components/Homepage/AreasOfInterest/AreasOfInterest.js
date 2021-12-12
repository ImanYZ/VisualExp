import React, {useEffect, useState} from "react";
import SlidesShow from "./SlidesShow"

import "./AreasOfInterest.css";
import SlidesShowMobile from "./SlidesShowMobile";

const AreasOfInterest = (props) => { 
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(()=>{
    window.innerWidth<900? setIsMobile(true) : setIsMobile(false);
  },[])
  
  return(
        <> 
          <p className="headline">1Cademy has knowledge maps for more than</p> 
          <p className="gradientText">20 different areas of interest</p>
          {isMobile? 
            <SlidesShowMobile  theme={props.theme} />
            :<SlidesShow theme={props.theme} /> 
           }
        </>
  )};

export default React.memo(AreasOfInterest);
