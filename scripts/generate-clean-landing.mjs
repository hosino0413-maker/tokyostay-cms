import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "work", "root-index");
const outFile = path.join(outDir, "index.html");
const propertyUrl = "https://tokyostay.asia/deploy/properties/index.html";

const copy = {
  en: {
    subline: "Vacation Rentals · Long Stay",
    propertyTitle: "Property Showcase",
    propertyDesc: "View available TokyoStay rooms",
    contactLabel: "Contact",
    lineDesc: "Chat with us on LINE",
    waDesc: "Chat with us on WhatsApp",
    wechatDesc: "Scan QR code to add us",
    response: "Usually responds within 24 hours"
  },
  zh: {
    subline: "民宿 · 长租",
    propertyTitle: "房源展示",
    propertyDesc: "查看 TokyoStay 可预约房源",
    contactLabel: "联系方式",
    lineDesc: "通过 LINE 咨询",
    waDesc: "通过 WhatsApp 咨询",
    wechatDesc: "扫码添加微信",
    response: "通常 24 小时内回复"
  },
  ja: {
    subline: "民泊 · 長期滞在",
    propertyTitle: "物件一覧",
    propertyDesc: "TokyoStayの募集中物件を見る",
    contactLabel: "お問い合わせ",
    lineDesc: "LINEで問い合わせ",
    waDesc: "WhatsAppで問い合わせ",
    wechatDesc: "QRコードを読み取りWeChatを追加",
    response: "通常24時間以内に返信します"
  }
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>TokyoStay</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Hiragino Sans",Arial,sans-serif;
  color:#0d2847;
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  background:
    linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,.86)),
    url("background-desktop.png") center/cover no-repeat fixed;
}
.page{
  width:100%;
  max-width:430px;
  min-height:760px;
  position:relative;
  overflow:hidden;
  padding:28px 22px 24px;
  border-radius:28px;
  background:rgba(255,255,255,.76);
  box-shadow:0 30px 90px rgba(0,0,0,.20);
  backdrop-filter:blur(10px);
}
.inner{position:relative;z-index:2;text-align:center;padding-top:8px}
.logo-img{width:188px;max-width:78%;display:block;margin:0 auto 8px;filter:drop-shadow(0 8px 18px rgba(13,40,71,.12))}
h1{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:43px;line-height:1;letter-spacing:-1.4px;color:#0d2847}
.subline{margin:9px 0 14px;font-size:14px;font-weight:900;color:#102d4d;letter-spacing:.02em}
.gold-line{width:50px;height:2px;background:#d8b36d;border-radius:99px;margin:0 auto 14px}
.langs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0 14px}
.lang-btn{border:1px solid rgba(13,40,71,.16);background:rgba(255,255,255,.86);color:#0d2847;height:34px;border-radius:999px;font-size:12px;font-weight:900;box-shadow:0 6px 16px rgba(13,40,71,.06);cursor:pointer}
.lang-btn.active{background:#0d2847;color:white;border-color:#0d2847}
.property-link{display:flex;align-items:center;gap:13px;width:100%;min-height:76px;margin:12px 0 16px;padding:15px;border-radius:18px;text-decoration:none;color:#fff;background:linear-gradient(135deg,#0d2847,#173d68);box-shadow:0 16px 32px rgba(13,40,71,.20)}
.property-icon{width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(216,179,109,.18);color:#d8b36d;font-size:18px;font-weight:950;flex:0 0 auto}
.property-link .text{flex:1;text-align:left}
.property-link .title{font-size:18px;font-weight:950;margin-bottom:4px}
.property-link .desc{font-size:12.5px;line-height:1.35;color:rgba(255,255,255,.78);font-weight:700}
.property-link .arrow{font-size:28px;color:#d8b36d}
.section-label{margin:8px 0 10px;text-align:left;font-size:13px;font-weight:950;color:#846237;letter-spacing:.08em;text-transform:uppercase}
.contact{min-height:64px;width:100%;display:flex;align-items:center;gap:13px;padding:13px;margin:0 0 10px;border-radius:16px;background:rgba(255,255,255,.92);box-shadow:0 10px 25px rgba(13,40,71,.08);text-decoration:none;color:#0d2847;border:1px solid rgba(13,40,71,.06)}
.icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:950;color:white;flex:0 0 auto}
.line,.wa,.wechat{background:#18c45f}.mail{background:#0d6bc8}
.contact .text{flex:1;text-align:left}
.contact .title{font-size:16px;font-weight:950;margin-bottom:3px}
.contact .desc{font-size:12px;line-height:1.25;color:#173d68;font-weight:760}
.contact .value{color:#6b7280;margin-top:2px}
.arrow{font-size:23px;color:#c28b2e}.qr{width:58px;height:58px;object-fit:cover;border-radius:8px;margin-left:auto}
.wechat-hint{font-size:11px;color:#8b95a1;margin-top:4px;font-weight:700}
.response{margin-top:14px;display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.78);color:#0d2847;font-size:13px;font-weight:900;box-shadow:0 8px 20px rgba(13,40,71,.06)}
@media(max-width:760px){
  body{align-items:flex-start;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.88)),url("background-mobile.png") center/cover no-repeat fixed}
  .page{min-height:100vh;border-radius:0;box-shadow:none;background:rgba(255,255,255,.72)}
}
</style>
</head>
<body>
<main class="page">
  <div class="inner">
    <img class="logo-img" src="tokyostay-logo.png" alt="TokyoStay Logo">
    <h1>TokyoStay</h1>
    <p class="subline" data-i18n="subline">Vacation Rentals · Long Stay</p>
    <div class="gold-line"></div>
    <section class="langs">
      <button class="lang-btn active" onclick="setLang('en')" id="btn-en">English</button>
      <button class="lang-btn" onclick="setLang('zh')" id="btn-zh">中文</button>
      <button class="lang-btn" onclick="setLang('ja')" id="btn-ja">日本語</button>
    </section>
    <a class="property-link" href="${propertyUrl}?lang=en" id="propertyLink" onclick="return openProperties(event)">
      <div class="property-icon">房</div>
      <div class="text">
        <div class="title" data-i18n="propertyTitle">Property Showcase</div>
        <div class="desc" data-i18n="propertyDesc">View available TokyoStay rooms</div>
      </div>
      <div class="arrow">›</div>
    </a>
    <div class="section-label" data-i18n="contactLabel">Contact</div>
    <a class="contact" href="https://line.me/ti/p/~Allen117">
      <div class="icon line">LINE</div>
      <div class="text"><div class="title">LINE</div><div class="desc" data-i18n="lineDesc">Chat with us on LINE</div></div>
      <div class="arrow">›</div>
    </a>
    <a class="contact" href="https://wa.me/818094455589">
      <div class="icon wa">WA</div>
      <div class="text"><div class="title">WhatsApp</div><div class="desc" data-i18n="waDesc">Chat with us on WhatsApp</div></div>
      <div class="arrow">›</div>
    </a>
    <div class="contact">
      <div class="icon wechat">微信</div>
      <div class="text"><div class="title">WeChat</div><div class="desc" data-i18n="wechatDesc">Scan QR code to add us</div><div class="wechat-hint">ID: yu416703657</div></div>
      <img class="qr" src="wechat.png" alt="WeChat QR Code">
    </div>
    <a class="contact" href="mailto:tokyostay365@gmail.com">
      <div class="icon mail">MAIL</div>
      <div class="text"><div class="title">Email</div><div class="desc">TokyoStay Email</div><div class="desc value">tokyostay365@gmail.com</div></div>
      <div class="arrow">›</div>
    </a>
    <div class="response" data-i18n="response">Usually responds within 24 hours</div>
  </div>
</main>
<script>
const copy=${JSON.stringify(copy)};
function setLang(lang){
  const selected=copy[lang]?lang:"en";
  document.documentElement.lang=selected;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key=el.getAttribute("data-i18n");
    if(copy[selected]&&copy[selected][key]) el.textContent=copy[selected][key];
  });
  document.querySelectorAll(".lang-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("btn-"+selected).classList.add("active");
  const link=document.getElementById("propertyLink");
  if(link) link.href="${propertyUrl}?lang="+selected;
  localStorage.setItem("tokyostayLang",selected);
}
function openProperties(event){
  if(event) event.preventDefault();
  const lang=localStorage.getItem("tokyostayLang")||document.documentElement.lang||"en";
  window.location.href="${propertyUrl}?lang="+encodeURIComponent(lang);
  return false;
}
setLang(new URLSearchParams(location.search).get("lang")||localStorage.getItem("tokyostayLang")||"en");
</script>
</body>
</html>
`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outFile, html, "utf8");
console.log(outFile);
