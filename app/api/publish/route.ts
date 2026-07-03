import COS from "cos-nodejs-sdk-v5";
import { NextRequest, NextResponse } from "next/server";
import { tagLabel } from "@/lib/tags";
import type { Locale, Property } from "@/types/property";

export const runtime = "nodejs";

const deployPrefix = "deploy";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokyostay.asia";
const langs: Locale[] = ["en", "zh", "ja"];

const labels = {
  en: {
    title: "Tokyo Vacation Rentals",
    subtitle: "Modern Living in Tokyo",
    lead: "Curated homes for short stays, monthly stays, relocation, and business travel across Tokyo.",
    view: "View Details",
    back: "Back to properties",
    details: "Overview",
    amenities: "Amenities",
    unavailable: "Unavailable dates",
    video: "Room Tour",
    map: "Map",
    private: "Public pages do not show contact details."
  },
  zh: {
    title: "Tokyo Vacation Rentals",
    subtitle: "Modern Living in Tokyo",
    lead: "适合东京短住、长租、搬家过渡与商务差旅的精选房源。",
    view: "查看详情",
    back: "返回房源列表",
    details: "房源概览",
    amenities: "设施",
    unavailable: "不可入住日期",
    video: "房源视频",
    map: "地图",
    private: "公开房源页不展示联系方式。"
  },
  ja: {
    title: "Tokyo Vacation Rentals",
    subtitle: "Modern Living in Tokyo",
    lead: "短期滞在、月単位滞在、引越し準備、出張に適した東京の住まいを紹介します。",
    view: "詳細を見る",
    back: "物件一覧へ戻る",
    details: "概要",
    amenities: "設備",
    unavailable: "利用不可日",
    video: "ルームツアー",
    map: "地図",
    private: "公開ページには連絡先を表示しません。"
  }
} as const;

const css = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Noto Sans JP",Arial,sans-serif;background:#f6f4ef;color:#171412;-webkit-text-size-adjust:100%}a{text-decoration:none;color:inherit}.top{position:sticky;top:0;z-index:20;background:rgba(246,244,239,.9);backdrop-filter:blur(18px);border-bottom:1px solid #e7e1d7}.nav{max-width:1180px;margin:auto;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px}.brand{font-weight:900}.langs{display:flex;gap:8px;flex-wrap:wrap}.langs button{border:1px solid #e7e1d7;background:white;border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.langs button.active{background:#171412;color:white}.wrap{max-width:1180px;margin:auto;padding:34px 20px}.hero{display:grid;grid-template-columns:1fr .72fr;gap:28px;align-items:stretch;margin-bottom:30px}.hero-copy{min-height:360px;display:flex;flex-direction:column;justify-content:center}.eyebrow{display:inline-flex;width:max-content;border:1px solid #e7e1d7;background:white;border-radius:999px;padding:9px 13px;color:#b8462f;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.hero h1{font-size:clamp(42px,7vw,76px);line-height:.98;margin:24px 0 10px;letter-spacing:0}.hero h1 span{display:block;color:rgba(32,39,51,.58)}.hero p{font-size:17px;line-height:1.8;color:#5c6470;max-width:680px}.hero-img{min-height:360px;border-radius:34px;overflow:hidden;box-shadow:0 20px 60px rgba(23,20,18,.1)}.hero-img img{width:100%;height:100%;object-fit:cover;display:block}.filters{display:flex;gap:10px;overflow:auto;margin:0 0 26px;padding-bottom:3px}.chip{flex:0 0 auto;border:1px solid #e7e1d7;background:white;border-radius:999px;padding:10px 14px;font-weight:800;color:#59616b}.section-title{display:flex;justify-content:space-between;align-items:end;gap:16px;margin:20px 0}.section-title h2{font-size:34px;margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.card{overflow:hidden;background:white;border:1px solid #e7e1d7;border-radius:28px;box-shadow:0 10px 30px rgba(32,39,51,.08);transition:.25s}.card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(23,20,18,.1)}.collage{display:grid;grid-template-columns:1.25fr .75fr;gap:4px;height:280px;background:#e7e1d7}.collage img{width:100%;height:100%;object-fit:cover;display:block}.collage .right{display:grid;grid-template-rows:1fr 1fr;gap:4px}.body{padding:22px}.body h2{margin:8px 0 10px;font-size:24px;line-height:1.18;letter-spacing:0}.muted{color:#68717c;line-height:1.7}.meta{display:grid;gap:5px;color:#68717c;font-size:14px}.tags{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.tag{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;color:#5d665e;white-space:nowrap}.btn{display:inline-flex;margin-top:4px;background:#171412;color:white;border-radius:999px;padding:12px 16px;font-weight:900}.gallery{background:white;border:1px solid #e7e1d7;border-radius:30px;padding:14px;box-shadow:0 12px 35px rgba(23,20,18,.08)}.mainimg{width:100%;height:min(62vw,640px);object-fit:cover;border-radius:24px}.thumbs{display:flex;gap:10px;overflow:auto;margin-top:12px;padding-bottom:4px}.thumbs img{width:120px;height:82px;object-fit:cover;border-radius:14px;flex:0 0 auto}.detail{display:grid;grid-template-columns:1fr 360px;gap:24px;margin-top:24px}.panel{background:white;border:1px solid #e7e1d7;border-radius:24px;padding:24px;box-shadow:0 8px 26px rgba(23,20,18,.06)}.facts{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:24px}.fact{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:18px;padding:14px;font-weight:800;color:#4f5965}.calendar{display:grid;gap:8px}.blocked{background:#fee2e2;color:#991b1b;border-radius:14px;padding:11px 12px;font-weight:800}.media{width:100%;border:0;border-radius:18px;background:#eee;min-height:320px}.video{width:100%;max-height:520px;border-radius:18px;background:#000}.back{display:inline-flex;margin-bottom:20px;color:#5c6470;font-weight:900}.private{background:#171412;color:white}.private p{color:rgba(255,255,255,.76)}@media(max-width:980px){.hero,.grid,.detail{grid-template-columns:1fr}.hero-copy{min-height:auto}.hero-img{min-height:300px}.facts{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){.top{position:relative}.nav{align-items:flex-start;flex-direction:column}.langs{width:100%;display:grid;grid-template-columns:repeat(3,1fr)}.langs button{font-size:12px;padding:9px 8px}.wrap{padding:24px 16px}.hero h1{font-size:38px}.hero p{font-size:15px}.hero-img{min-height:260px;border-radius:26px}.section-title h2{font-size:28px}.collage{display:block;height:250px}.collage>img{height:100%}.collage .right{display:none}.body h2{font-size:25px}.mainimg{height:320px}.facts{grid-template-columns:1fr}.panel{padding:20px}.media{min-height:250px}}`;

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));
}

