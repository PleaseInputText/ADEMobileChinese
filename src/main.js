import "drag-drop-touch";
import "./shims";
import "./merge-globals";
import { browserCheck, init } from "./game";
import { DEV } from "./env";
import { watchLatestCommit } from "./commit-watcher";

if (browserCheck()) init();
if (DEV) watchLatestCommit();

if (typeof window !== "undefined") {
  window.addEventListener("contextmenu", e => {
    if (window.innerWidth <= 768 && !["INPUT", "TEXTAREA"].includes(e.target?.tagName) && !e.target?.isContentEditable) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener("touchend", e => {
    if (window.innerWidth <= 768 && e.target && (e.target.tagName === "BUTTON" || e.target.closest("button"))) {
      setTimeout(() => {
        if (document.activeElement && typeof document.activeElement.blur === "function") {
          document.activeElement.blur();
        }
      }, 50);
    }
  }, { passive: true });

  if (window.location.search.includes("unlockTabs")) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        if (typeof window.unlockAllTabs === "function") {
          window.unlockAllTabs();
        }
      }, 500);
    });
  }
}
