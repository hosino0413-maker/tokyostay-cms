import { mkdir, writeFile } from "fs/promises";
import path from "path";
import COS from "cos-nodejs-sdk-v5";
import { NextRequest, NextResponse } from "next/server";
import type { Locale, Property } from "@/types/property";

const deployPrefix = "deploy";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokyostay.asia";

const labels = {
  en: {
    title: "TokyoStay Properties",
    lead: "Curated Tokyo rooms for short stays, long stays, and relocation.",
    view: "View details",
    back: "Back to properties",
    details: "Property details",
    unavailable: "Unavailable dates"
  },
  zh: {
    title: "TokyoStay 房源展示",
    lead: "适合东京短住、长租、搬家过渡与商务差旅的精选房源。",
    view: "查看详情",
    back: "返回房源列表",
    details: "房源详情",
    unavailable: "不可入住日期"
  },
  ja: {
    title: "TokyoStay 物件一覧",
    lead: "東京での短期滞在、長期滞在、転居準備、出張に適した物件をご紹介します。",
    view: "詳細を見る",
    back: "物件一覧へ戻る",
    details: "物件詳細",
    unavailable: "予約不可日"
  }
} as const;

const css = `*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Hiragino Sans",Arial,sans-serif;background:#f6f4ef;color:#171412;-webkit-text-size-adjust:100%}a{text-decoration:none;color:inherit}.top{position:sticky;top:0;z-index:10;background:rgba(246,244,239,.9);backdrop-filter:blur(16px);border-bottom:1px solid #e7e1d7}.nav{max-width:1180px;margin:auto;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}.brand{font-weight:900}.langs{display:flex;gap:6px;flex-wrap:wrap}.langs button{border:1px solid #e7e1d7;background:white;border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.langs button.active{background:#171412;color:white}.wrap{max-width:1180px;margin:auto;padding:34px 20px}.hero{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.hero h1{font-size:clamp(34px,6vw,64px);line-height:1.02;margin:0 0 12px;letter-spacing:0}.hero p{font-size:17px;line-height:1.8;color:#5c6470;max-width:680px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.card{overflow:hidden;background:white;border:1px solid #e7e1d7;border-radius:26px;box-shadow:0 12px 35px rgba(23,20,18,.08)}.collage{display:grid;grid-template-columns:1.2fr .8fr;gap:4px;height:260px;background:#e7e1d7}.collage img{width:100%;height:100%;object-fit:cover;display:block}.collage .right{display:grid;grid-template-rows:1fr 1fr;gap:4px}.body{padding:20px}.body h2{margin:0 0 10px;font-size:24px;line-height:1.18;letter-spacing:0}.muted{color:#68717c;line-height:1.7}.tags{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.tag{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;color:#5d665e;white-space:nowrap}.btn{display:inline-flex;margin-top:14px;background:#171412;color:white;border-radius:999px;padding:12px 16px;font-weight:900}.gallery{background:white;border:1px solid #e7e1d7;border-radius:28px;padding:14px;box-shadow:0 12px 35px rgba(23,20,18,.08)}.mainimg{width:100%;height:min(62vw,620px);object-fit:cover;border-radius:22px}.thumbs{display:flex;gap:10px;overflow:auto;margin-top:12px;padding-bottom:4px}.thumbs img{width:120px;height:82px;object-fit:cover;border-radius:14px;flex:0 0 auto}.detail{display:grid;grid-template-columns:1fr 360px;gap:24px;margin-top:24px}.panel{background:white;border:1px solid #e7e1d7;border-radius:24px;padding:22px;box-shadow:0 8px 26px rgba(23,20,18,.06)}.calendar{display:grid;grid-template-columns:1fr;gap:8px}.blocked{background:#fee2e2;color:#991b1b;border-radius:14px;padding:11px 12px;font-weight:800}.media{width:100%;border:0;border-radius:18px;background:#eee;min-height:320px}.video{width:100%;max-height:520px;border-radius:18px;background:#000}.back{display:inline-flex;margin-bottom:20px;color:#5c6470;font-weight:900}@media(max-width:880px){.top{position:relative}.nav{align-items:flex-start;gap:12px;flex-direction:column;padding:18px 18px 14px}.langs{width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.langs button{padding:9px 8px;font-size:13px}.wrap{padding:24px 18px}.hero{display:block;margin-bottom:22px}.hero h1{font-size:34px;line-height:1.08;margin-bottom:14px}.hero p{font-size:16px;line-height:1.75}.grid,.detail{grid-template-columns:1fr;gap:18px}.card{border-radius:24px}.collage{display:block;height:280px}.collage>img{height:100%}.collage .right{display:none}.body{padding:22px 20px 24px}.body h2{font-size:28px}.muted{font-size:16px;line-height:1.55}.tags{gap:8px;margin:16px 0}.tag{font-size:13px;padding:8px 11px;max-width:100%;white-space:normal}.btn{padding:13px 18px}.mainimg{height:390px}.panel{padding:20px;border-radius:22px}.media{min-height:260px}}@media(max-width:430px){.wrap{padding:22px 14px}.hero h1{font-size:30px}.hero p{font-size:15px}.collage{height:245px}.body h2{font-size:25px}.muted{font-size:15px}.mainimg{height:320px}.thumbs img{width:96px;height:68px}.card{border-radius:22px}.langs button{font-size:12px}}`;

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
  const cards = published.map((property) => {
    const c = cover(property);
    const imgs = [c, property.images[1] || c, property.images[2] || c].filter(Boolean);
    return `<article class="card"><div class="collage"><img src="${esc(imgs[0]?.url)}" alt="${esc(imgs[0]?.alt)}"><div class="right"><img src="${esc(imgs[1]?.url)}" alt="${esc(imgs[1]?.alt)}"><img src="${esc(imgs[2]?.url)}" alt="${esc(imgs[2]?.alt)}"></div></div><div class="body">${(["en", "zh", "ja"] as Locale[]).map((lang) => `<div data-lang="${lang}"><h2>${esc(txt(property.title, lang))}</h2><p class="muted">${esc(property.area)} · ${esc(property.roomType)} · ${esc(property.capacity)} · ${esc(property.size)}</p><div class="tags">${property.amenities.slice(0, 5).map((item) => `<span class="tag">${esc(item)}</span>`).join("")}</div><a class="btn" data-href-base="../property/${esc(property.id)}/index.html" href="../property/${esc(property.id)}/index.html?lang=${lang}">${esc(labels[lang].view)}</a></div>`).join("")}</div></article>`;
  }).join("");
  return shell("TokyoStay Properties", `${nav("../")}<main class="wrap"><section class="hero">${(["en", "zh", "ja"] as Locale[]).map((lang) => `<div data-lang="${lang}"><h1>${esc(labels[lang].title)}</h1><p>${esc(labels[lang].lead)}</p></div>`).join("")}</section><section class="grid">${cards}</section></main>${languageScript()}`);
}

