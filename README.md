# TokyoStay 房源展示 CMS

TokyoStay CMS 是一个基于 Next.js + TypeScript + Tailwind CSS 的轻量房源展示与后台发布系统。目标工作流是：后台新增房源，拖拽上传图片/视频，AI 生成三语言介绍，设置不可入住日期和地图，点击发布到网站，然后把房源展示链接放到 TokyoStay 落地页按钮中。

## 本地运行

```bash
npm install
npm run dev
```

本地地址：

- 前台房源列表：http://localhost:3000
- 后台编辑器：http://localhost:3000/admin

构建测试：

```bash
npm run build
```

## 已实现内容

- 前台房源列表、三图拼图房源卡片、区域/人数/关键词筛选。
- 房源详情页：大图轮播、小图预览、房源介绍、设施标签、不可入住日历、视频、地图、私密咨询表单。
- 前台不公开联系方式。
- 后台三栏 CMS：左侧房源列表，中间编辑区，右侧实时预览。
- 新增、删除、复制房源，修改标题、区域、价格备注、房型、人数、面积、交通、介绍、设施、地图、视频、不可入住日期和上下架状态。
- 拖拽调整房源排序，拖拽调整图片排序，设置封面图。
- 图片和 MP4 视频拖拽上传到腾讯 COS。
- AI 生成介绍接口 `/api/ai`，没有 `OPENAI_API_KEY` 时返回模拟三语言结果。
- 一键发布接口 `/api/publish`，生成并上传静态房源列表页和详情页到 COS。
- 咨询接口 `/api/inquiry` 与浏览统计接口 `/api/analytics` 已预留，后续可接数据库和分销系统。

## 环境变量

复制 `.env.example` 为 `.env.local`，并填写：

```bash
TENCENT_SECRET_ID=
TENCENT_SECRET_KEY=
TENCENT_COS_BUCKET=
TENCENT_COS_REGION=
TENCENT_COS_DOMAIN=https://img.tokyostay.asia

TENCENT_DEPLOY_COS_BUCKET=tokyostay-1445455726
TENCENT_DEPLOY_COS_REGION=ap-hongkong

OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=https://tokyostay.asia
NEXT_PUBLIC_CMS_API_URL=https://tokyostay-cms-gshaiql6.edgeone.cool
```

说明：

- `TENCENT_SECRET_ID` 和 `TENCENT_SECRET_KEY` 只在后端 API 中使用，不能写到前端页面。
- `TENCENT_COS_BUCKET` 用于图片和视频上传。
- `TENCENT_DEPLOY_COS_BUCKET` 用于发布静态展示页。
- `TENCENT_COS_DOMAIN` 建议配置为 COS/CDN 图片域名，例如 `https://img.tokyostay.asia`。
- `NEXT_PUBLIC_SITE_URL` 是发布后返回给你的房源展示域名。
- `NEXT_PUBLIC_CMS_API_URL` 用于静态 COS 页面提交咨询表单到在线后台 API。

## 新增房源和发布

1. 打开 `/admin`。
2. 点击“新增房源”。
3. 填写中文、英文、日文标题与介绍。
4. 拖拽上传图片和 MP4 视频。
5. 设置封面图，并拖拽调整图片顺序。
6. 设置不可入住日期。
7. 选择 Google Map / 高德地图 / 图片地图。
8. 点击“AI生成介绍”补充三语言内容。
9. 点击“发布到网站”。
10. 复制返回的房源详情链接，放到 TokyoStay 落地页按钮中。

## 腾讯 COS 和视频播放

图片建议上传到：

```text
images/{propertyId}/文件名
```

视频建议上传到：

```text
videos/{propertyId}/文件名
```

如果希望中国大陆访问图片和视频更稳定，建议图片/视频走腾讯 COS + CDN/EdgeOne，并确认：

- Bucket 所在区域适合目标访问人群。
- Bucket 或 CDN 允许公开读取对应静态资源。
- 视频使用 MP4/H.264 等主流浏览器兼容格式。
- 如需中国大陆加速或绑定特定子域名，需按腾讯云规则处理备案。

## 部署建议

- Next.js 后台：部署到 Tencent EdgeOne Pages 或支持 Next.js API Routes 的服务。
- 静态展示页：由 `/api/publish` 上传到 COS，可通过已绑定的 `tokyostay.asia/deploy/...` 访问。
- 图片/视频：COS + CDN/EdgeOne。
- 域名建议：
  - 落地页和房源展示：`tokyostay.asia`
  - 后台：EdgeOne 默认域名，或备案后使用 `admin.tokyostay.asia`
  - 图片/视频：`img.tokyostay.asia`

## 后续待完成

- 后台登录权限和管理员管理。
- 数据库化保存房源、咨询、统计和收藏。
- 分销系统：分销员专属链接、客户归属、权限隔离和总后台统计。
- PDF 导出。
- AI 图片识别、翻译检查和标签推荐增强。
