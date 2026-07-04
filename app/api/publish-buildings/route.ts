import COS from "cos-nodejs-sdk-v5";
import { NextRequest, NextResponse } from "next/server";
import { tagLabel } from "@/lib/tags";
import type { Building, Locale, RoomType } from "@/types/property";

export const runtime = "nodejs";

const deployPrefix = "deploy";
const siteUrl = "https://tokyostay.asia";
const heroImageUrl = "https://tokyostay-cms-gshaiql6.edgeone.cool/images/tokyo-hero.png";
const langs: Locale[] = ["en", "zh", "ja"];

const labels = {
  en: {
    listTitle: "Find your Tokyo stay",
    listLead: "Curated residences for monthly stays, relocation, and business travel across Tokyo.",
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
    map: "Map",
    area: "Area",
    allAreas: "All areas",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    search: "Search",
    gallery: "Gallery"
  },
  zh: {
    listTitle: "寻找你的东京住宿",
    listLead: "适合东京短住、月租、搬家过渡与商务差旅的精选房源。",
    featured: "精选楼盘",
    viewTypes: "查看房型",
    roomTypes: "房型",
    viewDetails: "查看详情",
    backResidences: "返回楼盘列表",
    backTypes: "返回房型列表",
    overview: "房型介绍",
    amenities: "设施",
    unavailable: "不可入住日期",
    video: "视频",
    map: "地图",
    area: "区域",
    allAreas: "全部区域",
    checkIn: "入住日期",
    checkOut: "退房日期",
    guests: "入住人数",
    search: "搜索",
    gallery: "图片"
  },
  ja: {
    listTitle: "東京の滞在先を探す",
    listLead: "短期滞在、月単位滞在、引越し準備、出張に適した東京のレジデンス。",
    featured: "おすすめレジデンス",
    viewTypes: "タイプを見る",
    roomTypes: "タイプ",
    viewDetails: "詳細を見る",
    backResidences: "一覧へ戻る",
    backTypes: "タイプ一覧へ戻る",
    overview: "概要",
    amenities: "設備",
    unavailable: "利用不可日",
    video: "動画",
    map: "地図",
    area: "エリア",
    allAreas: "すべてのエリア",
    checkIn: "チェックイン",
    checkOut: "チェックアウト",
    guests: "人数",
    search: "検索",
    gallery: "写真"
  }
} as const;

const areaOptions = [
  { value: "all", labels: { en: "All areas", zh: "全部区域", ja: "すべてのエリア" } },
  { value: "shinjuku", labels: { en: "Shinjuku", zh: "新宿", ja: "新宿" } },
  { value: "shibuya", labels: { en: "Shibuya", zh: "涩谷", ja: "渋谷" } },
  { value: "taito", labels: { en: "Taito", zh: "台东", ja: "台東" } },
  { value: "bunkyo", labels: { en: "Bunkyo", zh: "文京", ja: "文京" } }
];

