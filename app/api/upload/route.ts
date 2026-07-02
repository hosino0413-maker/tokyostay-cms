import { NextRequest, NextResponse } from "next/server";
import COS from "cos-nodejs-sdk-v5";

export const runtime = "nodejs";

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > -1 ? name.slice(0, dot) : name).replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-|-$/g, "");
  const ext = dot > -1 ? name.slice(dot).toLowerCase() : "";
  return `${base || "asset"}-${Date.now()}${ext}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const propertyId = String(formData.get("propertyId") || "general");
  const kind = String(formData.get("kind") || "image") === "video" ? "videos" : "images";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const fileName = safeName(file.name);
  const bucket = process.env.TENCENT_COS_BUCKET;
  const region = process.env.TENCENT_COS_REGION;
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const cosDomain = process.env.TENCENT_COS_DOMAIN || (bucket && region ? `https://${bucket}.cos.${region}.myqcloud.com` : "https://img.tokyostay.asia");
  const key = `${kind}/${propertyId}/${fileName}`;

  if (bucket && region && secretId && secretKey) {
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
      url: `${cosDomain.replace(/\/$/, "")}/${key}`
    });
  }

  // Development fallback. This does not upload the file. It only returns the
  // URL shape used by production so the editor workflow can be tested locally.
  return NextResponse.json({
    ok: true,
    provider: "mock",
    key,
    fileName,
    url: `${cosDomain.replace(/\/$/, "")}/${key}`
  });
}
