"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, Eye, GripVertical, ImagePlus, Plus, Save, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createBlankProperty, text } from "@/lib/properties";
import type { Locale, MediaImage, MediaVideo, Property } from "@/types/property";

type UploadProgress = Record<string, number>;

const storageKey = "tokyostay-properties-v1";
const localeTabs: { key: Locale; label: string }[] = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" }
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

export function AdminClient({ initialProperties }: { initialProperties: Property[] }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [currentId, setCurrentId] = useState(initialProperties[0]?.id ?? "");
  const [locale, setLocale] = useState<Locale>("zh");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [publishResult, setPublishResult] = useState("");
  const current = properties.find((property) => property.id === currentId) ?? properties[0];

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Property[];
      setProperties(parsed);
      setCurrentId(parsed[0]?.id ?? "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(properties));
  }, [properties]);

  const previewHref = current ? `/property/${current.id}?lang=${locale}` : "/";

  function patchCurrent(patch: Partial<Property>) {
    if (!current) return;
    setProperties((items) =>
      items.map((item) => (item.id === current.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item))
    );
  }

  function addProperty() {
    const property = createBlankProperty();
    setProperties((items) => [...items, { ...property, order: items.length + 1 }]);
    setCurrentId(property.id);
  }

  function deleteProperty() {
    if (!current || properties.length <= 1) return;
    const next = properties.filter((item) => item.id !== current.id);
    setProperties(next);
    setCurrentId(next[0]?.id ?? "");
  }

  function reorderProperty(from: number, to: number) {
    setProperties((items) => moveItem(items, from, to).map((item, index) => ({ ...item, order: index + 1 })));
  }

  function patchLocalized(field: "title" | "description", value: string) {
    if (!current) return;
    patchCurrent({ [field]: { ...current[field], [locale]: value } });
  }

  async function uploadFiles(files: FileList | File[], kind: "image" | "video") {
    if (!current) return;
    const list = Array.from(files);
    const uploadedImages: MediaImage[] = [];
    const uploadedVideos: MediaVideo[] = [];

    for (const file of list) {
      const key = uid(file.name);
      setUploadProgress((items) => ({ ...items, [key]: 15 }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("propertyId", current.id);
      formData.append("kind", kind);
      setUploadProgress((items) => ({ ...items, [key]: 60 }));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = (await res.json()) as { url: string; fileName: string };
      setUploadProgress((items) => ({ ...items, [key]: 100 }));

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
        delete next[key];
        return next;
      }), 800);
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

  function addDateRange() {
    if (!current) return;
    patchCurrent({ unavailableDates: [...current.unavailableDates, { start: "2026-07-01", end: "2026-07-07" }] });
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
  }

  async function publish() {
    if (!current) return;
    const nextProperties = properties.map((item) => item.id === current.id ? { ...item, status: "published" as const, updatedAt: new Date().toISOString() } : item);
    setProperties(nextProperties);
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property: { ...current, status: "published" },
        properties: nextProperties
      })
    });
    const payload = await res.json();
    setPublishResult(payload.url);
  }

  const progressEntries = Object.entries(uploadProgress);
  const previewImage = useMemo(() => current?.images.find((image) => image.type === "cover") ?? current?.images[0], [current]);

  if (!current) return null;

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/88 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">TokyoStay 后台</p>
            <h1 className="text-lg font-semibold">房源发布工作台</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => localStorage.setItem(storageKey, JSON.stringify(properties))} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold shadow-card">
              <Save size={16} /> 保存
            </button>
            <Link href={previewHref} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold shadow-card">
              <Eye size={16} /> 预览
            </Link>
            <button onClick={generateAi} className="inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white shadow-card">
              <Sparkles size={16} /> AI 生成介绍
            </button>
            <button onClick={publish} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white shadow-card">
              <UploadCloud size={16} /> 发布到网站
            </button>
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[300px_minmax(520px,1fr)_420px]">
        <aside className="border-r border-line bg-white p-4">
          <button onClick={addProperty} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            <Plus size={17} /> 新增房源
          </button>
          <p className="mb-3 text-xs leading-5 text-night/45">拖拽左侧房源卡片可调整前台排序。</p>
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
            <EditorPanel title="基础信息">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="房源 ID"><input value={current.id} onChange={(e) => { const id = e.target.value; patchCurrent({ id }); setCurrentId(id); }} className="input" /></Field>
                <Field label="发布状态">
                  <select value={current.status} onChange={(e) => patchCurrent({ status: e.target.value as Property["status"] })} className="input">
                    <option value="draft">草稿</option>
                    <option value="published">已上架</option>
                    <option value="hidden">已隐藏</option>
                  </select>
                </Field>
                <Field label="区域"><input value={current.area} onChange={(e) => patchCurrent({ area: e.target.value })} className="input" /></Field>
                <Field label="价格备注"><input value={current.priceNote} onChange={(e) => patchCurrent({ priceNote: e.target.value })} className="input" /></Field>
                <Field label="房型"><input value={current.roomType} onChange={(e) => patchCurrent({ roomType: e.target.value })} className="input" /></Field>
                <Field label="入住人数"><input value={current.capacity} onChange={(e) => patchCurrent({ capacity: e.target.value })} className="input" /></Field>
                <Field label="面积"><input value={current.size} onChange={(e) => patchCurrent({ size: e.target.value })} className="input" /></Field>
                <Field label="交通信息"><input value={current.traffic} onChange={(e) => patchCurrent({ traffic: e.target.value })} className="input" /></Field>
              </div>
              <LocaleTabs locale={locale} setLocale={setLocale} />
              <Field label={`房源标题（${localeTabs.find((item) => item.key === locale)?.label}）`}><input value={current.title[locale]} onChange={(e) => patchLocalized("title", e.target.value)} className="input" /></Field>
              <Field label={`房源介绍（${localeTabs.find((item) => item.key === locale)?.label}）`}><textarea value={current.description[locale]} onChange={(e) => patchLocalized("description", e.target.value)} className="input min-h-36" /></Field>
              <Field label="设施标签，用英文逗号分隔">
                <input value={current.amenities.join(", ")} onChange={(e) => patchCurrent({ amenities: normalizeList(e.target.value) })} className="input" />
              </Field>
            </EditorPanel>

            <EditorPanel title="图片和视频">
              <Notice>线上后台会通过后端 API 上传到腾讯 COS，图片保存到 images/房源ID/，视频保存到 videos/房源ID/，成功后自动写入房源数据并用于发布。</Notice>
              <DropZone label="拖拽图片到这里" hint="支持多张图片上传、预览、排序和设置封面" accept="image/*" onFiles={(files) => uploadFiles(files, "image")} />
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
              <DropZone label="拖拽 MP4 视频到这里" hint="视频上传到 COS 后会生成可访问链接；播放速度取决于 COS 地域和 CDN 配置" accept="video/mp4" onFiles={(files) => uploadFiles(files, "video")} />
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

            <EditorPanel title="日历和地图">
              <button onClick={addDateRange} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">新增不可入住日期段</button>
              <div className="mt-4 space-y-3">
                {current.unavailableDates.map((range, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                    <input type="date" value={range.start} onChange={(e) => patchCurrent({ unavailableDates: current.unavailableDates.map((item, i) => i === index ? { ...item, start: e.target.value } : item) })} className="input" />
                    <input type="date" value={range.end} onChange={(e) => patchCurrent({ unavailableDates: current.unavailableDates.map((item, i) => i === index ? { ...item, end: e.target.value } : item) })} className="input" />
                    <button onClick={() => patchCurrent({ unavailableDates: current.unavailableDates.filter((_, i) => i !== index) })} className="rounded-2xl border border-line px-3 text-red-600"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="地图类型">
                  <select value={current.map.type} onChange={(e) => patchCurrent({ map: { ...current.map, type: e.target.value as Property["map"]["type"] } })} className="input">
                    <option value="google">Google Map</option>
                    <option value="amap">高德地图</option>
                    <option value="image">图片地图</option>
                  </select>
                </Field>
                <Field label="地址"><input value={current.map.address} onChange={(e) => patchCurrent({ map: { ...current.map, address: e.target.value } })} className="input" /></Field>
              </div>
              <Field label="嵌入链接或地图图片 URL"><input value={current.map.embedUrl} onChange={(e) => patchCurrent({ map: { ...current.map, embedUrl: e.target.value } })} className="input" /></Field>
            </EditorPanel>

            <button onClick={deleteProperty} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              <Trash2 size={16} /> 删除当前房源
            </button>
          </div>
        </section>

        <aside className="border-l border-line bg-white p-5">
          <div className="sticky top-21">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-moss">实时预览</p>
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
                <p className="line-clamp-5 text-sm leading-6 text-night/60">{text(current.description, locale) || "这里会显示手动填写或 AI 生成的房源介绍。"}</p>
                <div className="flex flex-wrap gap-2">{current.amenities.slice(0, 6).map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-night/60">{item}</span>)}</div>
              </div>
            </div>
            {publishResult && (
              <div className="mt-4 rounded-[24px] bg-ink p-5 text-white">
                <p className="font-semibold">发布接口已返回链接</p>
                <p className="mt-2 text-sm leading-6 text-white/70">注意：当前只是调用本项目的发布 API，真实上线取决于你是否已经把项目部署到 EdgeOne/COS，并配置了域名。</p>
                <p className="mt-2 break-all text-sm text-white/70">{publishResult}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(publishResult)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"><Copy size={15} /> 复制</button>
                  <Link href={publishResult} target="_blank" className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">打开预览</Link>
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
      `}</style>
    </div>
  );
}

function EditorPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-line">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-night/45">{label}</span>
      {children}
    </label>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{children}</div>;
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
