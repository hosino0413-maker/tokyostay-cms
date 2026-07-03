"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Copy,
  DoorOpen,
  Eye,
  ImageIcon,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Tags,
  Trash2,
  UploadCloud,
  Video
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { text } from "@/lib/properties";
import { normalizeTagIds, tagGroups, tagLabel } from "@/lib/tags";
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

function normalizeList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
    tags: ["free_wifi", "kitchen"],
    amenities: ["free_wifi", "kitchen"],
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
    tags: ["near_station"],
    roomTypes: [blankRoomType()]
  };
}

function normalizeBuildingTags(buildings: Building[]) {
  return buildings.map((building) => ({
    ...building,
    tags: normalizeTagIds(building.tags ?? []),
    roomTypes: building.roomTypes.map((room) => ({
      ...room,
      tags: normalizeTagIds(room.tags ?? room.amenities ?? []),
      amenities: normalizeTagIds(room.amenities ?? room.tags ?? [])
    }))
  }));
}

function statusMeta(status: RoomType["status"]) {
  if (status === "published") return { label: "已发布", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" };
  if (status === "hidden") return { label: "隐藏", dot: "bg-zinc-400", chip: "bg-zinc-100 text-zinc-600" };
  return { label: "草稿", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700" };
}

export function BuildingAdminSaasClient({ initialBuildings }: { initialBuildings: Building[] }) {
  const [buildings, setBuildings] = useState(() => normalizeBuildingTags(initialBuildings));
  const [currentBuildingId, setCurrentBuildingId] = useState(initialBuildings[0]?.id ?? "");
  const [currentRoomId, setCurrentRoomId] = useState(initialBuildings[0]?.roomTypes[0]?.id ?? "");
  const [locale, setLocale] = useState<Locale>("zh");
  const [publishResult, setPublishResult] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    const parsed = normalizeBuildingTags(JSON.parse(saved) as Building[]);
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

  const coverPreview = useMemo(
    () => currentBuilding?.coverImage || currentBuilding?.gallery[0]?.url || currentRoom?.images[0]?.url || "",
    [currentBuilding, currentRoom]
  );

  function saveNow() {
    localStorage.setItem(storageKey, JSON.stringify(buildings));
  }

  async function generateAi() {
    if (!currentBuilding || !currentRoom) return;
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `${currentBuilding.id}-${currentRoom.id}`,
        title: currentRoom.name,
        area: currentBuilding.area,
        priceNote: "",
        roomType: currentRoom.roomType,
        capacity: currentRoom.capacity,
        size: currentRoom.size,
        traffic: `${currentBuilding.station} · ${currentBuilding.walkMinutes} min`,
        description: currentRoom.description,
        sellingPoints: [],
        amenities: currentRoom.amenities,
        images: currentRoom.images,
        videos: currentRoom.videos,
        map: currentRoom.map,
        unavailableDates: currentRoom.unavailableDates,
        status: currentRoom.status,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });
    const ai = await res.json();
    const aiAmenityIds = normalizeTagIds(ai.amenities ?? []);
    updateRoom({
      description: ai.description,
      amenities: normalizeTagIds([...(currentRoom.amenities ?? []), ...aiAmenityIds]),
      tags: normalizeTagIds([...(currentRoom.tags ?? []), ...aiAmenityIds]).slice(0, 6)
    });
  }

  async function publishToWebsite() {
    saveNow();
    setPublishResult("正在同步到网站...");
    const res = await fetch("/api/publish-buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buildings, currentBuildingId: currentBuilding?.id, currentRoomId: currentRoom?.id })
    });
    const payload = await res.json();
    setPublishResult(res.ok ? payload.listUrl || payload.url || "同步完成" : payload.error || "同步失败，请稍后重试");
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
      gallery: nextGallery.map((image) => ({ ...image, type: image.id === nextCover?.id ? "cover" : "gallery" })),
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

  function copyCurrentRoom() {
    if (!currentBuilding || !currentRoom) return;
    const copy: RoomType = {
      ...currentRoom,
      id: `${currentRoom.id}-copy-${Date.now()}`,
      name: {
        zh: `${currentRoom.name.zh || currentRoom.roomType} 副本`,
        en: `${currentRoom.name.en || currentRoom.roomType} Copy`,
        ja: `${currentRoom.name.ja || currentRoom.roomType} コピー`
      },
      rooms: [...currentRoom.rooms],
      images: currentRoom.images.map((image) => ({ ...image, id: uid("img") })),
      videos: currentRoom.videos.map((video) => ({ ...video, id: uid("video") })),
      unavailableDates: currentRoom.unavailableDates.map((range) => ({ ...range })),
      status: "draft"
    };
    updateBuilding({ roomTypes: [...currentBuilding.roomTypes, copy] });
    setCurrentRoomId(copy.id);
  }

  function patchDateRange(index: number, patch: { start?: string; end?: string }) {
    updateRoom({
      unavailableDates: currentRoom.unavailableDates.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, ...patch } : range
      )
    });
  }

  function removeDateRange(index: number) {
    updateRoom({ unavailableDates: currentRoom.unavailableDates.filter((_, rangeIndex) => rangeIndex !== index) });
  }

  function addDateRange() {
    updateRoom({ unavailableDates: [...currentRoom.unavailableDates, { start: "", end: "" }] });
  }

  function updateRoomVideos(value: string) {
    updateRoom({
      videos: normalizeList(value).map((url, index) => ({
        id: currentRoom.videos[index]?.id ?? uid("video"),
        url,
        title: currentRoom.videos[index]?.title ?? `Room Tour ${index + 1}`
      }))
    });
  }

  function addRoomVideos(files: FileList) {
    const nextVideos = Array.from(files).map((file) => ({
      id: uid("video"),
      url: URL.createObjectURL(file),
      title: file.name || "Room Tour"
    }));
    updateRoom({ videos: [...currentRoom.videos, ...nextVideos] });
  }

  if (!currentBuilding || !currentRoom) return null;

  const currentStatus = statusMeta(currentRoom.status);

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-ink">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-xl">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand">TokyoStay CMS</p>
            <h1 className="truncate text-lg font-semibold">房源运营工作台</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={saveNow} className="admin-action-button bg-white text-ink">
              <Save size={16} /> 保存草稿
            </button>
            <Link href={previewHref} target="_blank" className="admin-action-button bg-white text-ink">
              <Eye size={16} /> 预览
            </Link>
            <button onClick={copyCurrentRoom} className="admin-action-button bg-white text-ink">
              <Copy size={16} /> 复制房源
            </button>
            <button onClick={generateAi} className="admin-action-button bg-moss text-white">
              <Sparkles size={16} /> AI生成
            </button>
            <button onClick={publishToWebsite} className="admin-action-button bg-ink text-white">
              <UploadCloud size={16} /> 发布
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1680px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <aside className="border-r border-line/70 bg-white/72 p-4 backdrop-blur lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto">
          <button onClick={addBuilding} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-card">
            <Plus size={17} /> 新增楼盘
          </button>

          <div className="space-y-3">
            {buildings.map((building) => (
              <div key={building.id} className="rounded-[24px] border border-line/80 bg-[#fbfaf7] p-2">
                <button
                  onClick={() => {
                    setCurrentBuildingId(building.id);
                    setCurrentRoomId(building.roomTypes[0]?.id ?? "");
                  }}
                  className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                    building.id === currentBuilding.id ? "bg-ink text-white shadow-card" : "hover:bg-white"
                  }`}
                >
                  <Building2 size={18} className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{text(building.name, locale)}</span>
                    <span className={`mt-1 block truncate text-xs ${building.id === currentBuilding.id ? "text-white/65" : "text-night/45"}`}>
                      {building.area}
                    </span>
                  </span>
                </button>

                <div className="mt-2 space-y-1">
                  {building.roomTypes.map((room) => {
                    const meta = statusMeta(room.status);
                    const selected = building.id === currentBuilding.id && room.id === currentRoom.id;
                    return (
                      <button
                        key={room.id}
                        onClick={() => {
                          setCurrentBuildingId(building.id);
                          setCurrentRoomId(room.id);
                        }}
                        className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                          selected ? "bg-white font-semibold text-brand shadow-card" : "text-night/65 hover:bg-white"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                        <DoorOpen size={15} />
                        <span className="min-w-0 flex-1 truncate">{text(room.name, locale) || room.roomType}</span>
                      </button>
                    );
                  })}
                  <button onClick={addRoomType} className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-semibold text-night/45 hover:bg-white">
                    <Plus size={14} /> 新增户型
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 lg:px-6">
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LocaleTabs locale={locale} setLocale={setLocale} />
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${currentStatus.chip}`}>{currentStatus.label}</span>
            </div>

            <EditorPanel icon={<Building2 size={19} />} title="基础信息">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="楼盘 ID">
                  <input value={currentBuilding.id} onChange={(event) => { updateBuilding({ id: event.target.value }); setCurrentBuildingId(event.target.value); }} className="input" />
                </Field>
                <Field label="区域">
                  <input value={currentBuilding.area} onChange={(event) => updateBuilding({ area: event.target.value })} className="input" />
                </Field>
                <Field label="最近车站">
                  <input value={currentBuilding.station} onChange={(event) => updateBuilding({ station: event.target.value })} className="input" />
                </Field>
                <Field label="步行分钟">
                  <input type="number" value={currentBuilding.walkMinutes} onChange={(event) => updateBuilding({ walkMinutes: Number(event.target.value) })} className="input" />
                </Field>
                <Field label="户型 ID">
                  <input value={currentRoom.id} onChange={(event) => { updateRoom({ id: event.target.value }); setCurrentRoomId(event.target.value); }} className="input" />
                </Field>
                <Field label="发布状态">
                  <select value={currentRoom.status} onChange={(event) => updateRoom({ status: event.target.value as RoomType["status"] })} className="input">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="hidden">隐藏</option>
                  </select>
                </Field>
                <Field label="房型">
                  <input value={currentRoom.roomType} onChange={(event) => updateRoom({ roomType: event.target.value })} className="input" />
                </Field>
                <Field label="面积">
                  <input value={currentRoom.size} onChange={(event) => updateRoom({ size: event.target.value })} className="input" />
                </Field>
                <Field label="入住人数">
                  <input value={currentRoom.capacity} onChange={(event) => updateRoom({ capacity: event.target.value })} className="input" />
                </Field>
                <Field label="房间号，英文逗号分隔">
                  <input value={currentRoom.rooms.join(", ")} onChange={(event) => updateRoom({ rooms: normalizeList(event.target.value) })} className="input" />
                </Field>
                <Field label="首页精选">
                  <select value={currentBuilding.featured ? "yes" : "no"} onChange={(event) => updateBuilding({ featured: event.target.value === "yes" })} className="input">
                    <option value="yes">是</option>
                    <option value="no">否</option>
                  </select>
                </Field>
                <Field label="封面图 URL">
                  <input value={currentBuilding.coverImage} onChange={(event) => updateBuilding({ coverImage: event.target.value })} className="input" />
                </Field>
              </div>
            </EditorPanel>

            <EditorPanel icon={<ImageIcon size={19} />} title="图片管理">
              <BuildingImageDropZone onFiles={addBuildingImages} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="overflow-hidden rounded-[22px] border border-line bg-white"
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
              <Field label="房型图片 URL，英文逗号分隔">
                <input
                  value={currentRoom.images.map((image) => image.url).join(", ")}
                  onChange={(event) =>
                    updateRoom({
                      images: normalizeList(event.target.value).map((url, index) => ({
                        id: uid("img"),
                        url,
                        type: index === 0 ? "cover" : "gallery",
                        alt: currentRoom.roomType
                      }))
                    })
                  }
                  className="input"
                />
              </Field>
            </EditorPanel>

            <EditorPanel icon={<DoorOpen size={19} />} title="房源介绍">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={`楼盘名称 · ${locale}`}>
                  <input value={currentBuilding.name[locale]} onChange={(event) => updateBuildingText("name", event.target.value)} className="input" />
                </Field>
                <Field label={`户型名称 · ${locale}`}>
                  <input value={currentRoom.name[locale]} onChange={(event) => updateRoomText("name", event.target.value)} className="input" />
                </Field>
              </div>
              <Field label={`楼盘介绍 · ${locale}`}>
                <textarea value={currentBuilding.description[locale]} onChange={(event) => updateBuildingText("description", event.target.value)} className="input min-h-28" />
              </Field>
              <Field label={`户型介绍 · ${locale}`}>
                <textarea value={currentRoom.description[locale]} onChange={(event) => updateRoomText("description", event.target.value)} className="input min-h-32" />
              </Field>
            </EditorPanel>

            <EditorPanel icon={<Tags size={19} />} title="设施标签">
              <TagPicker
                title="楼盘标签"
                description="用于首页和楼盘卡片，可选择位置、推荐、人群等标签。"
                selected={currentBuilding.tags}
                onChange={(tags) => updateBuilding({ tags })}
              />
              <TagPicker
                title="房型设施标签"
                description="用于房型详情页和右侧实时预览，前台会自动按当前语言显示。"
                selected={currentRoom.amenities}
                onChange={(tags) => updateRoom({ amenities: tags, tags: tags.slice(0, 5) })}
              />
            </EditorPanel>

            <EditorPanel icon={<CalendarDays size={19} />} title="不可入住日期">
              <div className="space-y-3">
                {currentRoom.unavailableDates.map((range, index) => (
                  <div key={`${range.start}-${index}`} className="grid gap-3 rounded-2xl border border-line bg-white p-3 md:grid-cols-[1fr_1fr_auto]">
                    <Field label="开始日期">
                      <input type="date" value={range.start} onChange={(event) => patchDateRange(index, { start: event.target.value })} className="input" />
                    </Field>
                    <Field label="结束日期">
                      <input type="date" value={range.end} onChange={(event) => patchDateRange(index, { end: event.target.value })} className="input" />
                    </Field>
                    <button onClick={() => removeDateRange(index)} className="self-end rounded-2xl bg-red-50 px-4 py-3 text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={addDateRange} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
                  <Plus size={16} /> 新增不可入住日期
                </button>
              </div>
            </EditorPanel>

            <EditorPanel icon={<Video size={19} />} title="视频">
              <VideoDropZone onFiles={addRoomVideos} />
              <Field label="视频 URL，英文逗号分隔">
                <input value={currentRoom.videos.map((video) => video.url).join(", ")} onChange={(event) => updateRoomVideos(event.target.value)} className="input" />
              </Field>
            </EditorPanel>

            <EditorPanel icon={<MapPin size={19} />} title="地图">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="地图类型">
                  <select value={currentRoom.map.type} onChange={(event) => updateRoom({ map: { ...currentRoom.map, type: event.target.value as RoomType["map"]["type"] } })} className="input">
                    <option value="google">Google Map</option>
                    <option value="amap">高德地图</option>
                    <option value="image">图片地图</option>
                  </select>
                </Field>
                <Field label="地图地址">
                  <input value={currentRoom.map.address} onChange={(event) => updateRoom({ map: { ...currentRoom.map, address: event.target.value } })} className="input" />
                </Field>
                <Field label="嵌入链接或图片 URL">
                  <input value={currentRoom.map.embedUrl} onChange={(event) => updateRoom({ map: { ...currentRoom.map, embedUrl: event.target.value } })} className="input" />
                </Field>
              </div>
            </EditorPanel>

            <div className="flex flex-wrap gap-3 rounded-[24px] border border-red-100 bg-white p-4">
              <button onClick={deleteRoomType} disabled={currentBuilding.roomTypes.length <= 1} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-45">
                <Trash2 size={16} /> 删除当前户型
              </button>
              <button onClick={deleteBuilding} disabled={buildings.length <= 1} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-45">
                <Trash2 size={16} /> 删除当前楼盘
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-line/70 bg-white/72 p-5 backdrop-blur xl:block">
          <div className="sticky top-24">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-moss">实时预览</p>
            <div className="overflow-hidden rounded-[30px] border border-line bg-white shadow-soft">
              <div className="relative h-60 bg-line">
                {coverPreview ? <Image src={coverPreview} alt="Preview" fill className="object-cover" /> : <div className="grid h-full place-items-center text-night/40">No image</div>}
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{currentBuilding.area}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{text(currentBuilding.name, locale)}</h2>
                  <p className="mt-2 text-sm leading-6 text-night/60">
                    {currentBuilding.station} · 步行 {currentBuilding.walkMinutes} 分钟
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7f4ee] p-4">
                  <p className="font-semibold">{text(currentRoom.name, locale)}</p>
                  <p className="mt-1 text-sm text-night/60">
                    {currentRoom.roomType} · {currentRoom.capacity} · {currentRoom.size}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRoom.amenities.slice(0, 6).map((item) => (
                    <span key={item} className="rounded-full bg-[#f7f4ee] px-3 py-1 text-xs font-semibold text-night/60">
                      {tagLabel(item, locale)}
                    </span>
                  ))}
                </div>
                <Link href={previewHref} target="_blank" className="flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white">
                  <Eye size={16} /> 打开前台预览
                </Link>
              </div>
            </div>
            {publishResult && (
              <div className="mt-4 rounded-[24px] bg-ink p-4 text-white shadow-card">
                <p className="font-semibold">发布结果</p>
                <p className="mt-2 break-all text-sm leading-6 text-white/75">{publishResult}</p>
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
        .admin-action-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid #e7e1d7;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 14px 38px rgba(23, 20, 18, 0.08);
        }
      `}</style>
    </div>
  );
}

function EditorPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(23,20,18,0.06)]">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f7f4ee] text-brand">{icon}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
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
    <div className="inline-flex rounded-full bg-white p-1 shadow-card ring-1 ring-line">
      {localeTabs.map((item) => (
        <button key={item.key} onClick={() => setLocale(item.key)} className={`rounded-full px-4 py-2 text-sm font-semibold ${locale === item.key ? "bg-ink text-white" : "text-night/50"}`}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function TagPicker({
  title,
  description,
  selected,
  onChange
}: {
  title: string;
  description: string;
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const selectedIds = normalizeTagIds(selected);

  function toggle(tagId: string) {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
      return;
    }
    onChange([...selectedIds, tagId]);
  }

  return (
    <div className="rounded-[24px] border border-line bg-[#fbfaf7] p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-night/50">{description}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand ring-1 ring-line">
          已选 {selectedIds.length}
        </span>
      </div>

      <div className="space-y-4">
        {tagGroups.map((group) => (
          <details key={group.id} open className="rounded-[20px] bg-white p-3 ring-1 ring-line/70">
            <summary className="cursor-pointer select-none text-sm font-bold text-ink">{group.zh}</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const active = selectedIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggle(tag.id)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-ink text-white shadow-card"
                        : "bg-[#f7f4ee] text-night/62 ring-1 ring-line hover:bg-white hover:text-ink"
                    }`}
                  >
                    {tag.zh}
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>
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
      className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-[#f7f4ee] p-7 text-center transition hover:bg-white"
    >
      <ImageIcon className="mb-3 text-brand" />
      <span className="text-sm font-semibold">拖拽或选择楼盘封面 / 展示图</span>
      <span className="mt-1 text-xs text-night/45">支持多张图片，拖动缩略图可调整排序，可设置封面。</span>
      <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => event.target.files && onFiles(event.target.files)} />
    </label>
  );
}

function VideoDropZone({ onFiles }: { onFiles: (files: FileList) => void }) {
  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFiles(event.dataTransfer.files);
      }}
      className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-line bg-[#f7f4ee] p-7 text-center transition hover:bg-white"
    >
      <Video className="mb-3 text-brand" />
      <span className="text-sm font-semibold">拖拽 MP4 视频到这里</span>
      <span className="mt-1 text-xs text-night/45">只优化后台 UI，不改变现有上传和发布逻辑。</span>
      <input type="file" accept="video/mp4,video/*" multiple className="hidden" onChange={(event) => event.target.files && onFiles(event.target.files)} />
    </label>
  );
}
