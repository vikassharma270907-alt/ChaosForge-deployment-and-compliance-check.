import assert from "node:assert/strict";
import test from "node:test";
import { deckPage, homePage, overlayPage } from "../src/pages.js";

test("overlay page is transparent, canvas-based, and enables demo mode", () => {
  const page = overlayPage(true);
  assert.match(page, /background:transparent/);
  assert.match(page, /<canvas id="arena"/);
  assert.match(page, /data-demo="true"/);
});

test("deck page presents the OBS source guidance", () => {
  assert.match(deckPage(true), /1920×1080 OBS Browser Source/);
});

test("home page provides portal navigation links and handles twitch oauth callback", () => {
  const page = homePage();
  assert.match(page, /ChaosForge/);
  assert.match(page, /\/deck\?mode=demo/);
  assert.match(page, /\/overlay\?mode=demo/);
  assert.match(page, /oauth-view/);
  assert.match(page, /portal-view/);
  assert.match(page, /access_token/);
});
