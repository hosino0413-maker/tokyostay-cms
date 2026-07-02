import { NextRequest, NextResponse } from "next/server";
import type { AiDraft, Property } from "@/types/property";

export const runtime = "nodejs";

function mockDraft(property: Property): AiDraft {
  const zhTitle = property.title.zh || property.title.en || "TokyoStay 房源";
  const enTitle = property.title.en || property.title.zh || "TokyoStay Residence";
  const jaTitle = property.title.ja || property.title.en || "TokyoStayレジデンス";
  const area = property.area || "Tokyo";
  const room = property.roomType || "apartment";

  return {
    description: {
      zh: `${zhTitle} 位于 ${area}，是一套适合东京短住、月租、搬家过渡与商务差旅的 ${room} 房源。空间以干净、实用和易入住为核心，客户可以在展示页中查看图片、视频、地图与不可入住日期，再提交私密咨询。`,
      en: `${enTitle} is a polished ${room} in ${area}, designed for short stays, monthly stays, relocation, and business travel in Tokyo. It presents a calm interior, practical daily comfort, and a clear move-in experience for guests who want a reliable city base.`,
      ja: `${jaTitle} は ${area} にある ${room} タイプの住まいです。短期滞在、月単位の滞在、引越し準備、出張に適しており、写真、動画、地図、利用不可日を確認してから非公開で問い合わせできます。`
    },
    sellingPoints: [
      {
        zh: "适合中长期住宿，入住前可清楚确认房源信息",
        en: "Good for mid-term stays with clear pre-check information",
        ja: "中長期滞在に適した、事前確認しやすい情報設計"
      },
      {
        zh: "图片、视频、地图与不可入住日历集中展示",
        en: "Photos, video, map, and unavailable calendar in one page",
        ja: "写真、動画、地図、利用不可日を1ページで確認可能"
      },
      {
        zh: "前台不公开联系方式，适合私密分享给客户",
        en: "No public contact details, suitable for private client sharing",
        ja: "連絡先を公開せず、顧客への共有に適したページ"
      }
    ],
    amenities: ["Wi-Fi", "Kitchen", "Washer", "Air Conditioner", "Near Station", "Long Stay"],
    clientCopy: {
      zh: `这套 ${area} 房源适合希望在东京稳定入住的客户。您可以先查看图片、视频、地图和不可入住日期，如果觉得合适，可以提交咨询，我们会继续确认入住条件。`,
      en: `This ${area} home is a strong TokyoStay option for guests who want a clear, practical Tokyo base. You can review the photos, video, map, and unavailable dates before we confirm next steps.`,
      ja: `${area} のこちらの物件は、東京で分かりやすく安心して滞在先を検討したい方におすすめです。写真、動画、地図、利用不可日を確認してから次の確認へ進めます。`
    }
  };
}

export async function POST(request: NextRequest) {
  const property = (await request.json()) as Property;
  const key = process.env.OPENAI_API_KEY;

  if (!key || key === "mock") {
    return NextResponse.json({
      ...mockDraft(property),
      mode: "mock",
      note: "OPENAI_API_KEY is not configured, so a structured mock result was returned."
    });
  }

  return NextResponse.json({
    ...mockDraft(property),
    mode: "mock-with-key-placeholder",
    note: "OPENAI_API_KEY exists. The API contract is ready for a real model call."
  });
}
