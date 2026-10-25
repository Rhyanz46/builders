"use client";

import { useActionState, useRef, useState } from "react";
import { updateProject, type EditState } from "../actions";
import { MAXIMUM } from "../lib/brief";
import { STAGES, stageBlurb, stageLabel, type Stage } from "../lib/stages";
import { Field } from "./field";
import { ProjectTypePicker } from "./project-type-picker";
import { TopicPicker } from "./topic-picker";
import { GitHubImport } from "./github-import";
import { useLanguage } from "./language-provider";

export type EditableProject = {
  slug: string;
  title: string;
  tagline: string;
  /** Why it is worth a look, in the owner's words. Empty until they say. */
  highlight: string;
  problem: string;
  solution: string;
  audience: string;
  tags: string[];
  /** One of PROJECT_TYPES, or empty on a project made before it was asked. */
  projectType: string;
  nowText: string;
  docUrl: string;
  repoUrl: string;
  openForGitHubContributions: boolean;
  liveUrl: string;
  logoUrl: string;
  stage: Stage;
};

export function EditForm({ project }: { project: EditableProject }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [stage, setStage] = useState<Stage>(project.stage);
  const [openForGitHubContributions, setOpenForGitHubContributions] = useState(
    project.openForGitHubContributions,
  );
  const initial: EditState = {
    errors: {},
    values: {
      ...project,
      tags: project.tags.join(", "),
      now: project.nowText,
      stage: project.stage,
      openForGitHubContributions: project.openForGitHubContributions ? "yes" : "no",
    },
  };
  const [state, formAction, pending] = useActionState(updateProject, initial);
  const { errors, values } = state;
  const { locale, tx } = useLanguage();

  return (
    <form className="create-form" action={formAction} ref={formRef}>
      {errors.form ? (
        <p className="form-error" role="alert">
          {errors.form}
        </p>
      ) : null}

      <input type="hidden" name="slug" value={project.slug} />

      <Field label={tx("Nama proyek", "Project name")} name="title" error={errors.title} defaultValue={values.title} required />

      <Field
        label={tx("Situs web proyek", "Project website")}
        name="liveUrl"
        hint={tx("Favicon situs digunakan jika URL logo tidak diisi. Biarkan kosong jika proyekmu belum memiliki situs web.", "The website favicon is used when no logo URL is provided. Leave blank if your project does not have a website yet.")}
        error={errors.liveUrl}
        defaultValue={values.liveUrl}
        type="url"
        placeholder="https://"
      />

      <Field
        label={tx("URL ikon atau logo", "Icon or logo URL")}
        name="logoUrl"
        hint={tx("Opsional. Tautkan langsung ke berkas PNG, SVG, WebP, atau ICO.", "Optional. Link directly to a PNG, SVG, WebP, or ICO file.")}
        error={errors.logoUrl}
        defaultValue={values.logoUrl}
        maxLength={MAXIMUM.logoUrl}
        type="url"
        placeholder="https://example.com/logo.png"
      />

      <Field
        label={tx("Ringkasan satu kalimat", "One-line summary")}
        name="tagline"
        hint={tx("Jelaskan manfaat utamanya dengan bahasa yang sederhana.", "Explain its main benefit in plain language.")}
        error={errors.tagline}
        defaultValue={values.tagline}
        maxLength={MAXIMUM.tagline}
      />

      <Field
        label={tx("Apa yang menarik dari proyek ini?", "What is interesting about this project?")}
        name="highlight"
        hint={tx("Satu atau dua kalimat dengan kata-katamu sendiri. Ini yang pertama dibaca orang.", "A sentence or two in your own words. This is what people read first.")}
        error={errors.highlight}
        defaultValue={values.highlight}
        rows={3}
        maxLength={MAXIMUM.highlight}
      />

      <p className="step-intro">
        {tx("Semua bagian di bawah bersifat opsional. Proyek dapat ditampilkan hanya dengan tautan dan sorotan; brief dapat ditulis kapan pun kamu punya sesuatu untuk diceritakan.", "Nothing below is required. A project can sit here as a link and a highlight, and the brief can be written whenever you have something to say.")}
      </p>

      <Field
        label={tx("Masalah yang ingin diselesaikan", "Problem to solve")}
        name="problem"
        hint={tx("Satu atau dua kalimat konkret sudah cukup.", "One or two concrete sentences are enough.")}
        error={errors.problem}
        defaultValue={values.problem}
        rows={6}
        maxLength={MAXIMUM.problem}
      />

      <Field
        label={tx("Apa yang sedang kamu buat", "What you are making")}
        name="solution"
        hint={tx("Jelaskan bentuk solusi dan arah yang ingin kamu jajaki.", "Describe the form of the solution and the direction you want to explore.")}
        error={errors.solution}
        defaultValue={values.solution}
        rows={6}
        maxLength={MAXIMUM.solution}
      />

      <Field
        label={tx("Untuk siapa proyek ini", "Who it is for")}
        name="audience"
        hint={tx("Sebutkan secara spesifik kelompok yang paling terbantu.", "Name the group of people it will help most specifically.")}
        error={errors.audience}
        defaultValue={values.audience}
        rows={3}
        maxLength={MAXIMUM.audience}
      />

      <Field
        label={tx("Sedang dikerjakan…", "Working on now…")}
        name="now"
        hint={tx(`Satu kalimat tentang pekerjaan terkini. Maksimal ${MAXIMUM.now} karakter—kamu juga dapat memperbaruinya langsung dari halaman proyek.`, `One sentence about the current work. Up to ${MAXIMUM.now} characters—you can also update it directly from the project page.`)}
        defaultValue={values.now}
      />

      <fieldset>
        <legend>{tx("Status proyek", "Project status")}</legend>
        <p className="hint">
          {tx("Pilih status proyek saat ini. Status tersebut disimpan bersama perubahan lainnya.", "Choose the project’s current status. The selected status is saved with your other changes.")}
        </p>
        <ul className="stage-choice">
          {STAGES.map((item) => (
            <li key={item}>
              <label htmlFor={`stage-${item}`}>
                <input
                  id={`stage-${item}`}
                  type="radio"
                  name="stage"
                  value={item}
                  checked={stage === item}
                  onChange={() => setStage(item)}
                />
                <span>
                  <strong>{stageLabel(item, locale)}</strong>
                  <small>{stageBlurb(item, locale)}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {errors.stage ? (
          <p className="field-error" role="alert">
            {errors.stage}
          </p>
        ) : null}
      </fieldset>

      <TopicPicker defaultValue={values.tags} error={errors.tags} />

      <ProjectTypePicker defaultValue={values.projectType} error={errors.projectType} />

      <fieldset>
        <legend>{tx("Tautan", "Links")}</legend>
        <p className="hint">
          {tx("Tautan ini mendukung status proyek. “Dibangun” memerlukan tautan aktif atau deskripsi pekerjaan terkini; “Berjalan” memerlukan situs web proyek.", "These links support the project status. “Building” needs a working link or a current-work description; “Live” needs a project website.")}
        </p>
        <Field label="Dokumen" name="docUrl" error={errors.docUrl} defaultValue={values.docUrl} type="url" />
        <label className={`help-toggle ${openForGitHubContributions ? "is-on" : ""}`}>
          <input
            type="checkbox"
            checked={openForGitHubContributions}
            onChange={(event) => setOpenForGitHubContributions(event.target.checked)}
          />
          <span>
            <strong>{tx("Terbuka untuk kontribusi GitHub", "Open to GitHub contributions")}</strong>
            <small>{tx("Repomu ikut tampil di oss.swegrowth.id, tempat kontributor open source mencari issue dan mengirim pull request.", "Your repository also shows on oss.swegrowth.id, where open source contributors find issues and send pull requests.")}</small>
          </span>
        </label>
        <input
          type="hidden"
          name="openForGitHubContributions"
          value={openForGitHubContributions ? "yes" : "no"}
        />
        {openForGitHubContributions ? (
          <div className="progressive-panel">
            <Field
              label={tx("Repositori GitHub", "GitHub repository")}
              name="repoUrl"
              hint={tx("Repositori GitHub publik diperlukan. Gunakan impor README untuk mengisi kolom proyek yang masih kosong.", "A public GitHub repository is required. Use the README import to fill in any empty project fields.")}
              error={errors.repoUrl}
              defaultValue={values.repoUrl}
              type="url"
              placeholder="https://github.com/organization/project"
              required
            />
            <GitHubImport formRef={formRef} />
          </div>
        ) : (
          <details className="optional-fields" open={Boolean(values.repoUrl)}>
            <summary>{tx("Repositori lainnya", "Other repository")} <span>{tx("opsional", "optional")}</span></summary>
            <div className="optional-fields-body">
              <Field
                label={tx("GitHub atau repositori lain", "GitHub or other repository")}
                name="repoUrl"
                error={errors.repoUrl}
                defaultValue={values.repoUrl}
                type="url"
              />
            </div>
          </details>
        )}
      </fieldset>

      <button className="primary-button" type="submit" disabled={pending} aria-busy={pending || undefined}>
        {pending ? tx("Menyimpan…", "Saving…") : tx("Simpan perubahan", "Save changes")}
      </button>
    </form>
  );
}
