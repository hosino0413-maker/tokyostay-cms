import COS from "cos-nodejs-sdk-v5";
import { NextRequest, NextResponse } from "next/server";
import type { Building, Locale, MediaImage, RoomType } from "@/types/property";

export const runtime = "nodejs";

const deployPrefix = "deploy";
const siteUrl = "https://tokyostay.asia";
const langs: Locale[] = ["en", "zh", "ja"];

const labels = {
  en: {
    listTitle: "TokyoStay Residences",
    listLead: "Curated Tokyo residences with multiple room types for monthly stays, relocation, and business travel.",
    featured: "Featured Residences",
    viewTypes: "View Room Types",
    roomTypes: "Room Types",
    viewDetails: "View Details",
    backResidences: "Back to residences",
    backTypes: "Back to room types",
    overview: "Overview",
    amenities: "Amenities",
    unavailable: "Unavailable dates",
    video: "Room Tour",
    map: "Map"
  },
  zh: {
    listTitle: "TokyoStay 楼盘展示",
    listLead: "适合东京短住、月租、搬家过渡与商务差旅的精选楼盘和户型。",
    featured: "Featured Residences",
    viewTypes: "查看房型",
    roomTypes: "房型",
    viewDetails: "查看详情",
    backResidences: "返回楼盘列表",
    backTypes: "返回房型列表",
    overview: "房型介绍",
    amenities: "设施",
    unavailable: "不可入住日期",
    video: "视频",
    map: "地图"
  },
  ja: {
    listTitle: "TokyoStay レジデンス",
    listLead: "短期滞在、月単位の滞在、引越し準備、出張に適した東京のレジデンスとタイプ。",
    featured: "Featured Residences",
    viewTypes: "タイプを見る",
    roomTypes: "タイプ",
    viewDetails: "詳細を見る",
    backResidences: "一覧へ戻る",
    backTypes: "タイプ一覧へ戻る",
    overview: "タイプ紹介",
    amenities: "設備",
    unavailable: "利用不可日",
    video: "動画",
    map: "地図"
  }
} as const;

const css = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Noto Sans JP",Arial,sans-serif;background:#f6f4ef;color:#171412;-webkit-text-size-adjust:100%}a{text-decoration:none;color:inherit}.top{position:sticky;top:0;z-index:20;background:rgba(246,244,239,.9);backdrop-filter:blur(18px);border-bottom:1px solid #e7e1d7}.nav{max-width:1180px;margin:auto;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px}.brand{font-weight:900}.langs{display:flex;gap:8px;flex-wrap:wrap}.langs button{border:1px solid #e7e1d7;background:white;border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.langs button.active{background:#171412;color:white}.wrap{max-width:1180px;margin:auto;padding:34px 20px}.hero{display:grid;grid-template-columns:1fr .72fr;gap:28px;align-items:stretch;margin-bottom:30px}.hero-copy{min-height:360px;display:flex;flex-direction:column;justify-content:center}.eyebrow{display:inline-flex;width:max-content;border:1px solid #e7e1d7;background:white;border-radius:999px;padding:9px 13px;color:#b8462f;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.hero h1{font-size:clamp(42px,7vw,76px);line-height:.98;margin:24px 0 10px;letter-spacing:0}.hero p{font-size:17px;line-height:1.8;color:#5c6470;max-width:680px}.hero-img{min-height:360px;border-radius:34px;overflow:hidden;box-shadow:0 20px 60px rgba(23,20,18,.1)}.hero-img img{width:100%;height:100%;object-fit:cover;display:block}.section-title{display:flex;justify-content:space-between;align-items:end;gap:16px;margin:20px 0}.section-title h2{font-size:34px;margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.card{overflow:hidden;background:white;border:1px solid #e7e1d7;border-radius:28px;box-shadow:0 10px 30px rgba(32,39,51,.08);transition:.25s}.card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(23,20,18,.1)}.cover{height:280px;background:#e7e1d7;position:relative}.cover img{width:100%;height:100%;object-fit:cover;display:block}.body{padding:22px}.body h2{margin:8px 0 10px;font-size:24px;line-height:1.18;letter-spacing:0}.muted{color:#68717c;line-height:1.7}.meta{display:grid;gap:5px;color:#68717c;font-size:14px}.tags{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.tag{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;color:#5d665e;white-space:nowrap}.btn{display:inline-flex;margin-top:4px;background:#171412;color:white;border-radius:999px;padding:12px 16px;font-weight:900}.gallery{background:white;border:1px solid #e7e1d7;border-radius:30px;padding:14px;box-shadow:0 12px 35px rgba(23,20,18,.08)}.mainimg{width:100%;height:min(62vw,640px);object-fit:cover;border-radius:24px}.thumbs{display:flex;gap:10px;overflow:auto;margin-top:12px;padding-bottom:4px}.thumbs img{width:120px;height:82px;object-fit:cover;border-radius:14px;flex:0 0 auto}.room-list{display:grid;gap:20px}.room-card{display:grid;grid-template-columns:260px 1fr;gap:20px;background:white;border:1px solid #e7e1d7;border-radius:28px;padding:14px;box-shadow:0 10px 30px rgba(32,39,51,.08)}.room-card img{width:100%;height:210px;object-fit:cover;border-radius:20px}.detail{display:grid;grid-template-columns:1fr 380px;gap:24px;margin-top:24px}.panel{background:white;border:1px solid #e7e1d7;border-radius:28px;padding:24px;box-shadow:0 8px 26px rgba(23,20,18,.06)}.facts{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}.fact{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:18px;padding:14px;font-weight:800;color:#4f5965}.calendar{display:grid;gap:8px}.blocked{background:#fee2e2;color:#991b1b;border-radius:14px;padding:11px 12px;font-weight:800}.media{width:100%;border:0;border-radius:18px;background:#eee;min-height:320px}.video{width:100%;max-height:520px;border-radius:18px;background:#000}.back{display:inline-flex;margin-bottom:20px;color:#5c6470;font-weight:900}@media(max-width:980px){.hero,.grid,.detail,.room-card{grid-template-columns:1fr}.hero-copy{min-height:auto}.hero-img{min-height:300px}.room-card img{height:260px}}@media(max-width:640px){.top{position:relative}.nav{align-items:flex-start;flex-direction:column}.langs{width:100%;display:grid;grid-template-columns:repeat(3,1fr)}.langs button{font-size:12px;padding:9px 8px}.wrap{padding:24px 16px}.hero h1{font-size:38px}.hero p{font-size:15px}.hero-img{min-height:260px;border-radius:26px}.section-title h2{font-size:28px}.cover{height:250px}.body h2{font-size:25px}.mainimg{height:320px}.panel{padding:20px}.media{min-height:250px}}`;

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));
}

