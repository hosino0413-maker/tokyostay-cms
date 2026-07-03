import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const recipient = "tokyostay365@gmail.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tokyostay.asia",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function required(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    customerEmail,
    channel,
    message,
    propertyName,
    propertyId,
    propertyUrl
  } = body as Record<string, string>;

  if (!required(customerEmail) || !required(message) || !required(propertyName) || !required(propertyId)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return NextResponse.json({ error: "SMTP is not configured" }, { status: 500, headers: corsHeaders });
  }

  const submittedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from,
    to: recipient,
    replyTo: customerEmail,
    subject: "【TokyoStay 房源咨询】",
    text: [
      "【TokyoStay 房源咨询】",
      "",
      `客户邮箱：${customerEmail}`,
      `介绍人 / 渠道：${channel || "未填写"}`,
      "",
      "咨询内容：",
      message,
      "",
      `房源名称：${propertyName}`,
      `房源 ID：${propertyId}`,
      `房源链接：${propertyUrl || "未提供"}`,
      `提交时间：${submittedAt}`
    ].join("\n")
  });

  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
