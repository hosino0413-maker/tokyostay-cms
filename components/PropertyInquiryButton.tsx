"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  propertyId: string;
  propertyName: string;
  locale: "zh" | "en" | "ja";
};

const copy = {
  zh: {
    button: "咨询房源",
    title: "咨询房源",
    lead: "想了解价格、可入住日期或预订方式？请留下您的邮箱，我们会尽快回复。",
    emailLabel: "邮箱地址",
    emailPlaceholder: "请输入您的邮箱",
    channelLabel: "是谁向您推荐了我们？（选填）",
    channelPlaceholder: "如有推荐人、旅行社、合作渠道或平台，请填写名称。",
    messageLabel: "咨询内容",
    messagePlaceholder: "请输入您想咨询的问题……",
    cancel: "取消",
    send: "发送咨询",
    sending: "发送中...",
    successTitle: "已收到您的咨询",
    successBody: "感谢您的咨询。我们通常会在24小时内回复您的邮件，请注意查收邮箱。",
    close: "关闭",
    error: "发送失败，请稍后重试。"
  },
  en: {
    button: "Inquire",
    title: "Inquire about this stay",
    lead: "Want to know the price, available dates, or booking process? Leave your email and we will reply soon.",
    emailLabel: "Email address",
    emailPlaceholder: "Enter your email",
    channelLabel: "Who recommended us to you? (optional)",
    channelPlaceholder: "If you have a referrer, agency, partner channel, or platform, please enter the name.",
    messageLabel: "Inquiry details",
    messagePlaceholder: "Enter your question...",
    cancel: "Cancel",
    send: "Send inquiry",
    sending: "Sending...",
    successTitle: "We received your inquiry",
    successBody: "Thank you for your inquiry. We usually reply within 24 hours. Please check your email.",
    close: "Close",
    error: "Failed to send. Please try again later."
  },
  ja: {
    button: "問い合わせる",
    title: "物件について問い合わせる",
    lead: "料金、入居可能日、予約方法について知りたい場合は、メールアドレスを残してください。できるだけ早く返信します。",
    emailLabel: "メールアドレス",
    emailPlaceholder: "メールアドレスを入力してください",
    channelLabel: "どなたからのご紹介ですか？（任意）",
    channelPlaceholder: "紹介者、旅行会社、提携先、またはプラットフォーム名があれば入力してください。",
    messageLabel: "お問い合わせ内容",
    messagePlaceholder: "お問い合わせ内容を入力してください……",
    cancel: "キャンセル",
    send: "送信する",
    sending: "送信中...",
    successTitle: "お問い合わせを受け付けました",
    successBody: "お問い合わせありがとうございます。通常24時間以内にメールで返信いたしますので、ご確認ください。",
    close: "閉じる",
    error: "送信に失敗しました。しばらくしてからもう一度お試しください。"
  }
} as const;

export function PropertyInquiryButton({ propertyId, propertyName, locale }: Props) {
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/property-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: email,
        channel,
        message,
        propertyName,
        propertyId,
        propertyUrl: window.location.href
      })
    });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <>
      <button
        onClick={() => {
          setStatus("idle");
          setOpen(true);
        }}
        className="hidden w-full items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-[#a43c29] md:inline-flex"
      >
        {t.button}
      </button>

      <button
        onClick={() => {
          setStatus("idle");
          setOpen(true);
        }}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-soft md:hidden"
      >
        {t.button}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-3 pb-3 backdrop-blur-sm md:items-center md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-[95%] max-w-[520px] animate-inquiry rounded-[22px] bg-white p-6 shadow-soft md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {status === "success" ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl">✓</div>
                <div>
                  <h2 className="text-2xl font-semibold">{t.successTitle}</h2>
                  <p className="mt-3 leading-7 text-night/62">
                    {t.successBody}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                  {t.close}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{t.title}</h2>
                    <p className="mt-3 leading-7 text-night/62">
                      {t.lead}
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)} className="rounded-full bg-mist p-2 text-night/55 hover:text-ink" aria-label="关闭">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-night/70">{t.emailLabel}</span>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      placeholder={t.emailPlaceholder}
                      className="w-full rounded-2xl border border-line bg-mist/40 px-4 py-3 outline-none transition focus:border-ink focus:bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-night/70">{t.channelLabel}</span>
                    <input
                      value={channel}
                      onChange={(event) => setChannel(event.target.value)}
                      placeholder={t.channelPlaceholder}
                      className="w-full rounded-2xl border border-line bg-mist/40 px-4 py-3 outline-none transition focus:border-ink focus:bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-night/70">{t.messageLabel}</span>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      required
                      placeholder={t.messagePlaceholder}
                      className="min-h-32 w-full rounded-2xl border border-line bg-mist/40 px-4 py-3 outline-none transition focus:border-ink focus:bg-white"
                    />
                  </label>

                  {status === "error" && <p className="text-sm font-semibold text-red-600">{t.error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-line px-5 py-3 text-sm font-semibold text-night/70">
                      {t.cancel}
                    </button>
                    <button disabled={status === "sending"} className="flex-1 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                      {status === "sending" ? t.sending : t.send}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes inquiryIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-inquiry {
          animation: inquiryIn 180ms ease-out;
        }
      `}</style>
    </>
  );
}
