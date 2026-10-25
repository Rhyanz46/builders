import assert from "node:assert/strict";
import test from "node:test";

import { SITE, builderUrl, isOss, site, siteFrom, siteUrlFor } from "../app/lib/site.ts";

test("only an explicit oss is the open source site; anything else is builders", () => {
  assert.equal(siteFrom("oss"), "oss");
  assert.equal(siteFrom("builders"), "builders");
  assert.equal(siteFrom(undefined), "builders");
  assert.equal(siteFrom("OSS"), "builders");
});

test("each site has its own canonical origin unless one is configured", () => {
  assert.equal(siteUrlFor("builders", undefined), "https://builders.swegrowth.id");
  assert.equal(siteUrlFor("oss", ""), "https://oss.swegrowth.id");
  assert.equal(siteUrlFor("oss", " https://oss.example.test/ "), "https://oss.example.test");
});

test("with no site configured, this build is builders, as it always was", () => {
  assert.equal(SITE, "builders");
  assert.equal(isOss, false);
  assert.equal(site.name, "Builders");
});

test("links out to the builders site are absolute", () => {
  assert.equal(builderUrl("/new"), `${site.url}/new`);
  assert.equal(builderUrl("projects/x"), `${site.url}/projects/x`);
});