function txt(value: Record<Locale, string>, lang: Locale) {
  return value?.[lang] || value?.en || value?.zh || value?.ja || "";
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

function cover(building: Building) {
  return building.coverImage || building.gallery[0]?.url || building.roomTypes[0]?.images[0]?.url || "";
}

function roomCover(room: RoomType) {
  return room.images[0]?.url || "";
}

function station(building: Building, lang: Locale) {
  if (lang === "zh") return `${building.station} · 步行 ${building.walkMinutes} 分钟`;
  if (lang === "ja") return `${building.station} · 徒歩 ${building.walkMinutes}分`;
  return `${building.station} · ${building.walkMinutes} min walk`;
}

function listHtml(buildings: Building[]) {
  const cards = buildings.filter((building) => building.featured).sort((a, b) => a.order - b.order).map((building) => {
    const rooms = building.roomTypes.map((room) => room.roomType).join(" / ");
    return `<article class="card"><a data-href-base="../building/${esc(building.id)}/index.html" href="../building/${esc(building.id)}/index.html"><div class="cover"><img src="${esc(cover(building))}" alt="${esc(txt(building.name, "en"))}"></div><div class="body">${langs.map((lang) => `<div data-lang="${lang}"><p class="eyebrow">${esc(building.area)}</p><h2>${esc(txt(building.name, lang))}</h2><div class="meta"><span>${esc(station(building, lang))}</span><span>${building.roomTypes.length} types · ${esc(rooms)}</span></div><div class="tags">${building.tags.slice(0, 5).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div><span class="btn">${esc(labels[lang].viewTypes)}</span></div>`).join("")}</div></a></article>`;
  }).join("");

  return shell("TokyoStay Residences", `${nav("../")}<main class="wrap"><section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">TokyoStay</span><h1>${esc(labels[lang].listTitle)}</h1><p>${esc(labels[lang].listLead)}</p></div>`).join("")}</div><div class="hero-img"><img src="/images/tokyo-hero.png" alt="Tokyo"></div></section><div class="section-title"><h2>Featured Residences</h2><span class="tag">${buildings.length} residences</span></div><section class="grid">${cards}</section></main>${languageScript()}`);
}

function buildingHtml(building: Building) {
  const rooms = building.roomTypes.filter((room) => room.status === "published").map((room) => `<a class="room-card" data-href-base="../../building/${esc(building.id)}/room/${esc(room.id)}/index.html" href="../../building/${esc(building.id)}/room/${esc(room.id)}/index.html"><img src="${esc(roomCover(room))}" alt="${esc(txt(room.name, "en"))}"><div class="body">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(txt(room.name, lang))}</h2><div class="meta"><span>${esc(room.roomType)} · ${esc(room.capacity)} · ${esc(room.size)}</span><span>${room.rooms.length} rooms: ${esc(room.rooms.join(", ") || "-")}</span></div><p class="muted">${esc(txt(room.description, lang))}</p><div class="tags">${room.tags.slice(0, 5).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div><span class="btn">${esc(labels[lang].viewDetails)}</span></div>`).join("")}</div></a>`).join("");
  const thumbs = building.gallery.map((image) => `<img src="${esc(image.url)}" alt="${esc(image.alt)}">`).join("");
  return shell(txt(building.name, "en"), `${nav("../../")}<main class="wrap">${langs.map((lang) => `<a class="back" data-lang="${lang}" href="../../properties/index.html?lang=${lang}">← ${esc(labels[lang].backResidences)}</a>`).join("")}<section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">Residence</span><h1>${esc(txt(building.name, lang))}</h1><p>${esc(building.area)} · ${esc(station(building, lang))}</p></div>`).join("")}</div><div class="hero-img"><img src="${esc(cover(building))}" alt="${esc(txt(building.name, "en"))}"></div></section><section class="gallery"><img class="mainimg" src="${esc(cover(building))}" alt="${esc(txt(building.name, "en"))}"><div class="thumbs">${thumbs}</div></section><section class="panel" style="margin-top:24px">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(txt(building.name, lang))}</h2><p class="muted">${esc(txt(building.description, lang))}</p></div>`).join("")}</section><section class="section-title"><h2>Room Types</h2></section><section class="room-list">${rooms}</section></main>${languageScript()}`);
}

