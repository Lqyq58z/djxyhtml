# 罗世璨生日照片墙部署说明

## 1. Supabase

1. 新建 Supabase 项目。
2. 打开 `SQL Editor`，运行 `supabase/schema.sql` 的全部内容。
3. 到 `Project Settings > API` 复制：
   - `Project URL`
   - `anon public key`

SQL 会创建：

- `birthday_photos`：照片墙和中心照片记录
- `birthday_notes`：碎碎念记录
- `birthday-photos`：公开 Storage bucket

## 2. Vercel

1. 把本项目上传到 GitHub。
2. 在 Vercel 新建项目并导入仓库。
3. Framework Preset 选择 `Vite`。
4. 添加环境变量：

```bash
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon public key
VITE_SUPABASE_BUCKET=birthday-photos
VITE_WALL_ID=lsc-birthday-wall
```

5. 部署。

## 3. 本地预览

```bash
npm install
cp .env.example .env
npm run dev
```

如果 `.env` 没填 Supabase，页面仍能本地预览，但照片和碎碎念只保存在当前浏览器里。

## 4. 注意

这个网站本身有密码入口，但前端密码不能当作真正的安全边界。当前 Supabase SQL 为了让生日网页免登录可用，开放了公开读写策略。适合私密链接分享，不适合公开传播到陌生人环境。
