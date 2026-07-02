"use client";

import { Heart, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/types/property";

const copy = {
  en: {
    title: "Private inquiry",
    body: "Contact details are not shown publicly. Submit a request and TokyoStay will reply by email.",
    email: "Customer email",
    messenger: "Messenger ID / contact note",
    message: "Inquiry details",
    submit: "Send inquiry",
    saved: "Saved",
    save: "Save",
    thanks: "Thank you. We usually reply within 24 hours. Please check your email."
  },
  zh: {
    title: "私密咨询",
    body: "公开页面不展示联系方式。客户可以提交邮箱、联络 ID 和咨询内容，后续进入后台线索管理。",
    email: "客户邮箱",
    messenger: "联络 ID / 沟通备注",
    message: "咨询内容",
    submit: "发送咨询",
    saved: "已收藏",
    save: "收藏",
    thanks: "感谢您的咨询。我们通常会在 24 小时内回复，请留意邮箱。"
  },
  ja: {
    title: "非公開お問い合わせ",
    body: "公開ページに連絡先は表示しません。メール、連絡先ID、お問い合わせ内容を送信できます。",
    email: "メールアドレス",
    messenger: "連絡先ID / メモ",
    message: "お問い合わせ内容",
    submit: "送信",
    saved: "保存済み",
    save: "保存",
    thanks: "お問い合わせありがとうございます。通常24時間以内に返信いたします。"
  }
} as const;

export function InquiryPanel({ propertyId, locale }: { propertyId: string; locale: Locale }) {
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [messenger, setMessenger] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("tokyostay-favorites") || "[]") as string[];
    setFavorite(ids.includes(propertyId));
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "property_view", propertyId })
    }).catch(() => undefined);
  }, [propertyId]);

  function toggleFavorite() {
    const ids = JSON.parse(localStorage.getItem("tokyostay-favorites") || "[]") as string[];
    const next = ids.includes(propertyId) ? ids.filter((id) => id !== propertyId) : [...ids, propertyId];
    localStorage.setItem("tokyostay-favorites", JSON.stringify(next));
    setFavorite(next.includes(propertyId));
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "favorite_toggle", propertyId })
    }).catch(() => undefined);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        customerEmail: email,
        messengerId: messenger,
        message,
        refCode: params.get("ref") || undefined
      })
    });
    if (res.ok) {
      setSent(true);
      setEmail("");
      setMessenger("");
      setMessage("");
    }
  }

  return (
    <section className="rounded-[28px] bg-ink p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">{t.title}</p>
          <p className="mt-3 text-sm leading-6 text-white/72">{t.body}</p>
        </div>
        <button onClick={toggleFavorite} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold">
          <Heart size={16} fill={favorite ? "currentColor" : "none"} /> {favorite ? t.saved : t.save}
        </button>
      </div>

      {sent ? (
        <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-ink">{t.thanks}</div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/55">{t.email}</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-ink outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/55">{t.messenger}</span>
            <input value={messenger} onChange={(event) => setMessenger(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-ink outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/55">{t.message}</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} required className="min-h-28 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-ink outline-none" />
          </label>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink">
            <Mail size={16} /> {t.submit} <Send size={15} />
          </button>
        </form>
      )}
    </section>
  );
}
