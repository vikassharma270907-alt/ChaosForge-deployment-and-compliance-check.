import { execFile } from "node:child_process";
import { authorizeUrl } from "./auth.js";

const url = authorizeUrl();
console.log(url);
if (process.platform === "win32") {
  execFile("cmd", ["/c", "start", "", url], { windowsHide: true });
} else {
  console.log("Open the URL above in a browser to continue.");
}
