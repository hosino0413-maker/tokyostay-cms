"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, DoorOpen, Eye, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { text } from "@/lib/properties";
import type { Building, Locale, MediaImage, RoomType } from "@/types/property";

const storageKey = "tokyostay-buildings-v1";
const localeTabs: { key: Locale; label: string }[] = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" }
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localized(value = "") {
  return { zh: value, en: value, ja: value };
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blankRoomType(): RoomType {
  return {
    id: `room-${Date.now()}`,
    name: { zh: "新户型", en: "New Room Type", ja: "新しいタイプ" },
    roomType: "1LDK",
    capacity: "1-2",
    size: "30 sqm",
    rooms: [],
    description: { zh: "", en: "", ja: "" },
    tags: ["Wi-Fi", "Kitchen"],
    amenities: ["Wi-Fi", "Kitchen"],
    images: [],
    videos: [],
    map: { type: "google", embedUrl: "", address: "" },
    unavailableDates: [],
    status: "draft"
  };
}

function blankBuilding(): Building {
  return {
    id: `building-${Date.now()}`,
    name: { zh: "新楼盘", en: "New Residence", ja: "新しいレジデンス" },
    area: "Tokyo",
    station: "Station",
    walkMinutes: 5,
    description: { zh: "", en: "", ja: "" },
    coverImage: "",
    gallery: [],
    featured: false,
    order: 999,
    tags: ["Near Station"],
    roomTypes: [blankRoomType()]
  };
}

export function BuildingAdminClient({ initialBuildings }: { initialBuildings: Building[] }) {
  const [buildings, setBuildings] = useState(initialBuildings);
  const [currentBuildingId, setCurrentBuildingId] = useState(initialBuildings[0]?.id ?? "");
  const [currentRoomId, setCurrentRoomId] = useState(initialBuildings[0]?.roomTypes[0]?.id ?? "");
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Building[];
    setBuildings(parsed);
    setCurrentBuildingId(parsed[0]?.id ?? "");
    setCurrentRoomId(parsed[0]?.roomTypes[0]?.id ?? "");
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(buildings));
  }, [buildings]);

  const currentBuilding = buildings.find((building) => building.id === currentBuildingId) ?? buildings[0];
  const currentRoom = currentBuilding?.roomTypes.find((room) => room.id === currentRoomId) ?? currentBuilding?.roomTypes[0];

  const previewHref = currentRoom
    ? `/building/${currentBuilding.id}/room/${currentRoom.id}?lang=${locale}`
    : currentBuilding
      ? `/building/${currentBuilding.id}?lang=${locale}`
      : "/";

  const coverPreview = useMemo(() => currentBuilding?.coverImage || currentBuilding?.gallery[0]?.url || currentRoom?.images[0]?.url || "", [currentBuilding, currentRoom]);

  function saveNow() {
    localStorage.setItem(storageKey, JSON.stringify(buildings));
  }

  function updateBuilding(patch: Partial<Building>) {
    if (!currentBuilding) return;
    setBuildings((items) => items.map((building) => (building.id === currentBuilding.id ? { ...building, ...patch } : building)));
  }

  function updateRoom(patch: Partial<RoomType>) {
    if (!currentBuilding || !currentRoom) return;
    setBuildings((items) =>
      items.map((building) =>
        building.id === currentBuilding.id
          ? { ...building, roomTypes: building.roomTypes.map((room) => (room.id === currentRoom.id ? { ...room, ...patch } : room)) }
          : building
      )
    );
  }

  function updateBuildingText(field: "name" | "description", value: string) {
    if (!currentBuilding) return;
    updateBuilding({ [field]: { ...currentBuilding[field], [locale]: value } });
  }

  function updateRoomText(field: "name" | "description", value: string) {
    if (!currentRoom) return;
    updateRoom({ [field]: { ...currentRoom[field], [locale]: value } });
  }

  function addBuilding() {
    const building = { ...blankBuilding(), order: buildings.length + 1 };
    setBuildings((items) => [...items, building]);
    setCurrentBuildingId(building.id);
    setCurrentRoomId(building.roomTypes[0].id);
  }

  function deleteBuilding() {
    if (!currentBuilding || buildings.length <= 1) return;
    const nextBuildings = buildings.filter((building) => building.id !== currentBuilding.id);
    setBuildings(nextBuildings);
    setCurrentBuildingId(nextBuildings[0]?.id ?? "");
    setCurrentRoomId(nextBuildings[0]?.roomTypes[0]?.id ?? "");
  }

  async function addBuildingImages(files: FileList) {
    if (!currentBuilding) return;
    const uploaded: MediaImage[] = [];
    for (const file of Array.from(files)) {
      const url = await readFileAsDataUrl(file);
      uploaded.push({
        id: uid("building-img"),
        url,
        type: currentBuilding.gallery.length || uploaded.length ? "gallery" : "cover",
        alt: file.name
      });
    }
    const nextGallery = [...currentBuilding.gallery, ...uploaded];
    updateBuilding({
      gallery: nextGallery,
      coverImage: currentBuilding.coverImage || nextGallery[0]?.url || ""
    });
  }

  function setBuildingCover(imageId: string) {
    if (!currentBuilding) return;
    const cover = currentBuilding.gallery.find((image) => image.id === imageId);
    updateBuilding({
      coverImage: cover?.url ?? currentBuilding.coverImage,
      gallery: currentBuilding.gallery.map((image) => ({ ...image, type: image.id === imageId ? "cover" : "gallery" }))
    });
  }

  function removeBuildingImage(imageId: string) {
    if (!currentBuilding) return;
    const nextGallery = currentBuilding.gallery.filter((image) => image.id !== imageId);
    const nextCover = nextGallery.find((image) => image.type === "cover") ?? nextGallery[0];
    updateBuilding({
      gallery: nextGallery.map((image, index) => ({ ...image, type: image.id === nextCover?.id || (!nextCover && index === 0) ? "cover" : "gallery" })),
      coverImage: nextCover?.url ?? ""
    });
  }

  function addRoomType() {
    if (!currentBuilding) return;
    const room = blankRoomType();
    updateBuilding({ roomTypes: [...currentBuilding.roomTypes, room] });
    setCurrentRoomId(room.id);
  }

  function deleteRoomType() {
    if (!currentBuilding || !currentRoom || currentBuilding.roomTypes.length <= 1) return;
    const nextRooms = currentBuilding.roomTypes.filter((room) => room.id !== currentRoom.id);
    updateBuilding({ roomTypes: nextRooms });
    setCurrentRoomId(nextRooms[0]?.id ?? "");
  }

  if (!currentBuilding || !currentRoom) return null;

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/88 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">TokyoStay CMS</p>
            <h1 className="text-lg font-semibold">楼盘 / 户型工作台</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveNow} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold shadow-card">
              <Save size={16} /> 保存
            </button>
            <Link href={previewHref} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold shadow-card">
              <Eye size={16} /> 预览
            </Link>
          </div>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[320px_minmax(560px,1fr)_380px]">
        <aside className="border-r border-line bg-white p-4">
          <button onClick={addBuilding} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            <Plus size={17} /> 新增楼盘
          </button>
          <div className="space-y-3">
            {buildings.map((building) => (
              <div key={building.id} className="rounded-3xl border border-line bg-mist/60 p-2">
                <button
                  onClick={() => {
                    setCurrentBuildingId(building.id);
                    setCurrentRoomId(building.roomTypes[0]?.id ?? "");
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${building.id === currentBuilding.id ? "bg-ink text-white" : "hover:bg-white"}`}
                >
                  <Building2 size={17} />
                  <span className="min-w-0 truncate text-sm font-semibold">{text(building.name, locale)}</span>
                </button>
                <div className="mt-1 space-y-1 pl-4">
                  {building.roomTypes.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => {
                        setCurrentBuildingId(building.id);
                        setCurrentRoomId(room.id);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${building.id === currentBuilding.id && room.id === currentRoom.id ? "bg-white font-semibold text-brand shadow-card" : "text-night/60 hover:bg-white"}`}
                    >
                      <DoorOpen size={14} />
                      <span className="truncate">{room.roomType} · {text(room.name, locale)}</span>
                    </button>
                  ))}
                  <button onClick={addRoomType} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-night/45 hover:bg-white">
                    <Plus size={13} /> 新增户型
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="overflow-auto p-5">
          <div className="mx-auto max-w-4xl space-y-5">
            <LocaleTabs locale={locale} setLocale={setLocale} />

            <EditorPanel title="Building 楼盘管理">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="楼盘 ID"><input value={currentBuilding.id} onChange={(event) => { updateBuilding({ id: event.target.value }); setCurrentBuildingId(event.target.value); }} className="input" /></Field>
                <Field label="区域"><input value={currentBuilding.area} onChange={(event) => updateBuilding({ area: event.target.value })} className="input" /></Field>
                <Field label="最近车站"><input value={currentBuilding.station} onChange={(event) => updateBuilding({ station: event.target.value })} className="input" /></Field>
                <Field label="步行分钟"><input type="number" value={currentBuilding.walkMinutes} onChange={(event) => updateBuilding({ walkMinutes: Number(event.target.value) })} className="input" /></Field>
                <Field label="封面图 URL"><input value={currentBuilding.coverImage} onChange={(event) => updateBuilding({ coverImage: event.target.value })} className="input" /></Field>
                <Field label="首页精选">
                  <select value={currentBuilding.featured ? "yes" : "no"} onChange={(event) => updateBuilding({ featured: event.target.value === "yes" })} className="input">
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </Field>
              </div>
              <Field label={`楼盘名称 · ${locale}`}><input value={currentBuilding.name[locale]} onChange={(event) => updateBuildingText("name", event.target.value)} className="input" /></Field>
              <Field label={`楼盘介绍 · ${locale}`}><textarea value={currentBuilding.description[locale]} onChange={(event) => updateBuildingText("description", event.target.value)} className="input min-h-28" /></Field>
              <Field label="楼盘标签，英文逗号分隔"><input value={currentBuilding.tags.join(", ")} onChange={(event) => updateBuilding({ tags: normalizeList(event.target.value) })} className="input" /></Field>
              <BuildingImageDropZone onFiles={addBuildingImages} />
              <div className="grid gap-3 md:grid-cols-3">
                {currentBuilding.gallery.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("building-image-index", String(index))}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      const from = Number(event.dataTransfer.getData("building-image-index"));
                      const gallery = moveItem(currentBuilding.gallery, from, index);
                      const cover = gallery.find((item) => item.type === "cover") ?? gallery[0];
                      updateBuilding({ gallery, coverImage: cover?.url ?? "" });
                    }}
                    className="overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    <div className="relative h-32 bg-line">
                      <Image src={image.url} alt={image.alt} fill className="object-cover" />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <button onClick={() => setBuildingCover(image.id)} className="text-xs font-bold text-brand">
                        {image.url === currentBuilding.coverImage || image.type === "cover" ? "封面图" : "设为封面"}
                      </button>
                      <button onClick={() => removeBuildingImage(image.id)} className="text-red-600" aria-label="删除楼盘图片">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={deleteBuilding} disabled={buildings.length <= 1} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-45">
                <Trash2 size={16} /> 删除当前楼盘
              </button>
            </EditorPanel>

            <EditorPanel title="Room Type 户型管理">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="户型 ID"><input value={currentRoom.id} onChange={(event) => { updateRoom({ id: event.target.value }); setCurrentRoomId(event.target.value); }} className="input" /></Field>
                <Field label="发布状态">
                  <select value={currentRoom.status} onChange={(event) => updateRoom({ status: event.target.value as RoomType["status"] })} className="input">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="hidden">隐藏</option>
                  </select>
                </Field>
                <Field label="房型"><input value={currentRoom.roomType} onChange={(event) => updateRoom({ roomType: event.target.value })} className="input" /></Field>
                <Field label="面积"><input value={currentRoom.size} onChange={(event) => updateRoom({ size: event.target.value })} className="input" /></Field>
                <Field label="入住人数"><input value={currentRoom.capacity} onChange={(event) => updateRoom({ capacity: event.target.value })} className="input" /></Field>
                <Field label="房间号，英文逗号分隔"><input value={currentRoom.rooms.join(", ")} onChange={(event) => updateRoom({ rooms: normalizeList(event.target.value) })} className="input" /></Field>
              </div>
              <Field label={`户型名称 · ${locale}`}><input value={currentRoom.name[locale]} onChange={(event) => updateRoomText("name", event.target.value)} className="input" /></Field>
              <Field label={`户型介绍 · ${locale}`}><textarea value={currentRoom.description[locale]} onChange={(event) => updateRoomText("description", event.target.value)} className="input min-h-28" /></Field>
              <Field label="设施标签，英文逗号分隔"><input value={currentRoom.amenities.join(", ")} onChange={(event) => updateRoom({ amenities: normalizeList(event.target.value), tags: normalizeList(event.target.value).slice(0, 5) })} className="input" /></Field>
              <Field label="图片 URL，英文逗号分隔"><input value={currentRoom.images.map((image) => image.url).join(", ")} onChange={(event) => updateRoom({ images: normalizeList(event.target.value).map((url, index) => ({ id: uid("img"), url, type: index === 0 ? "cover" : "gallery", alt: currentRoom.roomType })) })} className="input" /></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="地图地址"><input value={currentRoom.map.address} onChange={(event) => updateRoom({ map: { ...currentRoom.map, address: event.target.value } })} className="input" /></Field>
                <Field label="地图嵌入 URL"><input value={currentRoom.map.embedUrl} onChange={(event) => updateRoom({ map: { ...currentRoom.map, embedUrl: event.target.value } })} className="input" /></Field>
              </div>
              <button onClick={deleteRoomType} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                <Trash2 size={16} /> 删除当前户型
              </button>
            </EditorPanel>
          </div>
        </section>

        <aside className="border-l border-line bg-white p-5">
          <div className="sticky top-21">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-moss">实时预览</p>
            <div className="overflow-hidden rounded-[28px] border border-line bg-mist shadow-soft">
              <div className="relative h-60 bg-line">
                {coverPreview ? <Image src={coverPreview} alt="Preview" fill className="object-cover" /> : <div className="grid h-full place-items-center text-night/40">No image</div>}
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{currentBuilding.area}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{text(currentBuilding.name, locale)}</h2>
                  <p className="mt-2 text-sm leading-6 text-night/60">{currentBuilding.station} · {currentBuilding.walkMinutes} min</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="font-semibold">{text(currentRoom.name, locale)}</p>
                  <p className="mt-1 text-sm text-night/60">{currentRoom.roomType} · {currentRoom.capacity} · {currentRoom.size}</p>
                </div>
                <div className="flex flex-wrap gap-2">{currentRoom.amenities.slice(0, 6).map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-night/60">{item}</span>)}</div>
              </div>
            </div>
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

function LocaleTabs({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return (
    <div className="flex rounded-full bg-white p-1 shadow-card ring-1 ring-line">
      {localeTabs.map((item) => (
        <button key={item.key} onClick={() => setLocale(item.key)} className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${locale === item.key ? "bg-ink text-white" : "text-night/50"}`}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function BuildingImageDropZone({ onFiles }: { onFiles: (files: FileList) => void }) {
  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFiles(event.dataTransfer.files);
      }}
      className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-mist/60 p-7 text-center transition hover:bg-mist"
    >
      <Building2 className="mb-3 text-brand" />
      <span className="text-sm font-semibold">拖拽或选择楼盘封面 / 展示图</span>
      <span className="mt-1 text-xs text-night/45">第一张会自动作为封面，可在下方重新设置封面、拖动排序或删除</span>
      <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => event.target.files && onFiles(event.target.files)} />
    </label>
  );
}
