import {
  useEffect,
  useRef,
  type EffectCallback,
  type DependencyList,
} from "react";

/**
 * useUpdateEffect
 * Like useEffect, but skips the first render.
 */
export function useUpdateEffect(
  effect: EffectCallback,
  deps: DependencyList,
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
