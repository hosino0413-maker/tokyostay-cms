import { NextRequest, NextResponse } from "next/server";
import COS from "cos-nodejs-sdk-v5";

export const runtime = "nodejs";

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > -1 ? name.slice(0, dot) : name).replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-|-$/g, "");
  const ext = dot > -1 ? name.slice(dot).toLowerCase() : "";
  return `${Date.now()}-${base || "asset"}${ext}`;
}

function uploadKey(formData: FormData, fileName: string) {
  const buildingId = String(formData.get("buildingId") || "").trim();
  const roomId = String(formData.get("roomId") || "").trim();
  const target = String(formData.get("target") || "").trim();

  if (target === "building-gallery") {
    if (!buildingId) throw new Error("Missing buildingId");
    return `buildings/${buildingId}/gallery/${fileName}`;
  }

  if (target === "room-images") {
    if (!buildingId || !roomId) throw new Error("Missing buildingId or roomId");
    return `buildings/${buildingId}/rooms/${roomId}/${fileName}`;
  }

  const propertyId = String(formData.get("propertyId") || "general");
  const kind = String(formData.get("kind") || "image") === "video" ? "videos" : "images";
  return `${kind}/${propertyId}/${fileName}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") && String(formData.get("kind") || "image") !== "video") {
      return NextResponse.json({ error: "Only image uploads are supported here" }, { status: 400 });
    }

    const fileName = safeName(file.name);
    const bucket = process.env.COS_BUCKET || process.env.TENCENT_COS_BUCKET;
    const region = process.env.COS_REGION || process.env.TENCENT_COS_REGION;
    const secretId = process.env.COS_SECRET_ID || process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.COS_SECRET_KEY || process.env.TENCENT_SECRET_KEY;
    const publicBaseUrl =
      process.env.COS_PUBLIC_BASE_URL ||
      process.env.TENCENT_COS_DOMAIN ||
      (bucket && region ? `https://${bucket}.cos.${region}.myqcloud.com` : "");

    if (!bucket || !region || !secretId || !secretKey || !publicBaseUrl) {
      return NextResponse.json({ error: "COS upload is not configured" }, { status: 500 });
    }

    const key = uploadKey(formData, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

    await new Promise<void>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: buffer,
          ContentLength: buffer.length,
          ContentType: file.type || undefined
        },
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return NextResponse.json({
      ok: true,
      provider: "tencent-cos",
      key,
      fileName,
      url: `${publicBaseUrl.replace(/\/$/, "")}/${key}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed", ok: false },
      { status: 500 }
    );
  }
}
