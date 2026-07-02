"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  GripVertical,
  ImagePlus,
  Languages,
  Plus,
  Save,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createBlankProperty, text } from "@/lib/properties";
import type { Locale, MediaImage, MediaVideo, Property } from "@/types/property";

type UploadProgress = Record<string, number>;

const storageKey = "tokyostay-properties-v2";
const localeTabs: { key: Locale; label: string }[] = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" }
];

const areaOptions = ["Shinjuku / Jingumae", "Minato / Azabu", "Taito / Asakusa", "Bunkyo", "Shibuya", "Tokyo"];
const capacityOptions = ["1", "1-2", "2-3", "3-4", "4+"];
const recommendedTags = [
  "Wi-Fi",
  "Kitchen",
  "Washer",
  "Air Conditioner",
  "Workspace",
  "Bathtub",
  "Balcony",
  "Elevator",
  "Near Station",
  "Long Stay",
  "Family Friendly",
  "Business Stay",
  "Self Check-in"
];

function uid(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function coverOf(property: Property) {
  return property.images.find((image) => image.type === "cover") ?? property.images[0];
}

export function AdminClient({ initialProperties }: { initialProperties: Property[] }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [currentId, setCurrentId] = useState(initialProperties[0]?.id ?? "");
  const [locale, setLocale] = useState<Locale>("zh");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [publishResult, setPublishResult] = useState<{ url: string; listUrl: string } | null>(null);
  const [notice, setNotice] = useState("");
  const current = properties.find((property) => property.id === currentId) ?? properties[0];

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Property[];
    setProperties(parsed);
    setCurrentId(parsed[0]?.id ?? "");
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(properties));
  }, [properties]);

  const stats = {
    published: properties.filter((item) => item.status === "published").length,
    draft: properties.filter((item) => item.status === "draft").length,
    images: properties.reduce((sum, item) => sum + item.images.length, 0),
    videos: properties.reduce((sum, item) => sum + item.videos.length, 0)
  };
  const previewHref = current ? `/property/${current.id}?lang=${locale}` : "/";
  const previewImage = useMemo(() => current ? coverOf(current) : undefined, [current]);

  function saveNow() {
    localStorage.setItem(storageKey, JSON.stringify(properties));
    setNotice("已保存到当前浏览器。正式数据库接入后，这里会同步保存到服务器。");
  }

  function patchCurrent(patch: Partial<Property>) {
    if (!current) return;
    setProperties((items) =>
      items.map((item) => (item.id === current.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item))
    );
  }

  function patchLocalized(field: "title" | "description", value: string) {
    if (!current) return;
    patchCurrent({ [field]: { ...current[field], [locale]: value } });
  }

  function addProperty() {
    const property = createBlankProperty();
    setProperties((items) => [...items, { ...property, order: items.length + 1 }]);
    setCurrentId(property.id);
  }

  function duplicateProperty() {
    if (!current) return;
    const now = new Date().toISOString();
    const clone: Property = {
      ...current,
      id: `${current.id}-copy-${Date.now()}`,
      status: "draft",
      order: properties.length + 1,
      title: {
        zh: `${current.title.zh || current.title.en} 复制`,
        en: `${current.title.en || current.title.zh} Copy`,
        ja: `${current.title.ja || current.title.en} コピー`
      },
      createdAt: now,
      updatedAt: now
    };
    setProperties((items) => [...items, clone]);
    setCurrentId(clone.id);
    setNotice("已复制房源，默认保存为草稿。");
  }

  function deleteProperty() {
    if (!current || properties.length <= 1) return;
    const next = properties.filter((item) => item.id !== current.id).map((item, index) => ({ ...item, order: index + 1 }));
    setProperties(next);
    setCurrentId(next[0]?.id ?? "");
  }

  function reorderProperty(from: number, to: number) {
    setProperties((items) => moveItem(items, from, to).map((item, index) => ({ ...item, order: index + 1 })));
  }

  async function uploadFiles(files: FileList | File[], kind: "image" | "video") {
    if (!current) return;
    const uploadedImages: MediaImage[] = [];
    const uploadedVideos: MediaVideo[] = [];

    for (const file of Array.from(files)) {
      const progressKey = uid(file.name);
      setUploadProgress((items) => ({ ...items, [progressKey]: 20 }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("propertyId", current.id);
      formData.append("kind", kind);
      setUploadProgress((items) => ({ ...items, [progressKey]: 65 }));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = (await res.json()) as { url: string; fileName: string };
      setUploadProgress((items) => ({ ...items, [progressKey]: 100 }));

      if (kind === "image") {
        uploadedImages.push({
          id: uid("img"),
          url: payload.url,
          type: current.images.length || uploadedImages.length ? "gallery" : "cover",
          alt: payload.fileName
        });
      } else {
        uploadedVideos.push({ id: uid("video"), url: payload.url, title: payload.fileName });
      }

      window.setTimeout(() => setUploadProgress((items) => {
        const next = { ...items };
        delete next[progressKey];
        return next;
      }), 700);
    }

    if (uploadedImages.length) patchCurrent({ images: [...current.images, ...uploadedImages] });
    if (uploadedVideos.length) patchCurrent({ videos: [...current.videos, ...uploadedVideos] });
  }

  function setCover(imageId: string) {
    if (!current) return;
    patchCurrent({ images: current.images.map((image) => ({ ...image, type: image.id === imageId ? "cover" : "gallery" })) });
  }

  function removeImage(imageId: string) {
    if (!current) return;
    const next = current.images.filter((image) => image.id !== imageId);
    patchCurrent({ images: next.map((image, index) => ({ ...image, type: index === 0 ? "cover" : "gallery" })) });
  }

  function toggleTag(tag: string) {
    if (!current) return;
    patchCurrent({
      amenities: current.amenities.includes(tag)
        ? current.amenities.filter((item) => item !== tag)
        : [...current.amenities, tag]
    });
  }

  async function generateAi() {
    if (!current) return;
    const res = await fetch("/api/ai", { method: "POST", body: JSON.stringify(current) });
    const ai = await res.json();
    patchCurrent({
      description: ai.description,
      sellingPoints: ai.sellingPoints,
      amenities: Array.from(new Set([...current.amenities, ...ai.amenities]))
    });
    setNotice("AI 已生成三种语言介绍、卖点和设施建议。没有 OpenAI Key 时会返回模拟结果。");
  }

  async function publish() {
    if (!current) return;
    const publishedCurrent = { ...current, status: "published" as const, updatedAt: new Date().toISOString() };
    const nextProperties = properties.map((item) => item.id === current.id ? publishedCurrent : item);
    setProperties(nextProperties);
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property: publishedCurrent, properties: nextProperties })
    });
    const payload = await res.json();
    setPublishResult({ url: payload.url, listUrl: payload.listUrl });
    setNotice("发布成功：静态展示页已更新到 COS，落地页可继续跳转到这个展示链接。");
  }

  if (!current) return null;
  const progressEntries = Object.entries(uploadProgress);

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">TokyoStay CMS</p>
            <h1 className="text-lg font-semibold">房源发布工作台</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={saveNow} className="action-btn border-line bg-white text-ink"><Save size={16} /> 保存</button>
            <Link href={previewHref} target="_blank" className="action-btn border-line bg-white text-ink"><Eye size={16} /> 预览</Link>
            <button onClick={generateAi} className="action-btn border-moss bg-moss text-white"><Sparkles size={16} /> AI生成介绍</button>
            <button onClick={publish} className="action-btn border-ink bg-ink text-white"><UploadCloud size={16} /> 发布到网站</button>
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[300px_minmax(560px,1fr)_420px]">
        <aside className="border-r border-line bg-white p-4">
          <button onClick={addProperty} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            <Plus size={17} /> 新增房源
          </button>
          <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <Metric label="已发布" value={stats.published} />
            <Metric label="草稿" value={stats.draft} />
            <Metric label="图片" value={stats.images} />
            <Metric label="视频" value={stats.videos} />
          </div>
          <p className="mb-3 text-xs leading-5 text-night/45">拖动房源卡片可以调整前台展示顺序。</p>
          <div className="space-y-2">
            {properties.map((property, index) => (
              <button
                key={property.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => reorderProperty(Number(event.dataTransfer.getData("text/plain")), index)}
                onClick={() => setCurrentId(property.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  property.id === current.id ? "border-ink bg-ink text-white" : "border-line bg-mist/60 hover:bg-mist"
                }`}
              >
                <GripVertical size={16} className="shrink-0 opacity-55" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{property.title.zh || property.title.en}</p>
                  <p className="truncate text-xs opacity-60">{property.area} · {property.status}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="overflow-auto p-5">
          <div className="mx-auto max-w-4xl space-y-5">
            {notice && <Notice tone="success">{notice}</Notice>}

            <EditorPanel title="基础信息" icon={<FileText size={18} />}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="房源 ID"><input value={current.id} onChange={(event) => { const id = event.target.value; patchCurrent({ id }); setCurrentId(id); }} className="input" /></Field>
                <Field label="上下架状态">
                  <select value={current.status} onChange={(event) => patchCurrent({ status: event.target.value as Property["status"] })} className="input">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="hidden">已隐藏</option>
                  </select>
                </Field>
                <Field label="区域">
                  <input list="area-options" value={current.area} onChange={(event) => patchCurrent({ area: event.target.value })} className="input" />
                  <datalist id="area-options">{areaOptions.map((item) => <option key={item} value={item} />)}</datalist>
                </Field>
                <Field label="价格备注"><input value={current.priceNote} onChange={(event) => patchCurrent({ priceNote: event.target.value })} className="input" /></Field>
                <Field label="房型"><input value={current.roomType} onChange={(event) => patchCurrent({ roomType: event.target.value })} className="input" /></Field>
                <Field label="入住人数">
                  <select value={current.capacity} onChange={(event) => patchCurrent({ capacity: event.target.value })} className="input">
                    {capacityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="面积"><input value={current.size} onChange={(event) => patchCurrent({ size: event.target.value })} className="input" /></Field>
                <Field label="交通信息"><input value={current.traffic} onChange={(event) => patchCurrent({ traffic: event.target.value })} className="input" /></Field>
              </div>
            </EditorPanel>

            <EditorPanel title="三语言内容" icon={<Languages size={18} />}>
              <LocaleTabs locale={locale} setLocale={setLocale} />
              <Field label={`房源标题（${localeTabs.find((item) => item.key === locale)?.label}）`}>
                <input value={current.title[locale]} onChange={(event) => patchLocalized("title", event.target.value)} className="input" />
              </Field>
              <Field label={`房源介绍（${localeTabs.find((item) => item.key === locale)?.label}）`}>
                <textarea value={current.description[locale]} onChange={(event) => patchLocalized("description", event.target.value)} className="input min-h-36" />
              </Field>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-night/45">房源卖点</p>
                <div className="space-y-2">
                  {current.sellingPoints.map((point, index) => (
                    <input
                      key={index}
                      value={point[locale]}
                      onChange={(event) => patchCurrent({ sellingPoints: current.sellingPoints.map((item, i) => i === index ? { ...item, [locale]: event.target.value } : item) })}
                      className="input"
                    />
                  ))}
                  <button onClick={() => patchCurrent({ sellingPoints: [...current.sellingPoints, { zh: "", en: "", ja: "" }] })} className="rounded-full border border-line px-4 py-2 text-sm font-semibold">新增卖点</button>
                </div>
              </div>
            </EditorPanel>

            <EditorPanel title="设施标签" icon={<Tag size={18} />}>
              <Field label="设施标签，用英文逗号分隔">
                <input value={current.amenities.join(", ")} onChange={(event) => patchCurrent({ amenities: normalizeList(event.target.value) })} className="input" />
              </Field>
              <div className="flex flex-wrap gap-2">
                {recommendedTags.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-line ${current.amenities.includes(tag) ? "bg-ink text-white" : "bg-mist text-night/65"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </EditorPanel>

            <EditorPanel title="图片与视频" icon={<ImagePlus size={18} />}>
              <Notice>拖拽上传会通过后端接口上传到腾讯 COS。图片建议保存到 images/房源ID/，视频保存到 videos/房源ID/，密钥不会暴露到前端。</Notice>
              <DropZone label="拖拽图片到这里" hint="支持多张图片一次上传，可排序、删除和设置封面" accept="image/*" onFiles={(files) => uploadFiles(files, "image")} />
              <div className="grid gap-3 md:grid-cols-3">
                {current.images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("image-index", String(index))}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => patchCurrent({ images: moveItem(current.images, Number(event.dataTransfer.getData("image-index")), index) })}
                    className="overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    <div className="relative h-36 bg-line"><Image src={image.url} alt={image.alt} fill className="object-cover" /></div>
                    <div className="flex items-center justify-between p-3">
                      <button onClick={() => setCover(image.id)} className="text-xs font-bold text-brand">{image.type === "cover" ? "封面图" : "设为封面"}</button>
                      <button onClick={() => removeImage(image.id)} className="text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <DropZone label="拖拽 MP4 视频到这里" hint="视频上传到 COS 后，前台详情页可直接播放" accept="video/mp4" onFiles={(files) => uploadFiles(files, "video")} />
              {current.videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between rounded-2xl border border-line bg-white p-3 text-sm">
                  <span className="truncate">{video.title}</span>
                  <button onClick={() => patchCurrent({ videos: current.videos.filter((item) => item.id !== video.id) })} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
              {progressEntries.map(([key, value]) => (
                <div key={key} className="h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-brand transition-all" style={{ width: `${value}%` }} />
                </div>
              ))}
            </EditorPanel>

            <EditorPanel title="日历与地图" icon={<CalendarDays size={18} />}>
              <button onClick={() => patchCurrent({ unavailableDates: [...current.unavailableDates, { start: "2026-07-01", end: "2026-07-07" }] })} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                新增不可入住日期段
              </button>
              <div className="mt-4 space-y-3">
                {current.unavailableDates.map((range, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                    <input type="date" value={range.start} onChange={(event) => patchCurrent({ unavailableDates: current.unavailableDates.map((item, i) => i === index ? { ...item, start: event.target.value } : item) })} className="input" />
                    <input type="date" value={range.end} onChange={(event) => patchCurrent({ unavailableDates: current.unavailableDates.map((item, i) => i === index ? { ...item, end: event.target.value } : item) })} className="input" />
                    <button onClick={() => patchCurrent({ unavailableDates: current.unavailableDates.filter((_, i) => i !== index) })} className="rounded-2xl border border-line px-3 text-red-600"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="地图类型">
                  <select value={current.map.type} onChange={(event) => patchCurrent({ map: { ...current.map, type: event.target.value as Property["map"]["type"] } })} className="input">
                    <option value="google">Google Map</option>
                    <option value="amap">高德地图</option>
                    <option value="image">图片地图</option>
                  </select>
                </Field>
                <Field label="地址"><input value={current.map.address} onChange={(event) => patchCurrent({ map: { ...current.map, address: event.target.value } })} className="input" /></Field>
              </div>
              <Field label="嵌入链接或地图图片 URL"><input value={current.map.embedUrl} onChange={(event) => patchCurrent({ map: { ...current.map, embedUrl: event.target.value } })} className="input" /></Field>
            </EditorPanel>

            <EditorPanel title="运营能力预留" icon={<BarChart3 size={18} />}>
              <div className="grid gap-3 md:grid-cols-3">
                <Feature title="收藏功能" body="前台已预留本地收藏，后续可接入账号或分销系统。" />
                <Feature title="咨询表单" body="房源详情页已接入 /api/inquiry，前台不公开联系方式。" />
                <Feature title="浏览统计" body="/api/analytics 已预留，后续可落库统计浏览、收藏和咨询。" />
              </div>
            </EditorPanel>

            <div className="flex flex-wrap gap-2">
              <button onClick={duplicateProperty} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-line">
                <Copy size={16} /> 复制房源
              </button>
              <button onClick={deleteProperty} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                <Trash2 size={16} /> 删除当前房源
              </button>
            </div>
          </div>
        </section>

        <aside className="border-l border-line bg-white p-5">
          <div className="sticky top-21 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-moss">实时预览</p>
            <div className="overflow-hidden rounded-[28px] border border-line bg-mist shadow-soft">
              <div className="relative h-64 bg-line">
                {previewImage ? <Image src={previewImage.url} alt={previewImage.alt} fill className="object-cover" /> : <div className="grid h-full place-items-center text-night/40"><ImagePlus /></div>}
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{current.area}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{text(current.title, locale)}</h2>
                  <p className="mt-2 text-sm leading-6 text-night/60">{current.roomType} · {current.capacity} · {current.size}</p>
                </div>
                <p className="line-clamp-5 text-sm leading-6 text-night/60">{text(current.description, locale) || "这里会显示当前语言下的房源介绍。"}</p>
                <div className="flex flex-wrap gap-2">{current.amenities.slice(0, 6).map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-night/60">{item}</span>)}</div>
              </div>
            </div>

            {publishResult && (
              <div className="rounded-[24px] bg-ink p-5 text-white">
                <p className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} /> 发布成功</p>
                <p className="mt-2 break-all text-sm text-white/70">{publishResult.url}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(publishResult.url)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"><Copy size={15} /> 复制链接</button>
                  <Link href={publishResult.url} target="_blank" className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">打开预览</Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e7e1d7;
          background: white;
          padding: 11px 13px;
          color: #171412;
          outline: none;
        }
        .input:focus {
          border-color: #171412;
          box-shadow: 0 0 0 3px rgba(184, 70, 47, 0.12);
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-width: 1px;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(32, 39, 51, 0.08);
        }
      `}</style>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-mist p-3 ring-1 ring-line">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-night/45">{label}</p>
    </div>
  );
}

function EditorPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">{icon}{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-night/45">{label}</span>
      {children}
    </label>
  );
}

function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" }) {
  const style = tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900";
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${style}`}>{children}</div>;
}

function LocaleTabs({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return (
    <div className="flex rounded-full bg-mist p-1">
      {localeTabs.map((item) => (
        <button key={item.key} onClick={() => setLocale(item.key)} className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${locale === item.key ? "bg-white shadow-card" : "text-night/50"}`}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function DropZone({ label, hint, accept, onFiles }: { label: string; hint: string; accept: string; onFiles: (files: FileList) => void }) {
  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFiles(event.dataTransfer.files);
      }}
      className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-mist/60 p-8 text-center hover:bg-mist"
    >
      <UploadCloud className="mb-3 text-brand" />
      <span className="text-sm font-semibold">{label}</span>
      <span className="mt-1 text-xs text-night/45">{hint}</span>
      <input type="file" accept={accept} multiple className="hidden" onChange={(event) => event.target.files && onFiles(event.target.files)} />
    </label>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-mist p-4 ring-1 ring-line">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-night/58">{body}</p>
    </div>
  );
}
