import type { Locale } from "@/types/property";

export type TagGroupId =
  | "property_type"
  | "location_transport"
  | "suitable_for"
  | "room_facilities"
  | "appliances"
  | "safety_convenience"
  | "nearby"
  | "recommended";

export type TagItem = {
  id: string;
  group: TagGroupId;
  zh: string;
  en: string;
  ja: string;
};

export type TagGroup = {
  id: TagGroupId;
  zh: string;
  en: string;
  ja: string;
  tags: TagItem[];
};

const makeTags = (group: TagGroupId, tags: Omit<TagItem, "group">[]): TagItem[] =>
  tags.map((tag) => ({ ...tag, group }));

export const tagGroups: TagGroup[] = [
  {
    id: "property_type",
    zh: "房源类型",
    en: "Property Type",
    ja: "物件タイプ",
    tags: makeTags("property_type", [
      { id: "entire_home", zh: "整套房源", en: "Entire Home", ja: "貸切" },
      { id: "studio_apartment", zh: "单间公寓", en: "Studio Apartment", ja: "ワンルームマンション" },
      { id: "1r", zh: "1R", en: "1R", ja: "1R" },
      { id: "1k", zh: "1K", en: "1K", ja: "1K" },
      { id: "1dk", zh: "1DK", en: "1DK", ja: "1DK" },
      { id: "1ldk", zh: "1LDK", en: "1LDK", ja: "1LDK" },
      { id: "2ldk", zh: "2LDK", en: "2LDK", ja: "2LDK" },
      { id: "apartment", zh: "公寓", en: "Apartment", ja: "マンション" },
      { id: "detached_house", zh: "独栋", en: "Detached House", ja: "戸建て" },
      { id: "newly_renovated", zh: "全新装修", en: "Newly Renovated", ja: "新規リノベーション" },
      { id: "new_building", zh: "新房", en: "New Building", ja: "新築" },
      { id: "high_floor", zh: "高楼层", en: "High Floor", ja: "高層階" },
      { id: "balcony", zh: "带阳台", en: "Balcony", ja: "バルコニー付き" },
      { id: "city_view", zh: "城市景观", en: "City View", ja: "シティビュー" }
    ])
  },
  {
    id: "location_transport",
    zh: "位置交通",
    en: "Location & Transport",
    ja: "立地・交通",
    tags: makeTags("location_transport", [
      { id: "near_station", zh: "近车站", en: "Near Station", ja: "駅近" },
      { id: "walk_5_min", zh: "步行5分钟", en: "5-Min Walk", ja: "徒歩5分" },
      { id: "walk_10_min", zh: "步行10分钟", en: "10-Min Walk", ja: "徒歩10分" },
      { id: "jr_line", zh: "JR沿线", en: "JR Line", ja: "JR沿線" },
      { id: "subway_line", zh: "地铁沿线", en: "Subway Line", ja: "地下鉄沿線" },
      { id: "airport_access", zh: "机场交通方便", en: "Easy Airport Access", ja: "空港アクセス良好" },
      { id: "shopping_convenient", zh: "购物方便", en: "Convenient Shopping", ja: "買い物便利" },
      { id: "dining_rich", zh: "餐饮丰富", en: "Great Dining Nearby", ja: "飲食店が豊富" },
      { id: "quiet_residential", zh: "安静住宅区", en: "Quiet Residential Area", ja: "閑静な住宅街" },
      { id: "city_center", zh: "市中心", en: "City Center", ja: "都心" }
    ])
  },
  {
    id: "suitable_for",
    zh: "适合人群",
    en: "Suitable For",
    ja: "おすすめ対象",
    tags: makeTags("suitable_for", [
      { id: "couple_friendly", zh: "情侣适合", en: "Couple Friendly", ja: "カップル向け" },
      { id: "family_friendly", zh: "家庭适合", en: "Family Friendly", ja: "ファミリー向け" },
      { id: "business_friendly", zh: "商务适合", en: "Business Friendly", ja: "ビジネス向け" },
      { id: "kids_friendly", zh: "亲子友好", en: "Kids Friendly", ja: "子連れ歓迎" },
      { id: "elderly_friendly", zh: "老人友好", en: "Elderly Friendly", ja: "シニア向け" },
      { id: "long_stay", zh: "长期入住", en: "Long Stay", ja: "長期滞在" },
      { id: "short_stay", zh: "短期入住", en: "Short Stay", ja: "短期滞在" },
      { id: "group_stay", zh: "多人入住", en: "Group Stay", ja: "複数名滞在" }
    ])
  },
  {
    id: "room_facilities",
    zh: "房间设施",
    en: "Room Facilities",
    ja: "室内設備",
    tags: makeTags("room_facilities", [
      { id: "free_wifi", zh: "免费Wi-Fi", en: "Free Wi-Fi", ja: "無料Wi-Fi" },
      { id: "smart_tv", zh: "智能电视", en: "Smart TV", ja: "スマートテレビ" },
      { id: "washing_machine", zh: "洗衣机", en: "Washing Machine", ja: "洗濯機" },
      { id: "dryer", zh: "烘干机", en: "Dryer", ja: "乾燥機" },
      { id: "refrigerator", zh: "冰箱", en: "Refrigerator", ja: "冷蔵庫" },
      { id: "kitchen", zh: "厨房", en: "Kitchen", ja: "キッチン" },
      { id: "dining_table", zh: "餐桌", en: "Dining Table", ja: "ダイニングテーブル" },
      { id: "bathtub", zh: "浴缸", en: "Bathtub", ja: "浴槽" },
      { id: "shower", zh: "淋浴", en: "Shower", ja: "シャワー" },
      { id: "smart_toilet", zh: "智能马桶", en: "Smart Toilet", ja: "温水洗浄便座" },
      { id: "vanity", zh: "化妆台", en: "Vanity", ja: "洗面台" },
      { id: "sofa", zh: "沙发", en: "Sofa", ja: "ソファ" },
      { id: "double_bed", zh: "双人床", en: "Double Bed", ja: "ダブルベッド" },
      { id: "queen_bed", zh: "大床", en: "Large Bed", ja: "大きめベッド" },
      { id: "extra_mattress", zh: "可加床垫", en: "Extra Mattress Available", ja: "追加マットレス可" }
    ])
  },
  {
    id: "appliances",
    zh: "家电用品",
    en: "Appliances",
    ja: "家電・備品",
    tags: makeTags("appliances", [
      { id: "air_conditioner", zh: "空调", en: "Air Conditioner", ja: "エアコン" },
      { id: "heating", zh: "暖气", en: "Heating", ja: "暖房" },
      { id: "microwave", zh: "微波炉", en: "Microwave", ja: "電子レンジ" },
      { id: "rice_cooker", zh: "电饭煲", en: "Rice Cooker", ja: "炊飯器" },
      { id: "electric_kettle", zh: "电热水壶", en: "Electric Kettle", ja: "電気ケトル" },
      { id: "coffee_machine", zh: "咖啡机", en: "Coffee Machine", ja: "コーヒーメーカー" },
      { id: "vacuum_cleaner", zh: "吸尘器", en: "Vacuum Cleaner", ja: "掃除機" },
      { id: "hair_dryer", zh: "吹风机", en: "Hair Dryer", ja: "ドライヤー" },
      { id: "iron", zh: "熨斗", en: "Iron", ja: "アイロン" }
    ])
  },
  {
    id: "safety_convenience",
    zh: "安全便利",
    en: "Safety & Convenience",
    ja: "安全・便利",
    tags: makeTags("safety_convenience", [
      { id: "self_check_in", zh: "自助入住", en: "Self Check-in", ja: "セルフチェックイン" },
      { id: "smart_lock", zh: "智能门锁", en: "Smart Lock", ja: "スマートロック" },
      { id: "elevator", zh: "电梯", en: "Elevator", ja: "エレベーター" },
      { id: "smoke_alarm", zh: "烟雾报警器", en: "Smoke Alarm", ja: "煙感知器" },
      { id: "fire_extinguisher", zh: "灭火器", en: "Fire Extinguisher", ja: "消火器" },
      { id: "security_camera", zh: "监控摄像", en: "Security Camera", ja: "防犯カメラ" },
      { id: "access_control", zh: "门禁系统", en: "Access Control", ja: "オートロック" }
    ])
  },
  {
    id: "nearby",
    zh: "周边配套",
    en: "Nearby",
    ja: "周辺施設",
    tags: makeTags("nearby", [
      { id: "convenience_store", zh: "便利店", en: "Convenience Store", ja: "コンビニ" },
      { id: "supermarket", zh: "超市", en: "Supermarket", ja: "スーパー" },
      { id: "cafe", zh: "咖啡店", en: "Cafe", ja: "カフェ" },
      { id: "restaurant", zh: "餐厅", en: "Restaurant", ja: "レストラン" },
      { id: "park", zh: "公园", en: "Park", ja: "公園" },
      { id: "hospital", zh: "医院", en: "Hospital", ja: "病院" },
      { id: "drugstore", zh: "药妆店", en: "Drugstore", ja: "ドラッグストア" },
      { id: "tourist_spot", zh: "观光景点", en: "Tourist Spot", ja: "観光スポット" }
    ])
  },
  {
    id: "recommended",
    zh: "推荐标签",
    en: "Recommended",
    ja: "おすすめタグ",
    tags: makeTags("recommended", [
      { id: "popular", zh: "热门房源", en: "Popular", ja: "人気物件" },
      { id: "recommended_property", zh: "推荐房源", en: "Recommended", ja: "おすすめ物件" },
      { id: "good_value", zh: "高性价比", en: "Good Value", ja: "コスパ良好" },
      { id: "premium_property", zh: "高级房源", en: "Premium", ja: "高級物件" },
      { id: "first_time_japan", zh: "适合首次来日", en: "Great for First Japan Stay", ja: "初来日におすすめ" },
      { id: "long_term_living", zh: "适合长期居住", en: "Good for Long-Term Living", ja: "長期居住向け" },
      { id: "business_trip", zh: "适合商务出差", en: "Business Trip Friendly", ja: "出張向け" },
      { id: "photogenic", zh: "拍照好看", en: "Photogenic", ja: "写真映え" },
      { id: "bright_room", zh: "采光好", en: "Bright Room", ja: "日当たり良好" },
      { id: "quiet_comfortable", zh: "安静舒适", en: "Quiet & Comfortable", ja: "静かで快適" }
    ])
  }
];

