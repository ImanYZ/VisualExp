import { MutableRefObject, useEffect, useState } from "react";

export const useOnScreen = (ref: MutableRefObject<HTMLDivElement | null> | undefined, rootMargin = "0px") => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    if (!ref) {
      return;
    }
    const current = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin
      }
    );
    if (ref?.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (!current) {
        return;
      }
      console.log("current", current);
      observer.unobserve(current);
    };
  }, [ref, rootMargin]); // Empty array ensures that effect is only run on mount and unmount
  return isIntersecting;
};