const css = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","Noto Sans JP",Arial,sans-serif;background:#f6f4ef;color:#171412;-webkit-text-size-adjust:100%}a{text-decoration:none;color:inherit}.top{position:sticky;top:0;z-index:20;background:rgba(246,244,239,.9);backdrop-filter:blur(18px);border-bottom:1px solid #e7e1d7}.nav{max-width:1180px;margin:auto;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px}.brand{font-weight:900}.langs{display:flex;gap:8px;flex-wrap:wrap}.langs button{border:1px solid #e7e1d7;background:white;border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.langs button.active{background:#171412;color:white}.wrap{max-width:1180px;margin:auto;padding:34px 20px}.search-hero{position:relative;min-height:560px;margin:0 auto 34px;border-radius:34px;overflow:hidden;background:#171412;box-shadow:0 22px 64px rgba(23,20,18,.12)}.search-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.search-card{position:relative;z-index:1;width:min(520px,calc(100% - 40px));margin:48px 0 48px 48px;border-radius:28px;background:rgba(255,255,255,.96);padding:34px;box-shadow:0 20px 60px rgba(23,20,18,.16);border:1px solid rgba(0,0,0,.06)}.search-card h1{font-size:clamp(40px,5vw,64px);line-height:1.02;margin:18px 0 14px;letter-spacing:0}.search-card p{font-size:16px;line-height:1.75;color:#5c6470}.eyebrow{display:inline-flex;width:max-content;border:1px solid #e7e1d7;background:white;border-radius:999px;padding:9px 13px;color:#b8462f;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.search-form{display:grid;gap:12px;margin-top:24px}.field{display:block;border:1px solid #e7e1d7;background:white;border-radius:18px;padding:13px 16px}.field span{display:block;color:#171412;font-size:12px;font-weight:900}.field input,.field select{margin-top:7px;width:100%;border:0;background:transparent;outline:0;font-size:17px;color:#171412}.date-row{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #e7e1d7;border-radius:18px;overflow:hidden;background:white}.date-row .field{border:0;border-radius:0}.date-row .field:first-child{border-right:1px solid #e7e1d7}.search-btn{display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:18px;background:#e61e5d;color:white;padding:16px 18px;font-size:16px;font-weight:900;cursor:pointer}.hero{display:grid;grid-template-columns:1fr .72fr;gap:28px;align-items:stretch;margin-bottom:30px}.hero-copy{min-height:360px;display:flex;flex-direction:column;justify-content:center}.hero h1{font-size:clamp(42px,7vw,76px);line-height:.98;margin:24px 0 10px;letter-spacing:0}.hero p{font-size:17px;line-height:1.8;color:#5c6470;max-width:680px}.hero-img{min-height:360px;border-radius:34px;overflow:hidden;box-shadow:0 20px 60px rgba(23,20,18,.1)}.hero-img img{width:100%;height:100%;object-fit:cover;display:block}.section-title{display:flex;justify-content:space-between;align-items:end;gap:16px;margin:20px 0}.section-title h2{font-size:34px;margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.card{overflow:hidden;background:white;border:1px solid #e7e1d7;border-radius:28px;box-shadow:0 10px 30px rgba(32,39,51,.08);transition:.25s}.card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(23,20,18,.1)}.cover{height:280px;background:#e7e1d7;position:relative}.cover img{width:100%;height:100%;object-fit:cover;display:block}.body{padding:22px}.body h2{margin:8px 0 10px;font-size:24px;line-height:1.18;letter-spacing:0}.muted{color:#68717c;line-height:1.7}.meta{display:grid;gap:5px;color:#68717c;font-size:14px}.tags{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.tag{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;color:#5d665e;white-space:nowrap}.btn{display:inline-flex;margin-top:4px;background:#171412;color:white;border-radius:999px;padding:12px 16px;font-weight:900}.gallery{background:white;border:1px solid #e7e1d7;border-radius:30px;padding:14px;box-shadow:0 12px 35px rgba(23,20,18,.08);scroll-margin-top:120px}.gallery-stage{position:relative;overflow:hidden;border-radius:24px;background:#e7e1d7;touch-action:pan-y}.mainimg{width:100%;height:min(62vw,640px);object-fit:cover;border-radius:24px;display:block}.gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:44px;height:44px;border:1px solid rgba(255,255,255,.75);border-radius:999px;background:rgba(255,255,255,.86);box-shadow:0 12px 30px rgba(23,20,18,.14);font-size:24px;cursor:pointer}.gallery-arrow.prev{left:16px}.gallery-arrow.next{right:16px}.gallery-count{position:absolute;left:16px;top:16px;border-radius:999px;background:rgba(23,20,18,.64);color:white;padding:8px 12px;font-size:13px;font-weight:900}.thumbs{display:flex;gap:10px;overflow:auto;margin-top:12px;padding-bottom:4px}.thumbs button{border:0;background:transparent;padding:0;cursor:pointer;opacity:.62;transition:.2s}.thumbs button.active{opacity:1}.thumbs button.active img{outline:3px solid #171412}.thumbs img{width:120px;height:82px;object-fit:cover;border-radius:14px;flex:0 0 auto}.room-list{display:grid;gap:20px}.room-card{display:grid;grid-template-columns:260px 1fr;gap:20px;background:white;border:1px solid #e7e1d7;border-radius:28px;padding:14px;box-shadow:0 10px 30px rgba(32,39,51,.08)}.room-card img{width:100%;height:210px;object-fit:cover;border-radius:20px}.room-layout{display:grid;grid-template-columns:180px minmax(0,1fr);gap:32px;align-items:start}.side-nav-wrap{position:relative;min-height:100%;align-self:stretch}.side-nav{position:sticky;top:120px;z-index:20;border:1px solid rgba(255,255,255,.76);border-radius:24px;background:rgba(255,255,255,.88);padding:10px;box-shadow:0 20px 55px rgba(23,20,18,.10);backdrop-filter:blur(18px)}.side-nav button,.mobile-tabs button{border:0;cursor:pointer}.side-nav button{display:flex;align-items:center;gap:10px;width:100%;border-radius:999px;background:transparent;padding:11px 14px;color:#4f5965;font-weight:800;text-align:left}.side-nav button.active{background:rgba(184,70,47,.12);color:#b8462f}.mobile-tabs{display:none;position:sticky;top:69px;z-index:19;gap:8px;overflow-x:auto;border-bottom:1px solid #e7e1d7;background:rgba(246,244,239,.9);padding:12px 20px;backdrop-filter:blur(18px)}.mobile-tabs button{flex:0 0 auto;border-radius:999px;background:white;padding:9px 14px;color:#4f5965;font-weight:800;box-shadow:inset 0 0 0 1px #e7e1d7}.mobile-tabs button.active{background:rgba(184,70,47,.12);color:#b8462f}.detail{display:grid;grid-template-columns:1fr 380px;gap:24px;margin-top:24px;scroll-margin-top:120px}.panel{background:white;border:1px solid #e7e1d7;border-radius:28px;padding:24px;box-shadow:0 8px 26px rgba(23,20,18,.06)}.facts{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}.fact{background:#f6f4ef;border:1px solid #e7e1d7;border-radius:18px;padding:14px;font-weight:800;color:#4f5965}.calendar-ui{width:100%;border-radius:28px;background:rgba(255,255,255,.9);box-shadow:0 8px 26px rgba(23,20,18,.06)}.calendar-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:10px 0 18px}.calendar-head button{display:grid;place-items:center;width:40px;height:40px;border:1px solid #e7e1d7;border-radius:999px;background:white;color:#4f5965;font-size:20px;cursor:pointer}.calendar-title{font-size:18px;font-weight:900}.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px}.calendar-dow{padding:6px 0;text-align:center;color:#8b949e;font-size:11px;font-weight:900;text-transform:uppercase}.calendar-day{display:grid;place-items:center;aspect-ratio:1;border:1px solid #e7e1d7;border-radius:999px;background:#f6f4ef;color:#171412;font-size:14px}.calendar-day.empty{border-color:transparent;background:transparent}.calendar-day.blocked{border-color:#fecaca;background:#fee2e2;color:#b91c1c;font-weight:900;text-decoration:line-through}.calendar-note{margin-top:14px;color:#68717c;font-size:12px}.calendar{display:grid;gap:8px}.blocked{background:#fee2e2;color:#991b1b;border-radius:14px;padding:11px 12px;font-weight:800}.media{width:100%;border:0;border-radius:18px;background:#eee;min-height:320px}.video{width:100%;max-height:520px;border-radius:18px;background:#000}.back{display:inline-flex;margin-bottom:20px;color:#5c6470;font-weight:900}section[id],div[id]{scroll-margin-top:120px}@media(max-width:980px){.hero,.grid,.detail,.room-card,.room-layout{grid-template-columns:1fr}.side-nav-wrap{display:none}.mobile-tabs{display:flex}.search-card{margin:32px auto}.hero-copy{min-height:auto}.hero-img{min-height:300px}.room-card img{height:260px}}@media(max-width:640px){.top{position:relative}.mobile-tabs{top:0}.nav{align-items:flex-start;flex-direction:column}.langs{width:100%;display:grid;grid-template-columns:repeat(3,1fr)}.langs button{font-size:12px;padding:9px 8px}.wrap{padding:24px 16px}.search-hero{min-height:auto;border-radius:26px}.search-hero img{position:absolute}.search-card{width:calc(100% - 24px);margin:220px auto 12px;padding:24px;border-radius:24px}.search-card h1{font-size:36px}.date-row{grid-template-columns:1fr}.date-row .field:first-child{border-right:0;border-bottom:1px solid #e7e1d7}.hero h1{font-size:38px}.hero p{font-size:15px}.hero-img{min-height:260px;border-radius:26px}.section-title h2{font-size:28px}.cover{height:250px}.body h2{font-size:25px}.mainimg{height:320px}.gallery-arrow{width:38px;height:38px}.panel{padding:20px}.media{min-height:250px}.calendar-grid{gap:5px}.calendar-day{font-size:12px}}`;

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));
}

