"use client";

import { useState, type FormEvent } from "react";

export interface PortalLoginProps {
  onSubmit(username: string, password: string): void;
  busy: boolean;
  error: string | null;
  /** Nilai awal form. Untuk mereset, ganti `key` komponen. */
  prefill?: { username: string; password: string };
  /** Teks petunjuk bila login dikunci (mode guide). */
  locked?: string;
}

const field =
  "w-full rounded border border-gov-line bg-white px-3 py-2.5 text-sm text-gov-ink focus:border-gov-brand disabled:bg-gov-bg";

export function PortalLogin({
  onSubmit,
  busy,
  error,
  prefill,
  locked,
}: PortalLoginProps) {
  const [username, setUsername] = useState(prefill?.username ?? "");
  const [password, setPassword] = useState(prefill?.password ?? "");


  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!locked) onSubmit(username, password);
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-sm rounded border border-gov-line bg-gov-card p-6"
    >
      <h3 className="text-base font-semibold text-gov-brand">
        Otorisasi Operator
      </h3>
      <p className="mt-1 text-sm text-gov-soft">
        Masukkan NRP dan kata sandi operasional Anda.
      </p>
      <label className="mt-5 block">
        <span className="mb-1.5 block text-xs font-medium text-gov-soft">
          ID Personel / NRP
        </span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!!locked}
          className={field}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-medium text-gov-soft">
          Kata Sandi
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!!locked}
          className={field}
        />
      </label>
      <button
        type="submit"
        disabled={busy || !!locked}
        className="mt-5 w-full rounded bg-gov-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#244a87] disabled:opacity-60"
      >
        {busy ? "Memverifikasi…" : "Masuk"}
      </button>
      {locked && <p className="mt-3 text-xs text-gov-soft">{locked}</p>}
      {error && (
        <p role="alert" className="mt-3 text-sm text-gov-alarm">
          {error}
        </p>
      )}
    </form>
  );
}
