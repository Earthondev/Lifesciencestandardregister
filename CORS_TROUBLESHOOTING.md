# 🔧 แก้ไขปัญหา CORS Error

## 🚨 ปัญหาปัจจุบัน
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'http://localhost:3001' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 สาเหตุที่เป็นไปได้

### 1. **Google Apps Script ยังไม่ได้ Deploy ใหม่**
- โค้ดที่อัปเดตแล้วยังไม่ได้ Deploy
- ต้อง Deploy ใหม่หลังจากแก้ไขโค้ด

### 2. **Google Apps Script ไม่ได้ตั้งค่าเป็น Web App**
- ต้องตั้งค่าให้เป็น Web App
- ต้องตั้งค่า "Who has access" เป็น "Anyone"

### 3. **URL ไม่ถูกต้อง**
- ตรวจสอบ URL ของ Google Apps Script
- ต้องเป็น URL ของ Web App ไม่ใช่ Editor

## 🔧 วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ Google Apps Script

#### 1. ไปที่ Google Apps Script
- ไปที่ https://script.google.com
- เปิดโปรเจค `Life Science Standards Register`

#### 2. ตรวจสอบโค้ด
- ตรวจสอบว่ามี `doOptions(e)` function
- ตรวจสอบว่ามี CORS headers ใน `createResponse`

#### 3. Deploy ใหม่
1. คลิก "Deploy" > "New deployment"
2. เลือก "Type": "Web app"
3. เลือก "Execute as": "Me"
4. เลือก "Who has access": "Anyone"
5. คลิก "Deploy"
6. คัดลอก URL ที่ได้

### ขั้นตอนที่ 2: อัปเดต Environment Variables

#### 1. ตรวจสอบ URL ในโค้ด
```javascript
// ใน GoogleAppsScript_Complete.gs
const CONFIG = {
  SHEET_ID: '1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM',
  // ... อื่นๆ
};
```

#### 2. อัปเดต Environment Variables ในแอป
```bash
# ในไฟล์ .env.local
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
```

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ

#### 1. ทดสอบด้วย Browser
- เปิด URL ของ Google Apps Script ใน browser
- ควรเห็น response JSON

#### 2. ทดสอบด้วย curl
```bash
curl -X GET "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getStandards"
```

#### 3. ทดสอบด้วย test-cors.html
- เปิดไฟล์ `test-cors.html` ใน browser
- ใส่ URL ของ Google Apps Script
- ทดสอบการเชื่อมต่อ

## 🚀 วิธีแก้ไขแบบเร็ว

### วิธีที่ 1: ใช้ Mock Data ชั่วคราว
```javascript
// ใน lib/googleSheets.ts
// เพิ่มการตรวจสอบ environment
if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL) {
  // ใช้ mock data
  return mockData;
}
```

### วิธีที่ 2: ใช้ ngrok สำหรับ local development
```bash
# ติดตั้ง ngrok
brew install ngrok

# รัน ngrok
ngrok http 3000

# ใช้ URL ที่ได้จาก ngrok แทน localhost
```

### วิธีที่ 3: ใช้ Vercel สำหรับ development
```bash
# Deploy ไปยัง Vercel
vercel --prod

# ใช้ URL ของ Vercel แทน localhost
```

## 🔍 การ Debug

### 1. ตรวจสอบ Network Tab
- เปิด Developer Tools
- ไปที่ Network tab
- ดู request ที่ fail
- ตรวจสอบ response headers

### 2. ตรวจสอบ Console
- ดู error messages
- ตรวจสอบ CORS headers
- ดู preflight request

### 3. ตรวจสอบ Google Apps Script Logs
- ไปที่ Google Apps Script
- ดู Execution transcript
- ตรวจสอบ errors

## 📋 Checklist การแก้ไข

- [ ] Google Apps Script มี `doOptions(e)` function
- [ ] Google Apps Script มี CORS headers ใน `createResponse`
- [ ] Google Apps Script ถูก Deploy เป็น Web App
- [ ] Google Apps Script ตั้งค่า "Who has access" เป็น "Anyone"
- [ ] Environment Variables ถูกต้อง
- [ ] URL ของ Google Apps Script ถูกต้อง
- [ ] ทดสอบการเชื่อมต่อสำเร็จ

## 🎯 ผลลัพธ์ที่คาดหวัง

หลังจากแก้ไขแล้ว:
- ✅ ไม่มี CORS error
- ✅ API calls สำเร็จ
- ✅ ข้อมูลโหลดได้ปกติ
- ✅ การล็อกอินทำงานได้

## 🚨 หากยังมีปัญหา

### 1. ตรวจสอบ Google Apps Script Permissions
- ตรวจสอบว่า Google Sheets มี permissions ที่ถูกต้อง
- ตรวจสอบว่า Apps Script มี access ถึง Sheets

### 2. ตรวจสอบ Network
- ตรวจสอบ firewall
- ตรวจสอบ proxy settings
- ตรวจสอบ DNS

### 3. ใช้ Alternative Solutions
- ใช้ Google Sheets API โดยตรง
- ใช้ Firebase Functions
- ใช้ Vercel API Routes

## 📞 การขอความช่วยเหลือ

หากยังมีปัญหา:
1. ตรวจสอบ Google Apps Script Logs
2. ตรวจสอบ Network Tab ใน Browser
3. ตรวจสอบ Environment Variables
4. ทดสอบด้วย test-cors.html
5. ลองใช้ ngrok หรือ Vercel
