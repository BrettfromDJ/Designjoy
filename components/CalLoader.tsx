"use client";

import { useEffect } from "react";
import { loadCal } from "@/lib/cal";

/** Loads the booking pop-up so any button with `calTrigger` opens it. */
export function CalLoader() {
  useEffect(() => {
    loadCal();
  }, []);
  return null;
}
