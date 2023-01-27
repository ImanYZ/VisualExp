import React from "react";
import { useRive } from "rive-react";


const RiveComponentExtended = ({ src, artboard, animations, autoplay }) => {
  const { RiveComponent } = useRive({
    src,
    artboard,
    animations,
    autoplay,
  });

  return <RiveComponent className={`rive-canvas `} />;
};
export const RiveComponentMemoized = React.memo(RiveComponentExtended);
