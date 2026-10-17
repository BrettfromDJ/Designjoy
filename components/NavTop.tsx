"use client";

import { useEffect } from "react";

/**
 * Puts the nav at the top of the page and the ask box at the bottom (see
 * body[data-nav-top] in Nav.module.css and AskBox.module.css). The inline
 * script sets it before the page first paints, so neither jumps into place;
 * leaving the page puts them back.
 */
export function NavTop() {
  useEffect(() => {
    document.body.dataset.navTop = "";
    return () => {
      delete document.body.dataset.navTop;
    };
  }, []);
  return <script dangerouslySetInnerHTML={{ __html: 'document.body.dataset.navTop=""' }} />;
}
