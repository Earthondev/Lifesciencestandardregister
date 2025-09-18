# คู่มือการ Deploy Google Apps Script

## ขั้นตอนการ Deploy Google Apps Script ใหม่

### 1. เปิด Google Apps Script
1. ไปที่ [script.google.com](https://script.google.com)
2. เข้าสู่ระบบด้วย Google account ของคุณ
3. เปิดโปรเจค Life Science Standards

### 2. อัปเดตโค้ด
1. ลบโค้ดเดิมทั้งหมด
2. คัดลอกโค้ดจากไฟล์ `GoogleAppsScript_Complete.gs`
3. วางโค้ดใหม่ลงในไฟล์ `Code.gs`
4. บันทึกไฟล์ (Ctrl+S หรือ Cmd+S)

### 3. ตั้งค่า CONFIG
1. ตรวจสอบว่า CONFIG ถูกต้อง:
```javascript
const CONFIG = {
  SHEET_ID: 'your_google_sheets_id_here',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/your_sheet_id/edit'
};
```

### 4. Deploy เป็น Web App
1. คลิก "Deploy" > "New deployment"
2. เลือก "Web app" จากรายการ
3. ตั้งค่าดังนี้:
   - **Type**: Web app
   - **Description**: Life Science Standards API v1.0.0
   - **Execute as**: Me
   - **Who has access**: Anyone
4. คลิก "Deploy"

### 5. อนุญาตสิทธิ์
1. คลิก "Review permissions"
2. เลือก Google account ของคุณ
3. คลิก "Advanced" > "Go to Life Science Standards (unsafe)"
4. คลิก "Allow"

### 6. คัดลอก Web App URL
1. คัดลอก URL ที่ได้จากหน้า Deploy
2. URL จะมีรูปแบบ: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

### 7. อัปเดต Environment Variables
1. เปิดไฟล์ `.env.local`
2. อัปเดต URL:
```env
NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_google_sheets_id
```

### 8. รีสตาร์ท Development Server
```bash
npm run dev
```

## การทดสอบ

### 1. ใช้ไฟล์ test-cors.html
1. เปิดไฟล์ `test-cors.html` ในเบราว์เซอร์
2. ทดสอบการเชื่อมต่อ
3. ทดสอบการล็อกอิน
4. ตรวจสอบ CORS headers

### 2. ทดสอบในเว็บไซต์
1. ไปที่หน้า Login
2. ล็อกอินด้วย:
   - Email: `admin@lifescience.com`
   - Password: `hello`

## การแก้ไขปัญหา

### 1. CORS Error ยังคงมี
- ตรวจสอบว่า `doOptions()` function ถูกเพิ่มแล้ว
- ตรวจสอบว่า CORS headers ถูกตั้งค่าแล้ว
- ลองใช้ incognito mode

### 2. Authentication ไม่ทำงาน
- ตรวจสอบข้อมูลในตาราง Users
- ตรวจสอบรหัสผ่าน
- ตรวจสอบว่า user is_active = true

### 3. Google Sheets ไม่เชื่อมต่อ
- ตรวจสอบ SHEET_ID
- ตรวจสอบสิทธิ์การเข้าถึง Google Sheets
- ตรวจสอบว่า Apps Script API เปิดใช้งานแล้ว

## CORS Headers ที่จำเป็น

### ในฟังก์ชัน createResponse()
```javascript
.setHeaders({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '3600'
});
```

### ในฟังก์ชัน doOptions()
```javascript
.setHeaders({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '3600'
});
```

## การอัปเดตในอนาคต

### 1. อัปเดตโค้ด
1. แก้ไขโค้ดใน Google Apps Script
2. บันทึกไฟล์
3. Deploy ใหม่ (เลือก "New deployment" หรือ "Manage deployments")

### 2. อัปเดต Version
1. เปลี่ยน Description เป็น version ใหม่
2. Deploy ใหม่
3. อัปเดต URL ใน .env.local

## หมายเหตุ

- **Execute as**: Me - Apps Script จะรันด้วยสิทธิ์ของคุณ
- **Who has access**: Anyone - ทุกคนสามารถเข้าถึง Web App ได้
- **CORS**: ต้องตั้งค่า CORS headers เพื่อให้เว็บไซต์เรียกใช้ได้
- **Permissions**: ต้องอนุญาตสิทธิ์การเข้าถึง Google Sheets

---

**หลังจาก Deploy สำเร็จ**: ระบบล็อกอินควรทำงานได้ปกติโดยไม่มี CORS error
