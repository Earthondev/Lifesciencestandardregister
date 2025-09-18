# คู่มือการตั้งค่า Git และ Push ขึ้น GitHub

## ขั้นตอนการตั้งค่า Git

### 1. แก้ไขปัญหา Xcode License (ถ้ามี)
```bash
sudo xcodebuild -license
```
กด Enter จนกว่าจะถึงข้อความ "agree" แล้วพิมพ์ `agree`

### 2. ตั้งค่า Git (ถ้ายังไม่ได้ตั้งค่า)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. สร้าง Git Repository
```bash
cd "/Users/earthondev/Desktop/Life science standard register"
git init
```

### 4. เพิ่มไฟล์ทั้งหมด
```bash
git add .
```

### 5. สร้าง Commit แรก
```bash
git commit -m "Initial commit: Life Science Standard Register v1.0.0

- Complete dashboard with statistics and charts
- Advanced search and filtering system
- Multi-theme support (Light, Dark, Orange, Blue, Green)
- User authentication with Google Sheets integration
- Admin user management system
- Responsive design for all devices
- Google Apps Script backend integration
- TypeScript implementation with Next.js 14"
```

## สร้าง GitHub Repository

### 1. ไปที่ GitHub.com
- เข้าสู่ระบบ GitHub account ของคุณ
- คลิก "New repository" หรือ "+" > "New repository"

### 2. ตั้งค่า Repository
- **Repository name**: `life-science-standard-register`
- **Description**: `Life Science Standard Register - Web App with Google Sheets Integration`
- **Visibility**: Public หรือ Private (ตามต้องการ)
- **Initialize**: ❌ ไม่ต้องเลือก Initialize with README (เพราะเรามีแล้ว)

### 3. สร้าง Repository
- คลิก "Create repository"

## Push โค้ดขึ้น GitHub

### 1. เพิ่ม Remote Origin
```bash
git remote add origin https://github.com/YOUR_USERNAME/life-science-standard-register.git
```
(แทนที่ YOUR_USERNAME ด้วย username ของคุณ)

### 2. Push ขึ้น GitHub
```bash
git branch -M main
git push -u origin main
```

### 3. ตั้งค่า Branch Protection (แนะนำ)
- ไปที่ Settings > Branches
- เพิ่ม Branch protection rule สำหรับ `main` branch

## การอัปเดตโค้ดในอนาคต

### 1. ตรวจสอบสถานะ
```bash
git status
```

### 2. เพิ่มไฟล์ที่เปลี่ยนแปลง
```bash
git add .
# หรือ
git add specific-file.ts
```

### 3. สร้าง Commit
```bash
git commit -m "Description of changes"
```

### 4. Push ขึ้น GitHub
```bash
git push origin main
```

## การสร้าง Tags สำหรับ Version

### 1. สร้าง Tag สำหรับ Version 1.0.0
```bash
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial stable release"
```

### 2. Push Tags
```bash
git push origin v1.0.0
```

## การสร้าง Release บน GitHub

### 1. ไปที่ GitHub Repository
- คลิก "Releases" > "Create a new release"

### 2. ตั้งค่า Release
- **Tag version**: `v1.0.0`
- **Release title**: `Life Science Standard Register v1.0.0`
- **Description**: คัดลอกจาก CHANGELOG.md

### 3. สร้าง Release
- คลิก "Publish release"

## การ Clone Repository (สำหรับคนอื่น)

```bash
git clone https://github.com/YOUR_USERNAME/life-science-standard-register.git
cd life-science-standard-register
npm install
npm run dev
```

## การ Fork และ Contribute

### 1. Fork Repository
- คลิก "Fork" บน GitHub
- Clone fork ของคุณ
- สร้าง feature branch
- ทำการเปลี่ยนแปลง
- สร้าง Pull Request

## การตั้งค่า CI/CD (แนะนำ)

### 1. สร้างไฟล์ GitHub Actions
สร้างไฟล์ `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Build project
      run: npm run build
```

## การตั้งค่า Environment Variables

### 1. สร้างไฟล์ .env.example
```env
NEXT_PUBLIC_GOOGLE_SHEETS_URL=your_google_apps_script_web_app_url
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_google_sheets_id
```

### 2. สำหรับ Production
- ไปที่ GitHub Settings > Secrets and variables > Actions
- เพิ่ม Repository secrets

## การ Deploy

### 1. Vercel (แนะนำ)
- เชื่อมต่อ GitHub repository
- ตั้งค่า Environment variables
- Deploy อัตโนมัติ

### 2. Netlify
- เชื่อมต่อ GitHub repository
- ตั้งค่า Build command: `npm run build`
- ตั้งค่า Publish directory: `.next`

## การจัดการ Issues และ Projects

### 1. สร้าง Issue Templates
สร้างไฟล์ `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome, Safari, Firefox]
 - Version: [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

## การตั้งค่า Code Quality

### 1. Pre-commit Hooks
```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### 2. สร้างไฟล์ .lintstagedrc.json
```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

---

**หมายเหตุ**: คู่มือนี้ครอบคลุมการตั้งค่า Git และ GitHub สำหรับโปรเจค Life Science Standard Register โดยสมบูรณ์
