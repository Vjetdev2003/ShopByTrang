# Hướng dẫn Deploy BY TRANG lên Vercel

## ✅ Những gì đã chuẩn bị sẵn

- ✅ Cập nhật `package.json` với scripts cho Prisma
- ✅ Cập nhật `prisma/schema.prisma` sang PostgreSQL
- ✅ Tạo file `.env.production` mẫu

---

## 📝 BƯỚC 1: Setup Vercel Postgres Database

1. Truy cập **Vercel Dashboard**: https://vercel.com/dashboard
2. Chọn tab **"Storage"** ở menu bên trái
3. Click **"Create Database"**
4. Trong danh sách **Marketplace Database Providers**, chọn **"Neon"** (Serverless Postgres)
5. Click **"Create"** bên cạnh Neon
6. Đặt tên database: `shopbytrang-db` (hoặc tên bạn thích)
7. Chọn region gần Việt Nam: **Singapore** hoặc **Asia Pacific**
8. Click **"Create"**

### Lấy Connection String

Sau khi database tạo xong:
1. Vào tab **".env.local"**
2. Copy giá trị của `POSTGRES_URL` (có dạng `postgres://...`)
3. Lưu lại, sẽ dùng ở bước sau

---

## 📝 BƯỚC 2: Push Code lên GitHub

```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Ready for Vercel deployment"

# Tạo repo mới trên GitHub, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/shopbytrang.git
git branch -M main
git push -u origin main
```

---

## 📝 BƯỚC 3: Deploy lên Vercel

1. Vào **Vercel Dashboard** → Click **"Add New"** → **"Project"**
2. **Import** repository GitHub của bạn
3. **QUAN TRỌNG**: Trước khi click Deploy, cấu hình Environment Variables

### Thêm Environment Variables

Trong phần **Environment Variables**, thêm các biến sau:

| Key | Value | Ghi chú |
|-----|-------|---------|
| `DATABASE_URL` | `postgres://...` | Connection string từ bước 1 |
| `NEXTAUTH_SECRET` | `5eHFEDkvdrk3+dq8YxarCohl0FKS3vHCf/IqjvFnvMA=` | Secret đã generate (hoặc tạo mới) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Để trống lúc đầu, cập nhật sau khi có domain |

**Lưu ý**: Chỉ cần 3 biến trên là đủ để login/register hoạt động với email/password.

4. Click **"Deploy"** và đợi deployment hoàn tất

---

## 📝 BƯỚC 4: Cập nhật NEXTAUTH_URL

Sau khi deploy xong:

1. Copy URL của app (ví dụ: `https://shopbytrang.vercel.app`)
2. Vào **Project Settings** → **Environment Variables**
3. **Edit** biến `NEXTAUTH_URL` và paste URL vừa copy
4. Click **Save**
5. **Redeploy** app (Deployments tab → Click dấu 3 chấm → Redeploy)

---

## 📝 BƯỚC 5: Chạy Database Migration

### Cách 1: Tự động (Recommended)

Vercel sẽ tự động chạy `prisma migrate deploy` khi build nhờ script `vercel-build` trong `package.json`.

### Cách 2: Thủ công (Nếu cần)

```bash
# Trong local, connect tới production database
DATABASE_URL="paste-connection-string-từ-vercel" npx prisma migrate deploy
```

---

## 📝 BƯỚC 6: Seed Data (Tùy chọn)

Nếu muốn có sản phẩm mẫu:

```bash
# Trong local
DATABASE_URL="paste-connection-string-từ-vercel" npx prisma db seed
```

---

## ✅ Kiểm tra

Truy cập app của bạn:
- `https://your-app.vercel.app/register` - Tạo tài khoản mới
- `https://your-app.vercel.app/login` - Đăng nhập

Nếu đăng ký và đăng nhập thành công → **HOÀN THÀNH!** 🎉

---

## 🔧 (Optional) Cấu hình Google OAuth

Nếu muốn đăng nhập bằng Google:

### 1. Setup Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type**: Web application
5. **Authorized redirect URIs**, thêm:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
6. Copy **Client ID** và **Client Secret**

### 2. Thêm vào Vercel Environment Variables

| Key | Value |
|-----|-------|
| `AUTH_GOOGLE_ID` | Client ID từ Google |
| `AUTH_GOOGLE_SECRET` | Client Secret từ Google |

### 3. Redeploy

Redeploy app để áp dụng thay đổi.

---

## 🐛 Troubleshooting

### Lỗi "Database connection failed"

- Kiểm tra `DATABASE_URL` trong Vercel Environment Variables
- Đảm bảo đã link database với project trong Vercel Storage

### Lỗi "NEXTAUTH_SECRET is not set"

- Kiểm tra đã thêm `NEXTAUTH_SECRET` vào Vercel Environment Variables
- Redeploy sau khi thêm

### Lỗi "Prisma Client not generated"

- Đảm bảo `package.json` có script `postinstall: "prisma generate"`
- Xem build logs trong Vercel để check lỗi

### Login/Register không hoạt động

- Check `NEXTAUTH_URL` đã đúng domain chưa (https://...)
- Xem Function Logs trong Vercel Dashboard để debug

---

## 📞 Hỗ trợ

Nếu gặp lỗi, check:
1. **Vercel Build Logs** - Xem lỗi khi build
2. **Function Logs** - Xem lỗi runtime (API routes)
3. **Browser Console** - Xem lỗi client-side

---

## 🎯 Tóm tắt các file đã thay đổi

- ✅ `package.json` - Thêm scripts cho Prisma
- ✅ `prisma/schema.prisma` - Đổi từ SQLite → PostgreSQL
- ✅ `.env.production` - Template cho production env vars

**Không cần thay đổi code khác!** Backend đã có sẵn, chỉ cần cấu hình database và environment variables.