function txt(value: Record<Locale, string>, lang: Locale) {
  return value?.[lang] || value?.en || value?.zh || value?.ja || "";
}

function extractEmbedUrl(value = "") {
  const srcMatch = value.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1] || value;
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

function searchFilterScript() {
  return `<script>
function tokyoStayRangesOverlap(range, checkIn, checkOut){
  if(!checkIn && !checkOut) return false;
  if(checkIn && !checkOut) return checkIn >= range.start && checkIn <= range.end;
  if(!checkIn && checkOut) return checkOut >= range.start && checkOut <= range.end;
  var start = checkIn <= checkOut ? checkIn : checkOut;
  var end = checkIn <= checkOut ? checkOut : checkIn;
  return start <= range.end && end > range.start;
}
function tokyoStayRoomAvailable(room, guests, checkIn, checkOut){
  if(Number(room.capacity || 0) < Number(guests || 1)) return false;
  return !(room.unavailableDates || []).some(function(range){ return tokyoStayRangesOverlap(range, checkIn, checkOut); });
}
function filterResidences(form){
  var lang = document.documentElement.lang || 'en';
  var activeForm = form || document.querySelector('[data-lang="' + lang + '"] .search-form') || document.querySelector('.search-form');
  if(!activeForm) return;
  var area = activeForm.querySelector('[name="area"]')?.value || 'all';
  var guests = activeForm.querySelector('[name="guests"]')?.value || '1';
  var checkIn = activeForm.querySelector('[name="checkIn"]')?.value || '';
  var checkOut = activeForm.querySelector('[name="checkOut"]')?.value || '';
  var visibleCount = 0;
  document.querySelectorAll('[data-residence-card]').forEach(function(card){
    var areaMatch = area === 'all' || (card.dataset.keywords || '').toLowerCase().indexOf(area.toLowerCase()) >= 0;
    var rooms = [];
    try { rooms = JSON.parse(card.dataset.rooms || '[]'); } catch(e) {}
    var roomMatch = rooms.some(function(room){ return tokyoStayRoomAvailable(room, guests, checkIn, checkOut); });
    var show = areaMatch && roomMatch;
    card.style.display = show ? '' : 'none';
    if(show) visibleCount += 1;
  });
  document.querySelectorAll('[data-result-count]').forEach(function(node){ node.textContent = visibleCount + ' residences'; });
  var empty = document.querySelector('[data-empty-results]');
  if(empty) empty.style.display = visibleCount ? 'none' : '';
}
document.addEventListener('input', function(event){
  var form = event.target.closest && event.target.closest('.search-form');
  if(form) filterResidences(form);
});
document.addEventListener('change', function(event){
  var form = event.target.closest && event.target.closest('.search-form');
  if(form) filterResidences(form);
});
document.addEventListener('submit', function(event){
  var form = event.target.closest && event.target.closest('.search-form');
  if(form){ event.preventDefault(); filterResidences(form); document.getElementById('featured')?.scrollIntoView({behavior:'smooth'}); }
});
filterResidences();
</script>`;
}

