import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "work", "deploy");
const landingSource = path.join(root, "work", "landing", "index.html");
const properties = JSON.parse(await fs.readFile(path.join(root, "data", "properties.json"), "utf8"));

const t = {
  en: {
    subline: "Vacation Rentals · Long Stay",
    propertyTitle: "Property Showcase",
    propertyDesc: "View available TokyoStay rooms",
    contactLabel: "Contact",
    lineDesc: "Chat with us on LINE",
    waDesc: "Chat with us on WhatsApp",
    wechatDesc: "Scan QR code to add us",
    response: "Usually responds within 24 hours",
    pageTitle: "TokyoStay Properties",
    pageLead: "Curated Tokyo rooms for short stays, long stays, and relocation.",
    view: "View details",
    details: "Property details",
    unavailable: "Unavailable dates",
    back: "Back to properties"
  },
  zh: {
    subline: "民宿 · 长租",
    propertyTitle: "房源展示",
    propertyDesc: "查看 TokyoStay 可预约房源",
    contactLabel: "联系方式",
    lineDesc: "通过 LINE 咨询",
    waDesc: "通过 WhatsApp 咨询",
    wechatDesc: "扫码添加微信",
    response: "通常 24 小时内回复",
    pageTitle: "TokyoStay 房源展示",
    pageLead: "适合东京短住、长租、搬家过渡与商务差旅的精选房源。",
    view: "查看详情",
    details: "房源详情",
    unavailable: "不可入住日期",
    back: "返回房源列表"
  },
  ja: {
    subline: "民泊 · 長期滞在",
    propertyTitle: "物件一覧",
    propertyDesc: "TokyoStayの募集中物件を見る",
    contactLabel: "お問い合わせ",
    lineDesc: "LINEで問い合わせ",
    waDesc: "WhatsAppで問い合わせ",
    wechatDesc: "QRコードを読み取りWeChatを追加",
    response: "通常24時間以内に返信します",
    pageTitle: "TokyoStay 物件一覧",
    pageLead: "東京での短期滞在、長期滞在、転居準備、出張に適した物件をご紹介します。",
    view: "詳細を見る",
    details: "物件詳細",
    unavailable: "予約不可日",
    back: "物件一覧へ戻る"
  }
};

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function local(value, lang) {
  return value?.[lang] || value?.en || value?.zh || value?.ja || "";
}

function cover(property) {
  return property.images.find((image) => image.type === "cover") || property.images[0] || { url: "", alt: "" };
}

