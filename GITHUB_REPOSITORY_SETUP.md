# คู่มือการสร้าง GitHub Repository

## ขั้นตอนการสร้าง Repository บน GitHub

### 1. เข้าสู่ระบบ GitHub
- ไปที่ [GitHub.com](https://github.com)
- เข้าสู่ระบบด้วย GitHub account ของคุณ

### 2. สร้าง Repository ใหม่
- คลิกปุ่ม **"New"** หรือ **"+"** > **"New repository"**
- หรือไปที่ [github.com/new](https://github.com/new)

### 3. ตั้งค่า Repository

#### Repository Details:
- **Repository name**: `life-science-standard-register`
- **Description**: `Life Science Standard Register - Web App with Google Sheets Integration`
- **Visibility**: 
  - ✅ **Public** (ทุกคนเห็นได้)
  - ❌ **Private** (เฉพาะคุณเห็น)

#### Initialize Repository:
- ❌ **Add a README file** (เรามีแล้ว)
- ❌ **Add .gitignore** (เรามีแล้ว)
- ❌ **Choose a license** (เรามีแล้ว)

### 4. สร้าง Repository
- คลิกปุ่ม **"Create repository"**

## ข้อมูล Repository ที่แนะนำ

### Repository Name
```
life-science-standard-register
```

### Description
```
Life Science Standard Register - Web App with Google Sheets Integration
```

### Topics/Tags (เพิ่มหลังสร้าง)
- `nextjs`
- `react`
- `typescript`
- `google-sheets`
- `laboratory-management`
- `chemical-standards`
- `dashboard`
- `authentication`

## หลังจากสร้าง Repository แล้ว

### 1. คัดลอก Repository URL
```
https://github.com/YOUR_USERNAME/life-science-standard-register.git
```

### 2. เพิ่ม Remote Origin (ใน Terminal)
```bash
cd "/Users/earthondev/Desktop/Life science standard register"
git remote add origin https://github.com/YOUR_USERNAME/life-science-standard-register.git
```

### 3. Push โค้ดขึ้น GitHub
```bash
git branch -M main
git push -u origin main
```

### 4. Push Tags
```bash
git push origin v1.0.0
```

## การตั้งค่า Repository เพิ่มเติม

### 1. เพิ่ม Topics/Tags
- ไปที่ Repository Settings
- คลิก "Topics"
- เพิ่ม tags: `nextjs`, `react`, `typescript`, `google-sheets`, `laboratory-management`

### 2. ตั้งค่า Branch Protection
- ไปที่ Settings > Branches
- คลิก "Add rule"
- Branch name pattern: `main`
- ✅ Require pull request reviews
- ✅ Require status checks

### 3. ตั้งค่า Issues และ Projects
- ไปที่ Settings > Features
- ✅ Issues
- ✅ Projects
- ✅ Wiki (ถ้าต้องการ)

### 4. ตั้งค่า Pages (ถ้าต้องการ)
- ไปที่ Settings > Pages
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)

## การสร้าง Release

### 1. ไปที่ Releases
- คลิก "Releases" ใน Repository
- คลิก "Create a new release"

### 2. ตั้งค่า Release
- **Tag version**: `v1.0.0`
- **Release title**: `Life Science Standard Register v1.0.0`
- **Description**: คัดลอกจาก CHANGELOG.md

### 3. สร้าง Release
- คลิก "Publish release"

## การตั้งค่า CI/CD

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

## การ Deploy

### 1. Vercel (แนะนำ)
- ไปที่ [Vercel.com](https://vercel.com)
- เชื่อมต่อ GitHub account
- Import repository
- ตั้งค่า Environment Variables
- Deploy

### 2. Netlify
- ไปที่ [Netlify.com](https://netlify.com)
- เชื่อมต่อ GitHub account
- Import repository
- ตั้งค่า Build command: `npm run build`
- ตั้งค่า Publish directory: `.next`
- Deploy

## การจัดการ Issues

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

## การตั้งค่า Security

### 1. Dependency Scanning
- ไปที่ Security tab
- คลิก "Enable Dependabot alerts"

### 2. Code Scanning
- ไปที่ Security tab
- คลิก "Set up code scanning"
- เลือก "CodeQL Analysis"

---

**หมายเหตุ**: คู่มือนี้ครอบคลุมการตั้งค่า GitHub Repository สำหรับโปรเจค Life Science Standard Register โดยสมบูรณ์