function roomDetailScript() {
  return `<script>
function setupRoomGallery(){
  document.querySelectorAll('[data-room-gallery]').forEach(function(root){
    var images = [];
    try { images = JSON.parse(root.dataset.images || '[]'); } catch(e) {}
    if(!images.length) return;
    var img = root.querySelector('[data-gallery-main]');
    var count = root.querySelector('[data-gallery-count]');
    var thumbs = Array.from(root.querySelectorAll('[data-gallery-thumb]'));
    var active = 0;
    var timer = 0;
    var startX = 0;
    function render(index){
      active = (index + images.length) % images.length;
      if(img){ img.src = images[active].url; img.alt = images[active].alt || ''; }
      if(count){ count.textContent = (active + 1) + ' / ' + images.length; }
      thumbs.forEach(function(button){ button.classList.toggle('active', Number(button.dataset.galleryThumb) === active); });
    }
    function move(delta){ render(active + delta); restart(); }
    function restart(){
      if(timer) window.clearInterval(timer);
      if(images.length > 1) timer = window.setInterval(function(){ render(active + 1); }, 3600);
    }
    root.querySelector('[data-gallery-prev]')?.addEventListener('click', function(){ move(-1); });
    root.querySelector('[data-gallery-next]')?.addEventListener('click', function(){ move(1); });
    thumbs.forEach(function(button){ button.addEventListener('click', function(){ render(Number(button.dataset.galleryThumb || 0)); restart(); }); });
    root.addEventListener('touchstart', function(event){ startX = event.touches[0]?.clientX || 0; }, { passive: true });
    root.addEventListener('touchend', function(event){
      var endX = event.changedTouches[0]?.clientX || 0;
      if(Math.abs(startX - endX) > 42) move(startX > endX ? 1 : -1);
    }, { passive: true });
    render(0);
    restart();
  });
}
function formatIso(date){
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
}
function rangeContains(range, iso){ return iso >= range.start && iso <= range.end; }
function setupCalendars(){
  document.querySelectorAll('[data-calendar-ui]').forEach(function(root){
    var ranges = [];
    try { ranges = JSON.parse(root.dataset.ranges || '[]'); } catch(e) {}
    var initial = ranges[0]?.start ? new Date(ranges[0].start + 'T00:00:00') : new Date();
    var month = new Date(initial.getFullYear(), initial.getMonth(), 1);
    var title = root.querySelector('[data-calendar-title]');
    var grid = root.querySelector('[data-calendar-grid]');
    function render(){
      if(title) title.textContent = month.toLocaleDateString('en', { month: 'long', year: 'numeric' });
      if(!grid) return;
      grid.innerHTML = '';
      ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach(function(day){
        var node = document.createElement('div');
        node.className = 'calendar-dow';
        node.textContent = day;
        grid.appendChild(node);
      });
      var first = new Date(month.getFullYear(), month.getMonth(), 1);
      var last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      for(var i = 0; i < first.getDay(); i += 1){
        var empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
      }
      for(var day = 1; day <= last.getDate(); day += 1){
        var date = new Date(month.getFullYear(), month.getMonth(), day);
        var iso = formatIso(date);
        var blocked = ranges.some(function(range){ return rangeContains(range, iso); });
        var cell = document.createElement('div');
        cell.className = 'calendar-day' + (blocked ? ' blocked' : '');
        cell.textContent = String(day);
        grid.appendChild(cell);
      }
    }
    root.querySelector('[data-calendar-prev]')?.addEventListener('click', function(){ month = new Date(month.getFullYear(), month.getMonth() - 1, 1); render(); });
    root.querySelector('[data-calendar-next]')?.addEventListener('click', function(){ month = new Date(month.getFullYear(), month.getMonth() + 1, 1); render(); });
    render();
  });
}
function setupSectionNav(){
  var buttons = Array.from(document.querySelectorAll('[data-section-btn]'));
  var sections = ['gallery','overview','amenities','video','map'].map(function(id){ return document.getElementById(id); }).filter(Boolean);
  buttons.forEach(function(button){
    button.addEventListener('click', function(){
      document.getElementById(button.dataset.sectionBtn)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  if(!sections.length) return;
  var observer = new IntersectionObserver(function(entries){
    var visible = entries.filter(function(entry){ return entry.isIntersecting; }).sort(function(a,b){ return b.intersectionRatio - a.intersectionRatio || a.boundingClientRect.top - b.boundingClientRect.top; })[0];
    if(!visible) return;
    buttons.forEach(function(button){ button.classList.toggle('active', button.dataset.sectionBtn === visible.target.id); });
  }, { rootMargin: '-145px 0px -52% 0px', threshold: [0.1,0.24,0.4,0.6] });
  sections.forEach(function(section){ observer.observe(section); });
}
function setupInquiry(){
  var modal = document.querySelector('[data-inquiry-modal]');
  if(!modal) return;
  var form = modal.querySelector('[data-inquiry-form]');
  var success = modal.querySelector('[data-inquiry-success]');
  var error = modal.querySelector('[data-inquiry-error]');
  var send = modal.querySelector('[data-inquiry-send]');
  function open(){ modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); if(error) error.style.display='none'; if(success) success.style.display='none'; if(form) form.style.display='grid'; }
  function close(){ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); }
  document.querySelectorAll('[data-inquiry-open]').forEach(function(button){ button.addEventListener('click', open); });
  modal.querySelectorAll('[data-inquiry-close]').forEach(function(button){ button.addEventListener('click', close); });
  modal.addEventListener('click', function(event){ if(event.target === modal) close(); });
  document.addEventListener('keydown', function(event){ if(event.key === 'Escape') close(); });
  form?.addEventListener('submit', async function(event){
    event.preventDefault();
    if(error) error.style.display='none';
    if(send){ send.disabled = true; send.textContent = send.dataset.sending || send.textContent; }
    var currentLang = document.documentElement.lang || 'en';
    var data = new FormData(form);
    try {
      var response = await fetch('https://tokyostay-cms-gshaiql6.edgeone.cool/api/property-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: data.get('customerEmail') || '',
          channel: data.get('channel') || '',
          message: data.get('message') || '',
          propertyName: modal.dataset.propertyName || '',
          propertyId: modal.dataset.propertyId || '',
          propertyUrl: location.href
        })
      });
      if(!response.ok) throw new Error('Failed');
      if(form) form.style.display='none';
      if(success) success.style.display='block';
    } catch(e) {
      if(error) error.style.display='block';
    } finally {
      if(send){ send.disabled = false; send.textContent = send.dataset.label || send.textContent; }
      setLang(currentLang);
    }
  });
}
setupRoomGallery();
setupCalendars();
setupSectionNav();
setupInquiry();
</script>`;
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

function searchHeroHtml() {
  const areaSelects = langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">TokyoStay</span><h1>${esc(labels[lang].listTitle)}</h1><p>${esc(labels[lang].listLead)}</p><form class="search-form" action="#featured"><label class="field"><span>${esc(labels[lang].area)}</span><select name="area">${areaOptions.map((area) => `<option value="${esc(area.value)}">${esc(area.labels[lang])}</option>`).join("")}</select></label><div class="date-row"><label class="field"><span>${esc(labels[lang].checkIn)}</span><input type="date" name="checkIn"></label><label class="field"><span>${esc(labels[lang].checkOut)}</span><input type="date" name="checkOut"></label></div><label class="field"><span>${esc(labels[lang].guests)}</span><select name="guests">${[1, 2, 3, 4, 5, 6].map((guest) => `<option value="${guest}">${guest}</option>`).join("")}</select></label><button class="search-btn" type="submit">⌕ ${esc(labels[lang].search)}</button></form></div>`).join("");
  return `<section class="search-hero"><img src="${heroImageUrl}" alt="Tokyo"><div class="search-card">${areaSelects}</div></section>`;
}

function listHtml(buildings: Building[]) {
  const cards = buildings.filter((building) => building.featured).sort((a, b) => a.order - b.order).map((building) => {
    const rooms = building.roomTypes.map((room) => room.roomType).join(" / ");
    const roomSearchData = building.roomTypes
      .filter((room) => room.status === "published")
      .map((room) => ({
        capacity: Math.max(...(room.capacity.match(/\d+/g) || ["0"]).map(Number)),
        unavailableDates: room.unavailableDates
      }));
    const keywords = [
      building.area,
      building.station,
      txt(building.name, "en"),
      txt(building.name, "zh"),
      txt(building.name, "ja"),
      ...building.tags
    ].join(" ").toLowerCase();
    return `<article class="card" data-residence-card data-keywords="${esc(keywords)}" data-rooms="${esc(JSON.stringify(roomSearchData))}"><a data-href-base="../building/${esc(building.id)}/index.html" href="../building/${esc(building.id)}/index.html"><div class="cover"><img src="${esc(cover(building))}" alt="${esc(txt(building.name, "en"))}"></div><div class="body">${langs.map((lang) => `<div data-lang="${lang}"><p class="eyebrow">${esc(building.area)}</p><h2>${esc(txt(building.name, lang))}</h2><div class="meta"><span>${esc(station(building, lang))}</span><span>${building.roomTypes.length} ${esc(labels[lang].roomTypes)} · ${esc(rooms)}</span></div><div class="tags">${building.tags.slice(0, 5).map((tag) => `<span class="tag">${esc(tagLabel(tag, lang))}</span>`).join("")}</div><span class="btn">${esc(labels[lang].viewTypes)}</span></div>`).join("")}</div></a></article>`;
  }).join("");

  return shell("TokyoStay Residences", `${nav("../")}<main class="wrap">${searchHeroHtml()}<div id="featured" class="section-title">${langs.map((lang) => `<h2 data-lang="${lang}">${esc(labels[lang].featured)}</h2>`).join("")}<span class="tag" data-result-count>${buildings.length} residences</span></div><section class="grid">${cards}</section><div class="panel" data-empty-results style="display:none;margin-top:22px;text-align:center">No available residences match these filters.</div></main>${searchFilterScript()}${languageScript()}`);
}

function buildingHtml(building: Building) {
  const rooms = building.roomTypes.filter((room) => room.status === "published").map((room) => {
    const href = `../../building/${esc(building.id)}/room/${esc(room.id)}/index.html`;
    return `<a class="room-card" data-href-base="${href}" href="${href}?lang=en"><img src="${esc(roomCover(room) || cover(building))}" alt="${esc(txt(room.name, "en"))}"><div>${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(txt(room.name, lang))}</h2><p class="muted">${esc(room.roomType)} · ${esc(room.capacity)} · ${esc(room.size)}</p><div class="tags">${room.amenities.slice(0, 5).map((item) => `<span class="tag">${esc(tagLabel(item, lang))}</span>`).join("")}</div><span class="btn">${esc(labels[lang].viewDetails)}</span></div>`).join("")}</div></a>`;
  }).join("");
  const buildingImages = building.gallery.length ? building.gallery : [{ id: "building-cover", url: cover(building), alt: txt(building.name, "en") }];
  return shell(
    txt(building.name, "en"),
    `${nav("../../")}<main class="wrap">${langs.map((lang) => `<a class="back" data-lang="${lang}" href="../../properties/index.html?lang=${lang}">← ${esc(labels[lang].backResidences)}</a>`).join("")}<section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">Residence</span><h1>${esc(txt(building.name, lang))}</h1><p>${esc(building.area)} · ${esc(station(building, lang))}</p></div>`).join("")}</div><div class="hero-img"><img src="${esc(cover(building))}" alt="${esc(txt(building.name, "en"))}"></div></section>${galleryHtml(buildingImages, txt(building.name, "en"))}<section class="panel" style="margin-top:24px">${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(txt(building.name, lang))}</h2><p class="muted">${esc(txt(building.description, lang))}</p></div>`).join("")}</section><section class="section-title"><h2>Room Types</h2></section><section class="room-list">${rooms}</section></main>${roomDetailScript()}${languageScript()}`
  );
}

