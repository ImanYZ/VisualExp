import { useCallback, useEffect, useRef, useState } from "react";

export const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef(null);
  const [isVisible] = useState(false);

  // const callbackFunction: IntersectionObserverCallback = (entries) => {
  //   console.log('entries:', entries)
  //   const [entry] = entries
  //   setIsVisible(entry.isIntersecting)
  // }

  const rr = useCallback(
    (res: any) => {
      console.log("res", res);
      return res;
    },
    [containerRef]
  );

  const r = rr(containerRef);

  useEffect(() => {
    console.log("useEffect...", containerRef, r);

    const observer = new IntersectionObserver(([e]) => {
      console.log("it works", e);
    }, options);
    if (r.current) {
      console.log("exist current");
      observer.observe(r.current);
    }

    return () => {
      if (r.current) observer.unobserve(r.current);
    };
  });

  return { containerRef, isVisible };
};