function pageShell({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Hiragino Sans",Arial,sans-serif;background:#f6f4ef;color:#171412;-webkit-text-size-adjust:100%}a{text-decoration:none;color:inherit}.top{position:sticky;top:0;z-index:10;background:rgba(246,244,239,.9);backdrop-filter:blur(16px);border-bottom:1px solid #e7e1d7}.nav{max-width:1180px;margin:auto;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}.brand{font-weight:900}.langs{display:flex;gap:6px;flex-wrap:wrap}.langs button{border:1px solid #e7e1d7;background:white;border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.langs button.active{background:#171412;color:white}.wrap{max-width:1180px;margin:auto;padding:34px 20px}.hero{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.hero h1{font-size:clamp(34px,6vw,64px);line-height:1.02;margin:0 0 12px;letter-spacing:0}.hero p{font-size:17px;line-height:1.8;color:#5c6470;max-width:680px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.card{overflow:hidden;background:white;border:1px solid #e7e1d7;border-radius:26px;box-shadow:0 12px 35px rgba(23,20,18,.08)}.collage{display:grid;grid-template-columns:1.2fr .8fr;gap:4px;height:260px;background:#e7e1d7}.collage img{width:100%;height:100%;object-fit:cover;display:block}.collage .right{display:grid;grid-template-rows:1fr 1fr;gap:4px}.body{padding:20px}.body h2{margin:0 0 10px;font-size:24px;line-height:1.18;letter-spacing:0}.muted{color:#68717c;line-height:1.7}.tags{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.tag{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;color:#5d665e;white-space:nowrap}.btn{display:inline-flex;margin-top:14px;background:#171412;color:white;border-radius:999px;padding:12px 16px;font-weight:900}.gallery{background:white;border:1px solid #e7e1d7;border-radius:28px;padding:14px;box-shadow:0 12px 35px rgba(23,20,18,.08)}.mainimg{width:100%;height:min(62vw,620px);object-fit:cover;border-radius:22px}.thumbs{display:flex;gap:10px;overflow:auto;margin-top:12px;padding-bottom:4px}.thumbs img{width:120px;height:82px;object-fit:cover;border-radius:14px;flex:0 0 auto}.detail{display:grid;grid-template-columns:1fr 360px;gap:24px;margin-top:24px}.panel{background:white;border:1px solid #e7e1d7;border-radius:24px;padding:22px;box-shadow:0 8px 26px rgba(23,20,18,.06)}.calendar{display:grid;grid-template-columns:1fr;gap:8px}.blocked{background:#fee2e2;color:#991b1b;border-radius:14px;padding:11px 12px;font-weight:800}.media{width:100%;border:0;border-radius:18px;background:#eee;min-height:320px}.video{width:100%;max-height:520px;border-radius:18px;background:#000}.back{display:inline-flex;margin-bottom:20px;color:#5c6470;font-weight:900}@media(max-width:880px){.top{position:relative}.nav{align-items:flex-start;gap:12px;flex-direction:column;padding:18px 18px 14px}.langs{width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.langs button{padding:9px 8px;font-size:13px}.wrap{padding:24px 18px}.hero{display:block;margin-bottom:22px}.hero h1{font-size:34px;line-height:1.08;margin-bottom:14px}.hero p{font-size:16px;line-height:1.75}.grid,.detail{grid-template-columns:1fr;gap:18px}.card{border-radius:24px}.collage{display:block;height:280px}.collage>img{height:100%}.collage .right{display:none}.body{padding:22px 20px 24px}.body h2{font-size:28px}.muted{font-size:16px;line-height:1.55}.tags{gap:8px;margin:16px 0}.tag{font-size:13px;padding:8px 11px;max-width:100%;white-space:normal}.btn{padding:13px 18px}.mainimg{height:390px}.panel{padding:20px;border-radius:22px}.media{min-height:260px}}@media(max-width:430px){.wrap{padding:22px 14px}.hero h1{font-size:30px}.hero p{font-size:15px}.collage{height:245px}.body h2{font-size:25px}.muted{font-size:15px}.mainimg{height:320px}.thumbs img{width:96px;height:68px}.card{border-radius:22px}.langs button{font-size:12px}}
</style>
</head>
<body>${body}</body>
</html>`;
}

function languageScript() {
  return `<script>
function setLang(lang){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-lang]').forEach(el=>{el.style.display=el.dataset.lang===lang?'':'none'});
  document.querySelectorAll('[data-lang-btn]').forEach(el=>el.classList.toggle('active',el.dataset.langBtn===lang));
  document.querySelectorAll('a[data-href-base]').forEach(a=>{a.href=a.dataset.hrefBase+(a.dataset.hrefBase.includes('?')?'&':'?')+'lang='+lang});
  localStorage.setItem('tokyostayLang',lang);
}
setLang(new URLSearchParams(location.search).get('lang')||localStorage.getItem('tokyostayLang')||'en');
</script>`;
}

function nav(prefix = "") {
  return `<header class="top"><div class="nav"><a class="brand" href="${prefix}properties/index.html">TokyoStay</a><div class="langs"><button data-lang-btn="en" onclick="setLang('en')">English</button><button data-lang-btn="zh" onclick="setLang('zh')">中文</button><button data-lang-btn="ja" onclick="setLang('ja')">日本語</button></div></div></header>`;
}

async function makeLanding() {
  let html = await fs.readFile(landingSource, "utf8");
  html = html
    .replace('lang="en"', 'lang="en"')
    .replace('Vacation Rentals ﾂｷ Long Stay', "Vacation Rentals · Long Stay")
    .replace('<button class="lang-btn" onclick="setLang(\'zh\')" id="btn-zh">荳ｭ譁・/button>', '<button class="lang-btn" onclick="setLang(\'zh\')" id="btn-zh">中文</button>')
    .replace('<button class="lang-btn" onclick="setLang(\'ja\')" id="btn-ja">譌･譛ｬ隱・/button>', '<button class="lang-btn" onclick="setLang(\'ja\')" id="btn-ja">日本語</button>')
    .replace('href="#" id="propertyLink"', 'href="properties/index.html?lang=en" id="propertyLink"')
    .replace('<div class="property-icon">竚・/div>', '<div class="property-icon">房</div>')
    .replace('<div class="arrow">窶ｺ</div>', '<div class="arrow">›</div>')
    .replaceAll('<div class="arrow">窶ｺ</div>', '<div class="arrow">›</div>')
    .replace('<div class="icon wechat">蠕ｮ菫｡</div>', '<div class="icon wechat">微信</div>')
    .replace('<div class="icon mail">透</div>', '<div class="icon mail">MAIL</div>');

  const copy = `const copy=${JSON.stringify({
    en: {
      subline: t.en.subline,
      propertyTitle: t.en.propertyTitle,
      propertyDesc: t.en.propertyDesc,
      contactLabel: t.en.contactLabel,
      lineDesc: t.en.lineDesc,
      waDesc: t.en.waDesc,
      wechatDesc: t.en.wechatDesc,
      response: t.en.response
    },
    zh: {
      subline: t.zh.subline,
      propertyTitle: t.zh.propertyTitle,
      propertyDesc: t.zh.propertyDesc,
      contactLabel: t.zh.contactLabel,
      lineDesc: t.zh.lineDesc,
      waDesc: t.zh.waDesc,
      wechatDesc: t.zh.wechatDesc,
      response: t.zh.response
    },
    ja: {
      subline: t.ja.subline,
      propertyTitle: t.ja.propertyTitle,
      propertyDesc: t.ja.propertyDesc,
      contactLabel: t.ja.contactLabel,
      lineDesc: t.ja.lineDesc,
      waDesc: t.ja.waDesc,
      wechatDesc: t.ja.wechatDesc,
      response: t.ja.response
    }
  })};`;

  html = html.replace(/const copy=\{[\s\S]*?\};\s*function setLang/, `${copy}
function setLang`);
  html = html.replace(/function setLang\(lang\)\{[\s\S]*?\n\}/, `function setLang(lang){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key=el.getAttribute("data-i18n");
    if(copy[lang]&&copy[lang][key]) el.textContent=copy[lang][key];
  });
  document.querySelectorAll(".lang-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("btn-"+lang).classList.add("active");
  const link=document.getElementById("propertyLink");
  if(link) link.href="properties/index.html?lang="+lang;
  localStorage.setItem("tokyostayLang",lang);
}`);
  html = html.replace("</script>", `setLang(new URLSearchParams(location.search).get("lang")||localStorage.getItem("tokyostayLang")||"en");
