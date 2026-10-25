"use client";

import { useActionState, useState } from "react";
import { sendFeedback, type FeedbackState } from "../actions";
import {
  EMPTY_FEEDBACK,
  FEEDBACK_KINDS,
  FEEDBACK_LIMITS,
  feedbackKindBlurb,
  feedbackKindLabel,
} from "../lib/feedback";
import { Field } from "./field";
import { useLanguage } from "./language-provider";

const EMPTY: FeedbackState = { errors: {}, values: EMPTY_FEEDBACK };

/**
 * One masukan, sent and then done with.
 *
 * `useActionState` has no reset, and a form that keeps the sent message in its
 * boxes reads as a send that did not happen — so a finished round is thrown
 * away by remounting rather than cleared field by field. Each round gets its
 * own action state, and "kirim lagi" starts an empty one.
 */
export function FeedbackForm() {
  const [round, setRound] = useState(0);
  return <FeedbackRound key={round} onAgain={() => setRound((n) => n + 1)} />;
}

/** Each kind's colour, from the site's tones: a bug warm, an idea purple, a muddle amber, praise green. */
const KIND_TONES: Record<(typeof FEEDBACK_KINDS)[number], string> = {
  bug: "tone-warn",
  idea: "tone-done",
  confusing: "tone-pick",
  praise: "tone-wa",
  other: "tone-work",
};

function FeedbackRound({ onAgain }: { onAgain: () => void }) {
  const [state, formAction, pending] = useActionState(sendFeedback, EMPTY);
  const { locale, tx } = useLanguage();
  const { errors, values } = state;

  if (state.sent) {
    return (
      <div className="feedback-sent tone-wa" role="status">
        <h2>{tx("Makasih, masukanmu sudah masuk.", "Thank you — your feedback is in.")}</h2>
        <p>
          {tx(
            "Dibaca satu per satu. Kalau kamu meninggalkan email, balasannya ke sana; kalau tidak, masukanmu tetap terhitung.",
            "Every one of these is read. If you left an email, the reply goes there; if you did not, it still counts.",
          )}
        </p>
        <button type="button" onClick={onAgain}>
          {tx("Kirim masukan lagi", "Send another")}
        </button>
      </div>
    );
  }

  return (
    <form className="feedback-form" action={formAction}>
      {errors.form ? (
        <p className="form-error" role="alert">
          {errors.form}
        </p>
      ) : null}

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
                <input
                  id={`kind-${kind}`}
                  type="radio"
                  name="kind"
                  value={kind}
                  defaultChecked={values.kind === kind}
                />
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
          "Sebutkan halaman mana dan apa yang kamu lakukan sebelum itu—dari situ paling cepat ditelusuri.",
          "Say which page, and what you were doing just before. That is the fastest thing to trace from.",
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

      <Field
        label={tx("Email buat dibalas", "An email to reply to")}
        name="contact"
        hint={tx(
          "Opsional. Kosongkan kalau kamu tidak butuh balasan—masukannya tetap dibaca.",
          "Optional. Leave it blank if you do not need a reply — it is read either way.",
        )}
        error={errors.contact}
        defaultValue={values.contact}
        type="email"
        maxLength={FEEDBACK_LIMITS.contact.max}
        placeholder="nama@email.com"
      />

      <button className="primary-button" type="submit" disabled={pending} aria-busy={pending || undefined}>
        {pending ? tx("Mengirim…", "Sending…") : tx("Kirim masukan", "Send feedback")}
      </button>
    </form>
  );
}
