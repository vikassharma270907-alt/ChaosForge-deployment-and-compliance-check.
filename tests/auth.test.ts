import assert from "node:assert/strict";
import test from "node:test";
import { authorizeUrl, REQUIRED_SCOPES, TWITCH_CLIENT_ID } from "../src/auth.js";

test("login URL uses the registered client and required scopes", () => {
  const url = authorizeUrl();
  assert.match(url, new RegExp(`client_id=${TWITCH_CLIENT_ID}`));
  for (const scope of REQUIRED_SCOPES) assert.match(url, new RegExp(scope.replace(":", ":")));
  assert.match(url, /redirect_uri=http:\/\/localhost:3000/);
});
