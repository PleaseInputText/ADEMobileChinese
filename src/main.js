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
}