function sectionNavHtml(kind: "desktop" | "mobile") {
  const ids = ["gallery", "overview", "amenities", "video", "map"] as const;
  const icon = { gallery: "⌂", overview: "✧", amenities: "▭", video: "▦", map: "◇" };
  const buttons = ids.map((id) => `<button type="button" data-section-btn="${id}" class="${id === "gallery" ? "active" : ""}">${kind === "desktop" ? `<span>${icon[id]}</span>` : ""}${langs.map((lang) => `<span data-lang="${lang}">${esc(labels[lang][id])}</span>`).join("")}</button>`).join("");
  return kind === "desktop"
    ? `<aside class="side-nav-wrap"><nav class="side-nav" aria-label="Property sections">${buttons}</nav></aside>`
    : `<nav class="mobile-tabs" aria-label="Property sections">${buttons}</nav>`;
}

function calendarHtml(room: RoomType) {
  return `${langs.map((lang) => `<h2 data-lang="${lang}">${esc(labels[lang].unavailable)}</h2>`).join("")}<div class="calendar-ui" data-calendar-ui data-ranges="${esc(JSON.stringify(room.unavailableDates))}"><div class="calendar-head"><button type="button" data-calendar-prev aria-label="Previous month">‹</button><div class="calendar-title" data-calendar-title></div><button type="button" data-calendar-next aria-label="Next month">›</button></div><div class="calendar-grid" data-calendar-grid></div><p class="calendar-note">Red dates are unavailable for check-in or stay.</p></div>`;
}

