import { useCallback, useState } from "react";

export const useElementOnScreen = (options: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);

  const containerRefCallback = useCallback(
    (node: any) => {
      const observer = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, options);

      if (node) {
        observer.unobserve(node);
        observer.observe(node);
      }
    },
    [options]
  );

  return { containerRefCallback, isVisible };
};
