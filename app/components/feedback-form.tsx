"use client";

import { useState } from "react";
import { sourceRepo } from "../content";
import {
  EMPTY_FEEDBACK,
  FEEDBACK_KINDS,
  FEEDBACK_LIMITS,
  feedbackIssueUrl,
  feedbackKindBlurb,
  feedbackKindLabel,
  validateFeedback,
  type FeedbackErrors,
  type FeedbackInput,
} from "../lib/feedback";
import { Field } from "./field";
import { useLanguage } from "./language-provider";

/** Each kind's colour, from the site's tones: a bug warm, an idea purple, a muddle amber, praise green. */
const KIND_TONES: Record<(typeof FEEDBACK_KINDS)[number], string> = {
  bug: "tone-warn",
  idea: "tone-done",
  confusing: "tone-pick",
  praise: "tone-wa",
  other: "tone-work",
};

/**
 * One masukan, turned into a GitHub issue.
 *
 * Nothing is sent from here. Submitting opens GitHub's new-issue page in a new
 * tab with the template filled in from the form, and the person sends it from
 * their own account — see `feedbackIssueUrl`. The link stays on the page too,
 * in case the browser blocked the new tab.
 */
export function FeedbackForm() {
  const { locale, tx } = useLanguage();
  const [values, setValues] = useState<FeedbackInput>(EMPTY_FEEDBACK);
  const [errors, setErrors] = useState<FeedbackErrors>({});
  const [issueUrl, setIssueUrl] = useState<string | null>(null);

  function open(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: FeedbackInput = { kind: String(form.get("kind") ?? ""), message: String(form.get("message") ?? "") };
    const found = validateFeedback(input, locale);
    setValues(input);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const url = feedbackIssueUrl(input, { repo: sourceRepo, site: window.location.host, userAgent: navigator.userAgent });
    setIssueUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (issueUrl) {
    return (
      <div className="feedback-sent tone-wa" role="status">
        <h2>{tx("Tinggal satu langkah lagi di GitHub.", "One more step, on GitHub.")}</h2>
        <p>
          {tx(
            "Issue-nya sudah terisi di tab baru. Cek sekali lagi, lalu tekan Submit di sana. Balasan dan progresnya bisa kamu pantau di issue itu.",
            "The issue is filled in, in a new tab. Look it over, then press Submit there. Replies and progress show up on that issue.",
          )}
        </p>
        <p>
          <a href={issueUrl} target="_blank" rel="noopener noreferrer">
            {tx("Tab-nya tidak terbuka? Buka issue di GitHub", "No new tab? Open the issue on GitHub")}{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            setIssueUrl(null);
            setValues(EMPTY_FEEDBACK);
          }}
        >
          {tx("Tulis masukan lain", "Write another")}
        </button>
      </div>
    );
  }

  return (
    <form className="feedback-form" onSubmit={open} noValidate>
      {/* The shared radio-card shape, the same one the project kind uses: what
          separates these five is the sentence under each, and a dropdown hides
          exactly that. */}
      <div className={`type-picker ${errors.kind ? "has-error" : ""}`}>
        <p className="type-picker-label" id="feedback-kind-label">
          {tx("Ini soal apa?", "What is this about?")}
        </p>

        <ul className="type-choice" role="radiogroup" aria-labelledby="feedback-kind-label">
          {FEEDBACK_KINDS.map((kind) => (
            <li key={kind} className={KIND_TONES[kind]}>
              <label htmlFor={`kind-${kind}`}>
                <input id={`kind-${kind}`} type="radio" name="kind" value={kind} defaultChecked={values.kind === kind} />
                <span>
                  <strong>{feedbackKindLabel(kind, locale)}</strong>
                  <small>{feedbackKindBlurb(kind, locale)}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>

        {errors.kind ? (
          <p className="field-error" role="alert">
            {errors.kind}
          </p>
        ) : null}
      </div>

      <Field
        label={tx("Masukanmu", "Your feedback")}
        name="message"
        hint={tx(
          "Sebutkan halaman mana dan apa yang kamu lakukan sebelum itu—dari situ paling cepat ditelusuri. Baris pertama jadi judul issue.",
          "Say which page, and what you were doing just before. That is the fastest thing to trace from. The first line becomes the issue's title.",
        )}
        error={errors.message}
        defaultValue={values.message}
        rows={7}
        required
        minLength={FEEDBACK_LIMITS.message.min}
        maxLength={FEEDBACK_LIMITS.message.max}
        placeholder={tx(
          "Contoh: pas menyimpan profil, tombolnya berputar terus dan tidak ada pesan apa pun.",
          "For example: saving my profile spins forever and never says anything.",
        )}
      />

      <p className="hint">
        {tx(
          "Issue di GitHub bersifat publik dan butuh akun GitHub. Jangan tulis data pribadi atau celah keamanan di sini.",
          "GitHub issues are public and need a GitHub account. Do not include private data or security holes here.",
        )}
      </p>

      <button className="primary-button" type="submit">
        {tx("Lanjut ke GitHub", "Continue on GitHub")} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
