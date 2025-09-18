# คู่มือการตั้งค่า Environment Variables

## ไฟล์ Environment Variables ที่จำเป็น

### 1. สร้างไฟล์ .env.local
```bash
cp .env.example .env.local
```

### 2. แก้ไขค่าใน .env.local
```env
# Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_google_sheets_id_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Life Science Standard Register
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## การหาค่า Google Sheets

### 1. Google Sheets ID
- เปิด Google Sheets ของคุณ
- คัดลอก ID จาก URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

### 2. Google Apps Script URL
- เปิด Google Apps Script
- Deploy เป็น Web App
- คัดลอก URL ที่ได้

## การตั้งค่าสำหรับ Production

### 1. Vercel
- ไปที่ Project Settings > Environment Variables
- เพิ่มตัวแปรทั้งหมด

### 2. Netlify
- ไปที่ Site Settings > Environment Variables
- เพิ่มตัวแปรทั้งหมด

## การตรวจสอบการตั้งค่า

### 1. ตรวจสอบใน Browser Console
```javascript
console.log(process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL)
console.log(process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID)
```

### 2. ตรวจสอบใน Code
```typescript
// ในไฟล์ lib/googleSheets.ts
const GOOGLE_SHEETS_CONFIG = {
  SHEET_URL: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || '',
  SHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || ''
}
```

## การแก้ไขปัญหา

### 1. Environment Variables ไม่โหลด
- ตรวจสอบชื่อไฟล์: `.env.local` (ไม่ใช่ `.env`)
- รีสตาร์ท development server
- ตรวจสอบชื่อตัวแปร (ต้องขึ้นต้นด้วย `NEXT_PUBLIC_`)

### 2. Google Sheets ไม่เชื่อมต่อ
- ตรวจสอบ URL และ ID
- ตรวจสอบว่า Google Apps Script deploy แล้ว
- ตรวจสอบสิทธิ์การเข้าถึง Google Sheets

### 3. CORS Error
- ตรวจสอบการตั้งค่า CORS ใน Google Apps Script
- ตรวจสอบว่า Web App deploy เป็น "Anyone" access

---

**หมายเหตุ**: ไฟล์ `.env.local` จะไม่ถูก commit เข้า Git เพื่อความปลอดภัย