export const allTags = tagGroups.flatMap((group) => group.tags);

const tagById = new Map(allTags.map((tag) => [tag.id, tag]));

const legacyToId = new Map<string, string>([
  ["wi-fi", "free_wifi"],
  ["wifi", "free_wifi"],
  ["free wi-fi", "free_wifi"],
  ["kitchen", "kitchen"],
  ["kitchenette", "kitchen"],
  ["washer", "washing_machine"],
  ["washing machine", "washing_machine"],
  ["air conditioner", "air_conditioner"],
  ["air conditioning", "air_conditioner"],
  ["workspace", "business_friendly"],
  ["bathtub", "bathtub"],
  ["balcony", "balcony"],
  ["elevator", "elevator"],
  ["near station", "near_station"],
  ["long stay", "long_stay"],
  ["family", "family_friendly"],
  ["family friendly", "family_friendly"],
  ["business stay", "business_friendly"],
  ["self check-in", "self_check_in"],
  ["self check in", "self_check_in"]
]);

export function normalizeTagId(value: string) {
  if (tagById.has(value)) return value;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return legacyToId.get(normalized) ?? value;
}

export function normalizeTagIds(values: string[]) {
  return Array.from(new Set(values.map(normalizeTagId).filter(Boolean)));
}

export function tagLabel(value: string, locale: Locale) {
  const id = normalizeTagId(value);
  const tag = tagById.get(id);
  return tag?.[locale] ?? value;
}

export function tagGroupLabel(group: TagGroup, locale: Locale) {
  return group[locale];
}