function galleryHtml(images: { url: string; alt: string; id?: string }[], title: string) {
  const safeImages = images.filter((image) => image.url).map((image) => ({ url: image.url, alt: image.alt || title }));
  const main = safeImages[0] ?? { url: "", alt: title };
  const thumbs = safeImages.map((image, index) => `<button type="button" data-gallery-thumb="${index}" class="${index === 0 ? "active" : ""}" aria-label="Show image ${index + 1}"><img src="${esc(image.url)}" alt="${esc(image.alt)}"></button>`).join("");
  return `<section id="gallery" class="gallery" data-room-gallery data-images="${esc(JSON.stringify(safeImages))}"><div class="gallery-stage"><img class="mainimg" data-gallery-main src="${esc(main.url)}" alt="${esc(main.alt)}"><span class="gallery-count" data-gallery-count>1 / ${safeImages.length}</span>${safeImages.length > 1 ? `<button class="gallery-arrow prev" type="button" data-gallery-prev aria-label="Previous image">‹</button><button class="gallery-arrow next" type="button" data-gallery-next aria-label="Next image">›</button>` : ""}</div>${safeImages.length > 1 ? `<div class="thumbs">${thumbs}</div>` : ""}</section>`;
}

function inquiryHtml(building: Building, room: RoomType) {
  const propertyName = `${txt(building.name, "zh") || txt(building.name, "en")} / ${txt(room.name, "zh") || txt(room.name, "en")}`;
  const modalStyle = "display:none;position:fixed;inset:0;z-index:60;align-items:center;justify-content:center;background:rgba(23,20,18,.45);padding:24px;backdrop-filter:blur(8px)";
  const cardStyle = "position:relative;width:min(95vw,540px);border-radius:24px;background:white;padding:30px;box-shadow:0 30px 90px rgba(23,20,18,.22)";
  const fieldStyle = "width:100%;border:1px solid #e7e1d7;border-radius:18px;background:#f6f4ef;padding:13px 15px;font:inherit;outline:0;margin-top:8px";
  const labelStyle = "display:block;color:#4f5965;font-size:14px;font-weight:900";
  return `<button type="button" class="btn" style="width:max-content;margin-top:22px;border:0;cursor:pointer" data-inquiry-open><span data-lang="en">Inquire</span><span data-lang="zh">&#21672;&#35810;&#25151;&#28304;</span><span data-lang="ja">&#21839;&#12356;&#21512;&#12431;&#12379;</span></button><div data-inquiry-modal aria-hidden="true" data-property-id="${esc(`${building.id}/${room.id}`)}" data-property-name="${esc(propertyName)}" style="${modalStyle}"><div style="${cardStyle}"><button type="button" data-inquiry-close style="position:absolute;right:18px;top:18px;width:34px;height:34px;border:0;border-radius:999px;background:#f6f4ef;font-size:22px;cursor:pointer">x</button><div data-inquiry-success style="display:none;text-align:center"><h2><span data-lang="en">We received your inquiry</span><span data-lang="zh">&#24050;&#25910;&#21040;&#24744;&#30340;&#21672;&#35810;</span><span data-lang="ja">&#12362;&#21839;&#12356;&#21512;&#12431;&#12379;&#12434;&#21463;&#12369;&#20184;&#12369;&#12414;&#12375;&#12383;</span></h2><p class="muted"><span data-lang="en">Thank you for your inquiry. We usually reply within 24 hours. Please check your email.</span><span data-lang="zh">&#24863;&#35874;&#24744;&#30340;&#21672;&#35810;&#12290;&#25105;&#20204;&#36890;&#24120;&#20250;&#22312;24&#23567;&#26102;&#20869;&#22238;&#22797;&#24744;&#30340;&#37038;&#20214;&#65292;&#35831;&#27880;&#24847;&#26597;&#25910;&#37038;&#31665;&#12290;</span><span data-lang="ja">&#12362;&#21839;&#12356;&#21512;&#12431;&#12379;&#12354;&#12426;&#12364;&#12392;&#12358;&#12372;&#12374;&#12356;&#12414;&#12377;&#12290;&#36890;&#24120;24&#26178;&#38291;&#20197;&#20869;&#12395;&#36820;&#20449;&#12375;&#12414;&#12377;&#12290;</span></p><button type="button" class="btn" data-inquiry-close><span data-lang="en">Close</span><span data-lang="zh">&#20851;&#38381;</span><span data-lang="ja">&#38281;&#12376;&#12427;</span></button></div><form data-inquiry-form style="display:grid;gap:15px"><h2 style="margin:0 34px 4px 0"><span data-lang="en">Inquire about this stay</span><span data-lang="zh">&#21672;&#35810;&#25151;&#28304;</span><span data-lang="ja">&#29289;&#20214;&#12395;&#12388;&#12356;&#12390;&#21839;&#12356;&#21512;&#12431;&#12379;&#12427;</span></h2><p class="muted"><span data-lang="en">Want to know the price, available dates, or booking process? Leave your email and we will reply soon.</span><span data-lang="zh">&#24819;&#20102;&#35299;&#20215;&#26684;&#12289;&#21487;&#20837;&#20303;&#26085;&#26399;&#25110;&#39044;&#35746;&#26041;&#24335;&#65311;&#35831;&#30041;&#19979;&#24744;&#30340;&#37038;&#31665;&#65292;&#25105;&#20204;&#20250;&#23613;&#24555;&#22238;&#22797;&#12290;</span><span data-lang="ja">&#26009;&#37329;&#12289;&#31354;&#23460;&#26085;&#12289;&#20104;&#32004;&#26041;&#27861;&#12395;&#12388;&#12356;&#12390;&#30693;&#12426;&#12383;&#12356;&#22580;&#21512;&#12399;&#12289;&#12513;&#12540;&#12523;&#12450;&#12489;&#12524;&#12473;&#12434;&#27531;&#12375;&#12390;&#12367;&#12384;&#12373;&#12356;&#12290;</span></p><label style="${labelStyle}"><span data-lang="en">Email address</span><span data-lang="zh">&#37038;&#31665;&#22320;&#22336;</span><span data-lang="ja">&#12513;&#12540;&#12523;&#12450;&#12489;&#12524;&#12473;</span><input style="${fieldStyle}" name="customerEmail" type="email" required placeholder="Enter your email"></label><label style="${labelStyle}"><span data-lang="en">Who recommended us to you? (optional)</span><span data-lang="zh">&#26159;&#35841;&#21521;&#24744;&#25512;&#33616;&#20102;&#25105;&#20204;&#65311;&#65288;&#36873;&#22635;&#65289;</span><span data-lang="ja">&#12393;&#12394;&#12383;&#12363;&#12425;&#12398;&#32057;&#20171;&#12391;&#12377;&#12363;&#65311;&#65288;&#20219;&#24847;&#65289;</span><input style="${fieldStyle}" name="channel" placeholder="Referrer / agency / partner / platform"></label><label style="${labelStyle}"><span data-lang="en">Inquiry details</span><span data-lang="zh">&#21672;&#35810;&#20869;&#23481;</span><span data-lang="ja">&#21839;&#12356;&#21512;&#12431;&#12379;&#20869;&#23481;</span><textarea style="${fieldStyle};min-height:126px;resize:vertical" name="message" required placeholder="Enter your question..."></textarea></label><p data-inquiry-error style="display:none;color:#b91c1c;font-weight:900"><span data-lang="en">Failed to send. Please try again later.</span><span data-lang="zh">&#21457;&#36865;&#22833;&#36133;&#65292;&#35831;&#31245;&#21518;&#37325;&#35797;&#12290;</span><span data-lang="ja">&#36865;&#20449;&#12395;&#22833;&#25943;&#12375;&#12414;&#12375;&#12383;&#12290;&#12375;&#12400;&#12425;&#12367;&#12375;&#12390;&#12363;&#12425;&#12418;&#12358;&#19968;&#24230;&#12362;&#35430;&#12375;&#12367;&#12384;&#12373;&#12356;&#12290;</span></p><div style="display:flex;gap:12px"><button type="button" data-inquiry-close style="flex:1;border:1px solid #e7e1d7;border-radius:999px;background:white;padding:13px 16px;color:#4f5965;font-weight:900;cursor:pointer"><span data-lang="en">Cancel</span><span data-lang="zh">&#21462;&#28040;</span><span data-lang="ja">&#12461;&#12515;&#12531;&#12475;&#12523;</span></button><button type="submit" class="btn" data-inquiry-send data-label="Send inquiry" data-sending="Sending..." style="flex:1;border:0;cursor:pointer"><span data-lang="en">Send inquiry</span><span data-lang="zh">&#21457;&#36865;&#21672;&#35810;</span><span data-lang="ja">&#36865;&#20449;</span></button></div></form></div></div>`;
}