function roomHtml(building: Building, room: RoomType) {
  const imgs = room.images.length ? room.images : building.gallery;
  const main = roomCover(room) || cover(building);
  return shell(txt(room.name, "en"), `${nav("../../../../")}<main class="wrap">${langs.map((lang) => `<a class="back" data-lang="${lang}" href="../../../${esc(building.id)}/index.html?lang=${lang}">← ${esc(labels[lang].backTypes)}</a>`).join("")}<section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">${esc(txt(building.name, lang))}</span><h1>${esc(txt(room.name, lang))}</h1><p>${esc(room.roomType)} · ${esc(room.capacity)} · ${esc(room.size)} · ${esc(station(building, lang))}</p></div>`).join("")}</div><div class="hero-img"><img src="${esc(main)}" alt="${esc(txt(room.name, "en"))}"></div></section><section class="gallery"><img class="mainimg" src="${esc(main)}" alt="${esc(txt(room.name, "en"))}"><div class="thumbs">${imgs.map((image) => `<img src="${esc(image.url)}" alt="${esc(image.alt)}">`).join("")}</div></section><section class="detail"><div class="panel">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].overview)}</h2><div class="facts"><span class="fact">${esc(building.area)}</span><span class="fact">${esc(room.roomType)}</span><span class="fact">${esc(room.capacity)}</span><span class="fact">${esc(room.size)}</span></div><p class="muted">${esc(txt(room.description, lang))}</p><h2>${esc(labels[lang].amenities)}</h2><div class="tags">${room.amenities.map((item) => `<span class="tag">${esc(item)}</span>`).join("")}</div></div>`).join("")}</div><aside class="panel">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].unavailable)}</h2><div class="calendar">${room.unavailableDates.map((range) => `<div class="blocked">${esc(range.start)} - ${esc(range.end)}</div>`).join("") || `<p class="muted">-</p>`}</div></div>`).join("")}</aside></section><section class="detail"><div class="panel"><h2>Room Tour</h2>${room.videos[0] ? (room.videos[0].url.includes("youtube") ? `<iframe class="media" src="${esc(room.videos[0].url)}" allowfullscreen></iframe>` : `<video class="video" src="${esc(room.videos[0].url)}" controls></video>`) : `<p class="muted">-</p>`}</div><div class="panel"><h2>Map</h2>${room.map.embedUrl ? (room.map.type === "image" ? `<img class="media" src="${esc(room.map.embedUrl)}" alt="${esc(room.map.address)}">` : `<iframe class="media" src="${esc(room.map.embedUrl)}" loading="lazy"></iframe>`) : `<p class="muted">-</p>`}</div></section></main>${languageScript()}`);
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
  const payload = await request.json();
  const buildings = (Array.isArray(payload.buildings) ? payload.buildings : []) as Building[];
  if (!buildings.length) return NextResponse.json({ error: "Missing building data" }, { status: 400 });

  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  if (!secretId || !secretKey) return NextResponse.json({ error: "Missing Tencent COS credentials" }, { status: 500 });

  const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
  await uploadText(cos, `${deployPrefix}/properties/index.html`, listHtml(buildings));

  for (const building of buildings) {
    await uploadText(cos, `${deployPrefix}/building/${building.id}/index.html`, buildingHtml(building));
    for (const room of building.roomTypes.filter((item) => item.status === "published")) {
      await uploadText(cos, `${deployPrefix}/building/${building.id}/room/${room.id}/index.html`, roomHtml(building, room));
    }
  }

  return NextResponse.json({
    ok: true,
    listUrl: `${siteUrl}/${deployPrefix}/properties/index.html`,
    url: `${siteUrl}/${deployPrefix}/building/${payload.currentBuildingId || buildings[0].id}/index.html`
  });
}
