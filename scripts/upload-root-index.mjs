import fs from "node:fs/promises";
import path from "node:path";
import COS from "cos-nodejs-sdk-v5";

const root = process.cwd();

try {
  const envText = await fs.readFile(path.join(root, ".env.local"), "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {}

const bucket = process.env.TENCENT_DEPLOY_COS_BUCKET || "tokyostay-1445455726";
const region = process.env.TENCENT_DEPLOY_COS_REGION || "ap-hongkong";
const file = path.join(root, "work", "root-index", "index.html");
const body = await fs.readFile(file);
const cos = new COS({ SecretId: process.env.TENCENT_SECRET_ID, SecretKey: process.env.TENCENT_SECRET_KEY });

await new Promise((resolve, reject) => {
  cos.putObject(
    {
      Bucket: bucket,
      Region: region,
      Key: "index.html",
      Body: body,
      ContentLength: body.length,
      ContentType: "text/html; charset=utf-8"
    },
    (err, data) => err ? reject(err) : resolve(data)
  );
});

console.log("Uploaded root index.html");