function roomHtml(building: Building, room: RoomType) {
  const imgs = room.images.length ? room.images : building.gallery;
  const main = roomCover(room) || cover(building);
  const galleryImages = imgs.length ? imgs : [{ id: "main", url: main, alt: txt(room.name, "en") }];
  const details = `${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].overview)}</h2><div class="facts"><span class="fact">${esc(building.area)}</span><span class="fact">${esc(room.roomType)}</span><span class="fact">${esc(room.capacity)}</span><span class="fact">${esc(room.size)}</span><span class="fact">${esc(station(building, lang))}</span></div><p class="muted">${esc(txt(room.description, lang))}</p></div>`).join("")}`;
  const amenities = `${langs.map((lang) => `<div data-lang="${lang}"><h2>${esc(labels[lang].amenities)}</h2><div class="tags">${room.amenities.map((item) => `<span class="tag">${esc(tagLabel(item, lang))}</span>`).join("")}</div></div>`).join("")}`;
  const video = `<h2>${esc(labels.en.video)}</h2>${room.videos[0] ? (room.videos[0].url.includes("youtube") ? `<iframe class="media" src="${esc(room.videos[0].url)}" allowfullscreen></iframe>` : `<video class="video" src="${esc(room.videos[0].url)}" controls></video>`) : `<p class="muted">-</p>`}`;
  const mapUrl = extractEmbedUrl(room.map.embedUrl);
  const map = `<h2>${esc(labels.en.map)}</h2>${mapUrl ? (room.map.type === "image" ? `<img class="media" src="${esc(mapUrl)}" alt="${esc(room.map.address)}">` : `<iframe class="media" src="${esc(mapUrl)}" loading="lazy"></iframe>`) : `<p class="muted">-</p>`}`;
  return shell(txt(room.name, "en"), `${nav("../../../../")}<main class="wrap">${langs.map((lang) => `<a class="back" data-lang="${lang}" href="../../../${esc(building.id)}/index.html?lang=${lang}">← ${esc(labels[lang].backTypes)}</a>`).join("")}<section class="hero"><div class="hero-copy">${langs.map((lang) => `<div data-lang="${lang}"><span class="eyebrow">${esc(txt(building.name, lang))}</span><h1>${esc(txt(room.name, lang))}</h1><p>${esc(room.roomType)} · ${esc(room.capacity)} · ${esc(room.size)} · ${esc(station(building, lang))}</p></div>`).join("")}${inquiryHtml(building, room)}</div><div class="hero-img"><img src="${esc(main)}" alt="${esc(txt(room.name, "en"))}"></div></section>${sectionNavHtml("mobile")}<section class="room-layout">${sectionNavHtml("desktop")}<div class="room-content">${galleryHtml(galleryImages, txt(room.name, "en"))}<section id="overview" class="detail"><article class="panel">${details}</article><aside class="panel">${calendarHtml(room)}</aside></section><section id="amenities" class="panel" style="margin-top:24px">${amenities}</section><section id="video" class="panel" style="margin-top:24px">${video}</section><section id="map" class="panel" style="margin-top:24px">${map}</section></div></section></main>${roomDetailScript()}${languageScript()}`);
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
