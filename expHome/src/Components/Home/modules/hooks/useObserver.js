import * as React from 'react';

const useInViewInitialValue = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
}

export function useInView({ options } = { options: useInViewInitialValue }) {
    const [ref, setRef] = React.useState(null);
    // const callback = React.useRef < IntersectionOptions['onChange'] > ();
    const [state, setState] = React.useState({
        inView: false,
        inViewOnce: false,
        entry: undefined,
    });

    // Store the onChange callback in a `ref`, so we can access the latest instance
    // inside the `useEffect`, but without triggering a rerender.
    // callback.current = onChange;

    React.useEffect(
        () => {
            if (!ref) return;

            console.log('useEffect')
            const observe = new IntersectionObserver((entries) => {
                console.log('useObserve:', { entries })
                entries.forEach((entry) => {
                    // While it would be nice if you could just look at isIntersecting to determine if the component is inside the viewport, browsers can't agree on how to use it.
                    // -Firefox ignores `threshold` when considering `isIntersecting`, so it will never be false again if `threshold` is > 0
                    const inView =
                        entry.isIntersecting /* &&
                        thresholds.some((threshold) => entry.intersectionRatio >= threshold); */


                    // // @ts-ignore support IntersectionObserver v2
                    // if (props.options.trackVisibility && typeof entry.isVisible === 'undefined') {
                    //     // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
                    //     // @ts-ignore
                    //     entry.isVisible = inView;
                    // }

                    setState(prev => ({ inView, entry, inViewOnce: prev.inViewOnce || inView }))
                });
            }, options);

            observe.observe(ref)

            return () => {
                if (observe) {
                    observe.unobserve(ref)
                    observe.disconnect()
                }
            };
        },
        [options, ref],
    );

    const tt = React.useCallback((e) => {
        console.log('tt', e)
        setRef(e)
    }, [])


    return { ref: tt, inView: state.inView, inViewOnce: state.inViewOnce, entry: state.entry }
}