</script>`);

  await fs.writeFile(path.join(out, "index.html"), html, "utf8");
}

async function makeList() {
  const cards = properties.filter((p) => p.status === "published").map((p) => {
    const imgs = [cover(p), p.images[1] || cover(p), p.images[2] || cover(p)];
    return `<article class="card">
      <div class="collage"><img src="${esc(imgs[0].url)}" alt="${esc(imgs[0].alt)}"><div class="right"><img src="${esc(imgs[1].url)}" alt="${esc(imgs[1].alt)}"><img src="${esc(imgs[2].url)}" alt="${esc(imgs[2].alt)}"></div></div>
      <div class="body">
        ${["en", "zh", "ja"].map((lang) => `<div data-lang="${lang}"><h2>${esc(local(p.title, lang))}</h2><p class="muted">${esc(p.area)} · ${esc(p.roomType)} · ${esc(p.capacity)} · ${esc(p.size)}</p><div class="tags">${p.amenities.slice(0, 5).map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div><a class="btn" data-href-base="../property/${esc(p.id)}/index.html" href="../property/${esc(p.id)}/index.html?lang=${lang}">${esc(t[lang].view)}</a></div>`).join("")}
      </div>
    </article>`;
  }).join("");

  const body = `${nav("../")}<main class="wrap"><section class="hero">${["en", "zh", "ja"].map((lang) => `<div data-lang="${lang}"><h1>${esc(t[lang].pageTitle)}</h1><p>${esc(t[lang].pageLead)}</p></div>`).join("")}</section><section class="grid">${cards}</section></main>${languageScript()}`;
  await fs.mkdir(path.join(out, "properties"), { recursive: true });
  await fs.writeFile(path.join(out, "properties", "index.html"), pageShell({ title: "TokyoStay Properties", body }), "utf8");
}

async function makeDetails() {
  for (const p of properties.filter((item) => item.status === "published")) {
    const imgs = p.images.length ? p.images : [cover(p)];
    const body = `${nav("../../")}<main class="wrap">
      ${["en", "zh", "ja"].map((lang) => `<a class="back" data-lang="${lang}" href="../../properties/index.html?lang=${lang}">‹ ${esc(t[lang].back)}</a>`).join("")}
      <section class="hero">${["en", "zh", "ja"].map((lang) => `<div data-lang="${lang}"><h1>${esc(local(p.title, lang))}</h1><p>${esc(p.area)} · ${esc(p.roomType)} · ${esc(p.capacity)} · ${esc(p.size)} · ${esc(p.traffic)}</p></div>`).join("")}</section>
      <section class="gallery"><img class="mainimg" src="${esc(imgs[0].url)}" alt="${esc(imgs[0].alt)}"><div class="thumbs">${imgs.map((img) => `<img src="${esc(img.url)}" alt="${esc(img.alt)}">`).join("")}</div></section>
      <section class="detail"><div class="panel">${["en", "zh", "ja"].map((lang) => `<div data-lang="${lang}"><h2>${esc(t[lang].details)}</h2><p class="muted">${esc(local(p.description, lang))}</p><div class="tags">${p.amenities.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div></div>`).join("")}</div><aside class="panel">${["en", "zh", "ja"].map((lang) => `<div data-lang="${lang}"><h2>${esc(t[lang].unavailable)}</h2><div class="calendar">${p.unavailableDates.map((r) => `<div class="blocked">${esc(r.start)} - ${esc(r.end)}</div>`).join("") || `<p class="muted">-</p>`}</div></div>`).join("")}</aside></section>
      <section class="detail"><div class="panel"><h2>Room Tour</h2>${p.videos[0] ? (p.videos[0].url.includes("youtube") ? `<iframe class="media" src="${esc(p.videos[0].url)}" allowfullscreen></iframe>` : `<video class="video" src="${esc(p.videos[0].url)}" controls></video>`) : `<p class="muted">-</p>`}</div><div class="panel"><h2>Map</h2>${p.map.embedUrl ? (p.map.type === "image" ? `<img class="media" src="${esc(p.map.embedUrl)}" alt="${esc(p.map.address)}">` : `<iframe class="media" src="${esc(p.map.embedUrl)}" loading="lazy"></iframe>`) : `<p class="muted">-</p>`}</div></section>
    </main>${languageScript()}`;
    const dir = path.join(out, "property", p.id);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), pageShell({ title: local(p.title, "en"), body }), "utf8");
  }
}

await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
await makeLanding();
await makeList();
await makeDetails();

console.log(`Generated static TokyoStay site in ${out}`);
