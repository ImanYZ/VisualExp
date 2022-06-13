import { useEffect, useRef, useState } from "react";

export const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef(null);
  console.log("contREF", containerRef);
  const [isVisible, setIsVisible] = useState(false);

  const callbackFunction: IntersectionObserverCallback = entries => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      console.log("REF", containerRef.current);
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return [containerRef, isVisible];
};
