import assert from "node:assert/strict";
import test from "node:test";

import {
  FEEDBACK_KINDS,
  FEEDBACK_LIMITS,
  feedbackIssueUrl,
  feedbackKindLabel,
  isFeedbackKind,
  validateFeedback,
} from "../app/lib/feedback.ts";

const usable = { kind: "bug", message: "Menyimpan profil berputar terus dan tidak ada pesan apa pun." };

test("a kind and a message are all that is asked for", () => {
  assert.deepEqual(validateFeedback(usable), {});
  assert.ok(validateFeedback({ ...usable, kind: "" }).kind);
  assert.ok(validateFeedback({ ...usable, message: "" }).message);
});

test("a kind the column would refuse never reaches it", () => {
  assert.ok(validateFeedback({ ...usable, kind: "keluhan" }).kind);
  for (const kind of FEEDBACK_KINDS) {
    assert.deepEqual(validateFeedback({ ...usable, kind }), {}, `${kind} harus diterima`);
  }
});

test("one word is not a report anybody can act on", () => {
  assert.ok(validateFeedback({ ...usable, message: "error" }).message);
  assert.deepEqual(validateFeedback({ ...usable, message: "a".repeat(FEEDBACK_LIMITS.message.min) }), {});
});

test("the message has a ceiling", () => {
  assert.ok(validateFeedback({ ...usable, message: "a".repeat(FEEDBACK_LIMITS.message.max + 1) }).message);
  assert.deepEqual(validateFeedback({ ...usable, message: "a".repeat(FEEDBACK_LIMITS.message.max) }), {});
});

test("surrounding whitespace is not what makes a message long enough", () => {
  assert.ok(validateFeedback({ ...usable, message: `   ${"a".repeat(FEEDBACK_LIMITS.message.min - 1)}   ` }).message);
});

test("every kind reads as a sentence in both languages", () => {
  for (const kind of FEEDBACK_KINDS) {
    assert.ok(isFeedbackKind(kind));
    assert.ok(feedbackKindLabel(kind, "id"));
    assert.ok(feedbackKindLabel(kind, "en"));
  }
  assert.equal(feedbackKindLabel("keluhan", "id"), "");
});

const origin = { repo: "swegrowthid/builders", site: "builders.swegrowth.id", userAgent: "Safari 20, macOS" };
const issue = (input) => new URL(feedbackIssueUrl(input, origin));

test("a bug opens the bug template with what happened and where", () => {
  const url = issue(usable);
  assert.equal(url.origin + url.pathname, "https://github.com/swegrowthid/builders/issues/new");
  assert.equal(url.searchParams.get("template"), "bug_report.yml");
  assert.equal(url.searchParams.get("title"), `[Bug]: ${usable.message}`);
  assert.equal(url.searchParams.get("summary"), usable.message);
  assert.equal(url.searchParams.get("site"), "builders.swegrowth.id");
  assert.equal(url.searchParams.get("environment"), "builders.swegrowth.id\nSafari 20, macOS");
});

test("every kind lands in a template that exists, with the message in its field", () => {
  const fields = { idea: ["feature_request.yml", "problem"], confusing: ["feedback.yml", "feedback"], praise: ["feedback.yml", "feedback"], other: ["feedback.yml", "feedback"] };
  for (const [kind, [template, field]] of Object.entries(fields)) {
    const url = issue({ ...usable, kind });
    assert.equal(url.searchParams.get("template"), template, kind);
    assert.equal(url.searchParams.get(field), usable.message, kind);
  }
});

test("the title is the first line, cut short; the body keeps everything", () => {
  const message = `\n  ${"Judul yang sangat panjang ".repeat(5)}\nBaris kedua dengan detail.`;
  const url = issue({ kind: "idea", message });
  const title = url.searchParams.get("title");
  assert.ok(title.startsWith("[Idea]: Judul yang sangat panjang"));
  assert.ok(title.endsWith("…"));
  assert.ok(title.length <= "[Idea]: ".length + 72);
  assert.equal(url.searchParams.get("problem"), message.trim());
});

test("the longest message still makes a link GitHub accepts", () => {
  const url = feedbackIssueUrl({ kind: "bug", message: "é ".repeat(FEEDBACK_LIMITS.message.max) }, origin);
  assert.ok(url.length < 8000, `${url.length} characters`);
});