function detailHtml(property: Property) {
  const images = property.images.length ? property.images : [];
  const main = cover(property);
  return shell(txt(property.title, "en"), `${nav("../../")}<main class="wrap">${(["en", "zh", "ja"] as Locale[]).map((lang) => `<a class="back" data-lang="${lang}" href="../../properties/index.html?lang=${lang}">‹ ${esc(labels[lang].back)}</a>`).join("")}<section class="hero">${(["en", "zh", "ja"] as Locale[]).map((lang) => `<div data-lang="${lang}"><h1>${esc(txt(property.title, lang))}</h1><p>${esc(property.area)} · ${esc(property.roomType)} · ${esc(property.capacity)} · ${esc(property.size)} · ${esc(property.traffic)}</p></div>`).join("")}</section><section class="gallery"><img class="mainimg" src="${esc(main?.url)}" alt="${esc(main?.alt)}"><div class="thumbs">${images.map((image) => `<img src="${esc(image.url)}" alt="${esc(image.alt)}">`).join("")}</div></section><section class="detail"><div class="panel">${(["en", "zh", "ja"] as Locale[]).map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].details)}</h2><p class="muted">${esc(txt(property.description, lang))}</p><div class="tags">${property.amenities.map((item) => `<span class="tag">${esc(item)}</span>`).join("")}</div></div>`).join("")}</div><aside class="panel">${(["en", "zh", "ja"] as Locale[]).map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].unavailable)}</h2><div class="calendar">${property.unavailableDates.map((range) => `<div class="blocked">${esc(range.start)} - ${esc(range.end)}</div>`).join("") || `<p class="muted">-</p>`}</div></div>`).join("")}</aside></section><section class="detail"><div class="panel"><h2>Room Tour</h2>${property.videos[0] ? (property.videos[0].url.includes("youtube") ? `<iframe class="media" src="${esc(property.videos[0].url)}" allowfullscreen></iframe>` : `<video class="video" src="${esc(property.videos[0].url)}" controls></video>`) : `<p class="muted">-</p>`}</div><div class="panel"><h2>Map</h2>${property.map.embedUrl ? (property.map.type === "image" ? `<img class="media" src="${esc(property.map.embedUrl)}" alt="${esc(property.map.address)}">` : `<iframe class="media" src="${esc(property.map.embedUrl)}" loading="lazy"></iframe>`) : `<p class="muted">-</p>`}</div></section></main>${languageScript()}`);
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

  const outputDir = path.join(process.cwd(), "outputs", "published");
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "properties.index.html"), listHtml(properties), "utf8");

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
