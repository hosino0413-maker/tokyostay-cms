import fs from "node:fs/promises";
import path from "node:path";
import COS from "cos-nodejs-sdk-v5";

const root = process.cwd();
const sourceDir = path.join(root, "work", "deploy");

try {
  const envText = await fs.readFile(path.join(root, ".env.local"), "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local is optional; real deployment environments usually inject env vars.
}

const bucket = process.env.TENCENT_DEPLOY_COS_BUCKET || "tokyostay-1445455726";
const region = process.env.TENCENT_DEPLOY_COS_REGION || "ap-hongkong";
const secretId = process.env.TENCENT_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY;
const keyPrefix = (process.env.TENCENT_DEPLOY_PREFIX || "deploy").replace(/^\/+|\/+$/g, "");

if (!secretId || !secretKey) {
  console.error("Missing TENCENT_SECRET_ID or TENCENT_SECRET_KEY.");
  console.error("Fill them in .env.local or set them in the current shell before running this script.");
  process.exit(1);
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function keyFor(file) {
  const relative = path.relative(sourceDir, file).replaceAll(path.sep, "/");
  return keyPrefix ? `${keyPrefix}/${relative}` : relative;
}

function putObject(cos, file) {
  const key = keyFor(file);
  return fs.readFile(file).then((body) => new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: body,
        ContentLength: body.length,
        ContentType: contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream"
      },
      (err, data) => err ? reject(err) : resolve({ key, data })
    );
  }));
}

const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
const files = await walk(sourceDir);

for (const file of files) {
  const { key } = await putObject(cos, file);
  console.log(`Uploaded ${key}`);
}

console.log(`Done. Static website: https://${bucket}.cos-website.${region}.myqcloud.com`);
