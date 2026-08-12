"use client";

import { useSyncExternalStore } from "react";

/**
 * Renders the current calendar year without a hydration mismatch.
 *
 * `new Date().getFullYear()` at render time is a hydration hazard: the statically
 * prerendered HTML is generated on the build machine, while hydration re-evaluates
 * on the visitor's clock. Near a year boundary (or across timezones) the two
 * disagree and React throws a hydration error.
 *
 * useSyncExternalStore is the canonical fix: the server snapshot (null) is used
 * for both SSR HTML and the hydration pass, so markup always matches; only after
 * hydration does React switch to the client snapshot (the real year).
 */
const CURRENT_YEAR = new Date().getFullYear();
const emptySubscribe = () => () => {};

export default function FooterYear() {
  const year = useSyncExternalStore(
    emptySubscribe,
    () => CURRENT_YEAR,
    () => null
  );

  return <>{year ?? ""}</>;
}
