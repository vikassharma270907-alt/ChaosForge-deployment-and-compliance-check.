import { execFile } from "node:child_process";
import { authorizeUrl } from "./auth.js";
import { loadEnv } from "./env.js";
import { app } from "./server.js";

const url = authorizeUrl();
const port = Number(loadEnv().PORT ?? 3000);
app.listen(port, "127.0.0.1", () => {
  console.log(url);
  console.log("Waiting for the Twitch callback at http://localhost:3000 …");
  if (process.platform === "win32") {
    execFile("cmd", ["/c", "start", "", url], { windowsHide: true });
  } else {
    console.log("Open the URL above in a browser to continue.");
  }
});
