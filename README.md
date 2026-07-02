# TokyoStay 房源展示 CMS

这是一个基于 Next.js + TypeScript + Tailwind CSS 的 TokyoStay 房源展示和后台编辑系统。它的目标是做成轻量 CMS：后台编辑房源、上传图片/视频、AI 生成多语言介绍、设置不可入住日期，然后生成前台房源展示页。

## 本地运行

```bash
npm install
npm run dev
```

打开：

- 前台房源列表：`http://localhost:3000`
- 后台编辑器：`http://localhost:3000/admin`

构建：

```bash
npm run build
```

## 现在已经实现的内容

- 前台房源列表、三图拼图、房源详情页
- 图片轮播、缩略图、视频区域、地图区域
- 不可入住日历
- 后台三栏编辑器：左侧房源列表、中间编辑区、右侧实时预览
- 新增、删除、排序、上下架、设施、地图、视频、不可入住日期
- 中文、英文、日文三个语言字段
- `AI 生成介绍` 接口预留；没有 `OPENAI_API_KEY` 时返回模拟内容
- `发布到网站` 接口预留；开发模式下会生成发布链接和 JSON 快照
- COS 上传接口预留；前端不会暴露腾讯云 SecretId / SecretKey

## 重要说明：上传图片和视频到底到哪里？

当前版本的 `/api/upload` 是安全上传接口的预留版本。

如果你没有配置腾讯云 COS，它不会真的把文件上传到互联网。它只会返回一个 COS 风格的模拟 URL，例如：

```text
https://img.tokyostay.asia/images/jingu6/living-room-123.jpg
```

真实运营时，图片和视频应该上传到腾讯云 COS，例如：

```text
images/{propertyId}/文件名
videos/{propertyId}/文件名
```

推荐绑定 CDN 域名：

```text
img.tokyostay.asia
```

中国大陆能否正常查看图片和播放视频，取决于：

- COS Bucket 是否真实存在
- COS 地域是否适合中国大陆访问
- 是否绑定 CDN/EdgeOne 加速域名
- Bucket 或 CDN 是否允许公网读取
- 视频是否使用 MP4/H.264 等浏览器兼容格式

如果图片/视频放在腾讯云 COS + 国内 CDN，一般中国大陆访问会比 YouTube、Google Drive、海外对象存储稳定得多。

## COS 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
TENCENT_SECRET_ID=
TENCENT_SECRET_KEY=
TENCENT_COS_BUCKET=
TENCENT_COS_REGION=
TENCENT_COS_DOMAIN=https://img.tokyostay.asia
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=https://property.tokyostay.asia
```

注意：SecretId / SecretKey 只能在服务端 API 使用，不能写进前端页面。

## 重要说明：点击“发布到网站”会不会真的上互联网？

不会自动神奇上线。

当前 `发布到网站` 做的是：

1. 把当前房源状态改为 `published`
2. 调用 `/api/publish`
3. 根据 `NEXT_PUBLIC_SITE_URL` 和房源 ID 返回一个链接
4. 在开发环境写入 `outputs/{propertyId}.published.json`，方便检查发布数据

也就是说，如果项目还没有部署到 Tencent EdgeOne Pages、云服务器或其他正式环境，点击发布只是在本地生成“将来应该访问的链接”。

真实上线需要先完成：

- 把 Next.js 项目部署到 EdgeOne Pages 或服务器
- 绑定域名，例如 `property.tokyostay.asia`
- 配置 `NEXT_PUBLIC_SITE_URL=https://property.tokyostay.asia`
- 配置 COS 上传和媒体 CDN
- 后续如果需要后台权限，还要增加登录鉴权

## 新增和发布房源流程

1. 打开 `/admin`
2. 点击 `新增房源`
3. 填写中文、英文、日文标题和介绍
4. 拖拽上传图片或 MP4 视频
5. 设置封面图并拖拽调整图片排序
6. 设置不可入住日期段
7. 选择 Google Map / 高德地图 / 图片地图
8. 点击 `AI 生成介绍`
9. 点击 `发布到网站`
10. 复制返回的房源链接

## 建议部署方式

- 前台和后台：Tencent EdgeOne Pages 或腾讯云服务器
- 图片/视频：腾讯云 COS + CDN/EdgeOne
- 域名建议：
  - 前台：`property.tokyostay.asia`
  - 后台：`admin.tokyostay.asia`
  - 图片视频：`img.tokyostay.asia`

如果使用纯静态 COS 托管，需要把 API routes 移到云函数或其他后端服务；否则上传、AI、发布 API 无法运行。
