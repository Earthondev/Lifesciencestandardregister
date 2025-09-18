# 🚀 Deploy โปรเจคผ่าน Git

## 🎯 ตัวเลือกการ Deploy

### 1. **Vercel** (แนะนำสำหรับ Next.js)
- ✅ ง่ายที่สุดสำหรับ Next.js
- ✅ Auto-deploy จาก GitHub
- ✅ ฟรีสำหรับโปรเจคส่วนตัว
- ✅ Custom domain รองรับ

### 2. **Netlify**
- ✅ ง่ายและเร็ว
- ✅ Auto-deploy จาก GitHub
- ✅ ฟรีสำหรับโปรเจคส่วนตัว
- ✅ Form handling

### 3. **GitHub Pages**
- ✅ ฟรี 100%
- ✅ ใช้กับ GitHub repository
- ✅ Custom domain รองรับ

### 4. **Railway**
- ✅ ง่ายและเร็ว
- ✅ Auto-deploy จาก GitHub
- ✅ Database รองรับ

## 🚀 วิธี Deploy ด้วย Vercel (แนะนำ)

### ขั้นตอนที่ 1: ไปที่ Vercel
1. ไปที่ https://vercel.com
2. คลิก "Sign up" หรือ "Login"
3. เลือก "Continue with GitHub"

### ขั้นตอนที่ 2: Import Project
1. คลิก "New Project"
2. เลือก "Import Git Repository"
3. เลือก `Earthondev/Lifesciencestandardregister`
4. คลิก "Import"

### ขั้นตอนที่ 3: Configure Project
1. **Project Name**: `life-science-standards-register`
2. **Framework Preset**: `Next.js` (จะ detect อัตโนมัติ)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)

### ขั้นตอนที่ 4: Environment Variables
เพิ่ม environment variables:
```
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### ขั้นตอนที่ 5: Deploy
1. คลิก "Deploy"
2. รอให้ build เสร็จ (ประมาณ 2-3 นาที)
3. ได้ URL สำหรับเว็บไซต์

## 🌐 วิธี Deploy ด้วย Netlify

### ขั้นตอนที่ 1: ไปที่ Netlify
1. ไปที่ https://netlify.com
2. คลิก "Sign up" หรือ "Login"
3. เลือก "Continue with GitHub"

### ขั้นตอนที่ 2: Import Project
1. คลิก "New site from Git"
2. เลือก "GitHub"
3. เลือก `Earthondev/Lifesciencestandardregister`
4. คลิก "Deploy site"

### ขั้นตอนที่ 3: Configure Build
1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Base directory**: `./`

### ขั้นตอนที่ 4: Environment Variables
เพิ่ม environment variables:
```
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 📱 วิธี Deploy ด้วย GitHub Pages

### ขั้นตอนที่ 1: ตั้งค่า GitHub Pages
1. ไปที่ https://github.com/Earthondev/Lifesciencestandardregister
2. คลิก "Settings"
3. เลื่อนลงไปหา "Pages"
4. เลือก "Source": "GitHub Actions"

### ขั้นตอนที่ 2: สร้าง GitHub Actions Workflow
สร้างไฟล์ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

### ขั้นตอนที่ 3: ตั้งค่า Next.js สำหรับ Static Export
เพิ่มใน `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

## 🔧 วิธี Deploy ด้วย Railway

### ขั้นตอนที่ 1: ไปที่ Railway
1. ไปที่ https://railway.app
2. คลิก "Sign up" หรือ "Login"
3. เลือก "Continue with GitHub"

### ขั้นตอนที่ 2: Create Project
1. คลิก "New Project"
2. เลือก "Deploy from GitHub repo"
3. เลือก `Earthondev/Lifesciencestandardregister`

### ขั้นตอนที่ 3: Configure
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Port**: `3000`

### ขั้นตอนที่ 4: Environment Variables
เพิ่ม environment variables:
```
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 🎯 คำแนะนำ

### สำหรับโปรเจคนี้แนะนำ:
1. **Vercel** - ง่ายที่สุดสำหรับ Next.js
2. **Netlify** - ทางเลือกที่ดี
3. **Railway** - หากต้องการ database ในอนาคต

### ข้อควรระวัง:
- ต้องตั้งค่า Google Apps Script ให้รองรับ CORS
- ต้องตั้งค่า environment variables
- ต้องทดสอบการทำงานหลัง deploy

## 🚀 ขั้นตอนถัดไป

1. เลือก platform ที่ต้องการ
2. ตั้งค่า environment variables
3. Deploy และทดสอบ
4. ตั้งค่า custom domain (ถ้าต้องการ)
5. ตั้งค่า monitoring และ analytics
