import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export type InquiryPayload = {
  propertyId: string;
  customerEmail: string;
  messengerId?: string;
  message: string;
  refCode?: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as InquiryPayload;

  if (!payload.propertyId || !payload.customerEmail || !payload.message) {
    return NextResponse.json({ error: "Missing required inquiry fields" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Inquiry received",
    inquiry: {
      id: `inq_${Date.now()}`,
      ...payload,
      status: "new",
      createdAt: new Date().toISOString()
    },
    thankYou: {
      en: "Thank you. We usually reply within 24 hours. Please check your email.",
      zh: "感谢您的咨询。我们通常会在 24 小时内回复，请留意您的邮箱。",
      ja: "お問い合わせありがとうございます。通常24時間以内に返信いたしますので、メールをご確認ください。"
    }
  });
}