function txt(value: Record<Locale, string>, lang: Locale) {
  return value?.[lang] || value?.en || value?.zh || value?.ja || "";
}

function cover(property: Property) {
  return property.images.find((image) => image.type === "cover") || property.images[0];
}

function shell(title: string, body: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title><style>${css}</style></head><body>${body}</body></html>`;
}

function nav(prefix = "") {
  return `<header class="top"><div class="nav"><a class="brand" href="${prefix}properties/index.html">TokyoStay</a><div class="langs"><button data-lang-btn="en" onclick="setLang('en')">English</button><button data-lang-btn="zh" onclick="setLang('zh')">中文</button><button data-lang-btn="ja" onclick="setLang('ja')">日本語</button></div></div></header>`;
}

function languageScript() {
  return `<script>function setLang(lang){document.documentElement.lang=lang;document.querySelectorAll('[data-lang]').forEach(el=>{el.style.display=el.dataset.lang===lang?'':'none'});document.querySelectorAll('[data-lang-btn]').forEach(el=>el.classList.toggle('active',el.dataset.langBtn===lang));document.querySelectorAll('a[data-href-base]').forEach(a=>{a.href=a.dataset.hrefBase+(a.dataset.hrefBase.includes('?')?'&':'?')+'lang='+lang});localStorage.setItem('tokyostayLang',lang)}setLang(new URLSearchParams(location.search).get('lang')||localStorage.getItem('tokyostayLang')||'en');</script>`;
}

function listHtml(properties: Property[]) {
  const published = properties.filter((property) => property.status === "published").sort((a, b) => a.order - b.order);
  const areas = Array.from(new Set(published.map((property) => property.area)));
  const cards = published.map((property) => {
    const c = cover(property);
    const imgs = [c, property.images[1] || c, property.images[2] || c].filter(Boolean);
    return `<article class="card"><a data-href-base="../property/${esc(property.id)}/index.html" href="../property/${esc(property.id)}/index.html"><div class="collage"><img src="${esc(imgs[0]?.url)}" alt="${esc(imgs[0]?.alt)}"><div class="right"><img src="${esc(imgs[1]?.url)}" alt="${esc(imgs[1]?.alt)}"><img src="${esc(imgs[2]?.url)}" alt="${esc(imgs[2]?.alt)}"></div></div><div class="body">${langs.map((lang) => `<div data-lang="${lang}"><p class="eyebrow">${esc(property.area)}</p><h2>${esc(txt(property.title, lang))}</h2><div class="meta"><span>${esc(property.roomType)} · ${esc(property.capacity)} · ${esc(property.size)}</span><span>${esc(property.traffic)}</span></div><div class="tags">${property.amenities.slice(0, 5).map((item) => `<span class="tag">${esc(tagLabel(item, lang))}</span>`).join("")}</div><span class="btn">${esc(labels[lang].view)}</span></div>`).join("")}</div></a></article>`;
  }).join("");
  return shell(
    "TokyoStay Properties",
    `${nav("../")}<main class="wrap"><section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">Tokyo furnished stays</span><h1>${esc(labels[lang].title)}<span>${esc(labels[lang].subtitle)}</span></h1><p>${esc(labels[lang].lead)}</p></div>`).join("")}</div><div class="hero-img"><img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop" alt="Tokyo skyline"></div></section><div class="filters">${areas.map((area) => `<span class="chip">${esc(area)}</span>`).join("")}<span class="chip">Near Station</span><span class="chip">Long Stay</span></div><div class="section-title"><h2>Featured Properties</h2><span class="chip">${published.length} stays</span></div><section class="grid">${cards}</section></main>${languageScript()}`
  );
}

function detailHtml(property: Property) {
  const images = property.images.length ? property.images : [];
  const main = cover(property);
  return shell(
    txt(property.title, "en"),
    `${nav("../../")}<main class="wrap">${langs.map((lang) => `<a class="back" data-lang="${lang}" href="../../properties/index.html?lang=${lang}">← ${esc(labels[lang].back)}</a>`).join("")}<section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">${esc(property.area)}</span><h1>${esc(txt(property.title, lang))}</h1><p>${esc(property.priceNote)} · ${esc(property.traffic)}</p></div>`).join("")}</div><div class="hero-img"><img src="${esc(main?.url)}" alt="${esc(main?.alt)}"></div></section><section class="gallery"><img class="mainimg" src="${esc(main?.url)}" alt="${esc(main?.alt)}"><div class="thumbs">${images.map((image) => `<img src="${esc(image.url)}" alt="${esc(image.alt)}">`).join("")}</div></section><section class="detail"><div class="panel">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].details)}</h2><div class="facts"><div class="fact">${esc(property.area)}</div><div class="fact">${esc(property.roomType)}</div><div class="fact">${esc(property.capacity)}</div><div class="fact">${esc(property.size)}</div><div class="fact">${esc(property.traffic)}</div></div><p class="muted">${esc(txt(property.description, lang))}</p><h2>${esc(labels[lang].amenities)}</h2><div class="tags">${property.amenities.map((item) => `<span class="tag">${esc(tagLabel(item, lang))}</span>`).join("")}</div></div>`).join("")}</div><aside class="panel">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].unavailable)}</h2><div class="calendar">${property.unavailableDates.map((range) => `<div class="blocked">${esc(range.start)} - ${esc(range.end)}</div>`).join("") || `<p class="muted">-</p>`}</div></div>`).join("")}</aside></section><section class="detail"><div class="panel"><h2>${labels.en.video}</h2>${property.videos[0] ? (property.videos[0].url.includes("youtube") ? `<iframe class="media" src="${esc(property.videos[0].url)}" allowfullscreen></iframe>` : `<video class="video" src="${esc(property.videos[0].url)}" controls></video>`) : `<p class="muted">-</p>`}</div><div class="panel"><h2>${labels.en.map}</h2>${property.map.embedUrl ? (property.map.type === "image" ? `<img class="media" src="${esc(property.map.embedUrl)}" alt="${esc(property.map.address)}">` : `<iframe class="media" src="${esc(property.map.embedUrl)}" loading="lazy"></iframe>`) : `<p class="muted">-</p>`}</div></section><section class="panel private">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].private)}</h2></div>`).join("")}</section></main>${languageScript()}`
  );
}

