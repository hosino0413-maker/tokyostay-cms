import { NextRequest, NextResponse } from "next/server";
import type { AiDraft, Property } from "@/types/property";

function mockDraft(property: Property): AiDraft {
  const zhTitle = property.title.zh || property.title.en || "TokyoStay 房源";
  const enTitle = property.title.en || property.title.zh || "TokyoStay residence";
  const jaTitle = property.title.ja || property.title.en || "TokyoStayレジデンス";
  const area = property.area || "Tokyo";
  const room = property.roomType || "apartment";

  return {
    description: {
      zh: `${zhTitle} 位于 ${area}，是一套适合中长期入住的 ${room}。房源强调清爽、安静和实用的居住体验，适合商务差旅、短期过渡、家庭停留以及希望稳定体验东京生活的客人。房间配备日常生活所需设施，可满足拎包入住、远程办公和城市通勤需求。`,
      en: `${enTitle} is a polished ${room} in ${area}, designed for practical mid-term stays in Tokyo. It balances calm interiors, daily convenience, and move-in-ready comfort for business travelers, relocation guests, couples, and small families who need a reliable city base.`,
      ja: `${jaTitle} は ${area} にある中長期滞在向けの ${room} です。落ち着いた室内、日常生活の使いやすさ、すぐに暮らせる快適さを大切にしており、出張、転居準備、少人数での滞在、東京で安定した生活拠点を探す方に適しています。`
    },
    sellingPoints: [
      {
        zh: "适合中长期居住，入住流程清晰",
        en: "Designed for mid-term stays with a clear move-in flow",
        ja: "中長期滞在に適した、分かりやすい入居導線"
      },
      {
        zh: "交通、生活和日常采购便利",
        en: "Convenient access to transit, daily needs, and shopping",
        ja: "交通、生活施設、日常の買い物に便利"
      },
      {
        zh: "家具家电齐全，可快速开始东京生活",
        en: "Fully furnished for a quick Tokyo start",
        ja: "家具家電付きで、東京生活をすぐに始められる"
      }
    ],
    amenities: ["Wi-Fi", "Kitchen", "Washer", "Air Conditioner", "Workspace", "Storage"],
    clientCopy: {
      zh: `这套 ${area} 房源适合发送给重视交通、生活便利和入住效率的客户。整体风格干净实用，适合中长期居住，也适合作为到东京后的第一处稳定住所。`,
      en: `This ${area} home is a strong TokyoStay recommendation for guests who value access, comfort, and an efficient move-in experience. It works well as a stable first base in Tokyo.`,
      ja: `${area} のこちらの物件は、交通の利便性、暮らしやすさ、入居のしやすさを重視するお客様にご案内しやすいTokyoStayおすすめ物件です。`
    }
  };
}

export async function POST(request: NextRequest) {
  const property = (await request.json()) as Property;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      ...mockDraft(property),
      mode: "mock",
      note: "OPENAI_API_KEY is not configured, so this is a deterministic mock result."
    });
  }

  // Production placeholder:
  // Replace this block with an OpenAI Responses API call that asks the model to
  // return the AiDraft JSON schema. The frontend route contract is already fixed.
  return NextResponse.json({
    ...mockDraft(property),
    mode: "mock-with-key-placeholder",
    note: "OPENAI_API_KEY exists, but the real OpenAI call has not been wired yet."
  });
}
