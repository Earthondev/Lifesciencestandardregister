# 🔒 คำแนะนำการ Deploy แบบส่วนตัวและปลอดภัย

## 🚨 ความสำคัญของความเป็นส่วนตัว

สำหรับโปรเจค **Life Science Standards Register** ที่มีข้อมูลภายในองค์กร ควรใช้การ deploy แบบส่วนตัวเพื่อป้องกันการรั่วไหลของข้อมูล

## 🏢 ตัวเลือกการ Deploy แบบส่วนตัว

### 1. **Private GitHub Repository** (แนะนำ)
- ✅ Repository เป็น private
- ✅ ควบคุมการเข้าถึงได้
- ✅ ไม่เปิดเผยข้อมูลต่อสาธารณะ
- ✅ ใช้ GitHub Pages หรือ Vercel Private

### 2. **Private Vercel Deployment**
- ✅ Deploy จาก private repository
- ✅ ตั้งค่า password protection
- ✅ ใช้ custom domain
- ✅ ควบคุมการเข้าถึง

### 3. **Private Netlify Deployment**
- ✅ Deploy จาก private repository
- ✅ ตั้งค่า password protection
- ✅ ใช้ custom domain
- ✅ ควบคุมการเข้าถึง

### 4. **Self-Hosted Solution**
- ✅ Deploy บน server ขององค์กร
- ✅ ควบคุมข้อมูลได้เต็มที่
- ✅ ไม่พึ่งพา third-party

## 🔧 ขั้นตอนการทำให้เป็นส่วนตัว

### ขั้นตอนที่ 1: เปลี่ยน GitHub Repository เป็น Private

#### วิธีที่ 1: ผ่าน GitHub Web Interface
1. ไปที่ https://github.com/Earthondev/Lifesciencestandardregister
2. คลิก "Settings"
3. เลื่อนลงไปหา "Danger Zone"
4. คลิก "Change repository visibility"
5. เลือก "Make private"
6. พิมพ์ชื่อ repository เพื่อยืนยัน
7. คลิก "I understand, change repository visibility"

#### วิธีที่ 2: ผ่าน GitHub CLI
```bash
gh repo edit --visibility private
```

### ขั้นตอนที่ 2: ตั้งค่า Access Control

#### เพิ่ม Collaborators
1. ไปที่ "Settings" > "Manage access"
2. คลิก "Invite a collaborator"
3. เพิ่ม email ของทีมงาน
4. ตั้งค่า permission level:
   - **Read**: ดูได้อย่างเดียว
   - **Write**: แก้ไขได้
   - **Admin**: จัดการได้ทั้งหมด

#### ตั้งค่า Branch Protection
1. ไปที่ "Settings" > "Branches"
2. คลิก "Add rule"
3. ตั้งค่า:
   - Branch name pattern: `main`
   - Require pull request reviews
   - Require status checks
   - Restrict pushes to matching branches

### ขั้นตอนที่ 3: ตั้งค่า Private Deployment

#### สำหรับ Vercel Private
1. ไปที่ https://vercel.com
2. Import จาก private repository
3. ตั้งค่า "Password Protection"
4. ใช้ custom domain
5. ตั้งค่า environment variables

#### สำหรับ Netlify Private
1. ไปที่ https://netlify.com
2. Import จาก private repository
3. ตั้งค่า "Password Protection"
4. ใช้ custom domain
5. ตั้งค่า environment variables

## 🛡️ การรักษาความปลอดภัย

### 1. Environment Variables
```bash
# ตั้งค่าใน deployment platform
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_PRIVATE=true
```

### 2. Google Apps Script Security
- ตั้งค่า Google Apps Script เป็น private
- ใช้ service account authentication
- ตั้งค่า IP whitelist
- ใช้ API key authentication

### 3. Database Security
- ใช้ private Google Sheets
- ตั้งค่า sharing permissions
- ใช้ service account
- ตั้งค่า audit logs

### 4. Network Security
- ใช้ HTTPS only
- ตั้งค่า CORS properly
- ใช้ rate limiting
- ตั้งค่า firewall rules

## 🔐 การตั้งค่า Authentication

### 1. User Authentication
- ใช้ Google OAuth
- ตั้งค่า domain whitelist
- ใช้ role-based access control
- ตั้งค่า session timeout

### 2. API Security
- ใช้ JWT tokens
- ตั้งค่า API rate limiting
- ใช้ request validation
- ตั้งค่า logging

## 📱 การ Deploy แบบส่วนตัว

### วิธีที่ 1: Private Vercel
```bash
# ตั้งค่า Vercel
vercel login
vercel --prod

# ตั้งค่า password protection
# ไปที่ Vercel Dashboard > Project Settings > Security
# เปิด "Password Protection"
```

### วิธีที่ 2: Private Netlify
```bash
# ตั้งค่า Netlify
netlify login
netlify deploy --prod --dir=out

# ตั้งค่า password protection
# ไปที่ Netlify Dashboard > Site Settings > Access Control
# เปิด "Password Protection"
```

### วิธีที่ 3: Self-Hosted
```bash
# Build สำหรับ production
npm run build

# Deploy บน server ขององค์กร
# ใช้ nginx, apache, หรือ docker
```

## 🎯 คำแนะนำสำหรับองค์กร

### 1. การจัดการข้อมูล
- ใช้ private Google Sheets
- ตั้งค่า sharing permissions
- ใช้ service account
- ตั้งค่า audit logs

### 2. การควบคุมการเข้าถึง
- ใช้ Google OAuth
- ตั้งค่า domain whitelist
- ใช้ role-based access control
- ตั้งค่า session timeout

### 3. การรักษาความปลอดภัย
- ใช้ HTTPS only
- ตั้งค่า CORS properly
- ใช้ rate limiting
- ตั้งค่า firewall rules

## 🚨 ข้อควรระวัง

### 1. ข้อมูลที่ต้องปกป้อง
- ข้อมูลสารมาตรฐาน
- ข้อมูลผู้ใช้
- ข้อมูลการใช้งาน
- ข้อมูลการตั้งค่า

### 2. การรั่วไหลของข้อมูล
- ตรวจสอบ permissions
- ตั้งค่า audit logs
- ใช้ monitoring
- ตั้งค่า alerts

### 3. การเข้าถึงที่ไม่ได้รับอนุญาต
- ใช้ strong passwords
- ตั้งค่า 2FA
- ใช้ IP whitelist
- ตั้งค่า session timeout

## 🎉 สรุป

การ deploy แบบส่วนตัวจะช่วย:
- ✅ ป้องกันการรั่วไหลของข้อมูล
- ✅ ควบคุมการเข้าถึงได้
- ✅ รักษาความปลอดภัยของข้อมูล
- ✅ ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต

**แนะนำให้ใช้ Private GitHub Repository + Private Vercel/Netlify + Password Protection**