async function uploadText(cos: COS, key: string, content: string) {
  const body = Buffer.from(content, "utf8");
  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: process.env.TENCENT_DEPLOY_COS_BUCKET || "tokyostay-1445455726",
        Region: process.env.TENCENT_DEPLOY_COS_REGION || "ap-hongkong",
        Key: key,
        Body: body,
        ContentLength: body.length,
        ContentType: "text/html; charset=utf-8"
      },
      (err) => err ? reject(err) : resolve()
    );
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const current = body.property as Property | undefined;
  const properties = (Array.isArray(body.properties) ? body.properties : current ? [current] : []) as Property[];

  if (!current?.id || properties.length === 0) {
    return NextResponse.json({ error: "Missing property data" }, { status: 400 });
  }

  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  if (!secretId || !secretKey) {
    return NextResponse.json({ error: "Missing Tencent COS credentials" }, { status: 500 });
  }

  const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
  await uploadText(cos, `${deployPrefix}/properties/index.html`, listHtml(properties));
  for (const property of properties.filter((item) => item.status === "published")) {
    await uploadText(cos, `${deployPrefix}/property/${property.id}/index.html`, detailHtml(property));
  }

  const url = `${siteUrl.replace(/\/$/, "")}/${deployPrefix}/property/${current.id}/index.html`;

  return NextResponse.json({
    ok: true,
    message: "Published to COS",
    url,
    listUrl: `${siteUrl.replace(/\/$/, "")}/${deployPrefix}/properties/index.html`
  });
}
