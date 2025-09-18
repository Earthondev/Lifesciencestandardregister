# คู่มือแก้ไขปัญหา CORS

## ปัญหาที่พบ
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'http://localhost:3001' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## สาเหตุ
- Google Apps Script ไม่ได้ตั้งค่า CORS headers อย่างถูกต้อง
- ไม่มีฟังก์ชัน `doOptions()` สำหรับจัดการ preflight requests
- การตั้งค่า CORS headers ไม่ครบถ้วน

## วิธีแก้ไข

### 1. อัปเดต Google Apps Script

#### ก. เพิ่มฟังก์ชัน doOptions()
```javascript
function doOptions(e) {
  // Handle CORS preflight requests
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600'
    });
}
```

#### ข. อัปเดตฟังก์ชัน createResponse()
```javascript
function createResponse(success, data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600'
    });
}
```

### 2. อัปเดต Google Sheets Client

#### ก. เพิ่ม CORS headers
```typescript
const options: RequestInit = {
  method: data ? 'POST' : 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  mode: 'cors',
  credentials: 'omit',
}
```

### 3. Deploy Google Apps Script ใหม่

#### ก. เปิด Google Apps Script
1. ไปที่ [script.google.com](https://script.google.com)
2. เปิดโปรเจคของคุณ

#### ข. อัปเดตโค้ด
1. แทนที่โค้ดเดิมด้วย `GoogleAppsScript_Complete.gs` ที่อัปเดตแล้ว
2. บันทึกไฟล์ (Ctrl+S)

#### ค. Deploy ใหม่
1. คลิก "Deploy" > "New deployment"
2. เลือก "Web app"
3. ตั้งค่า:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. คลิก "Deploy"
5. คัดลอก Web App URL ใหม่

### 4. อัปเดต Environment Variables

#### ก. อัปเดต .env.local
```env
NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_google_sheets_id
```

#### ข. รีสตาร์ท Development Server
```bash
npm run dev
```

## การทดสอบ

### 1. ตรวจสอบ CORS Headers
เปิด Developer Tools > Network tab และดูว่า:
- มี `Access-Control-Allow-Origin: *` ใน response headers
- มี `Access-Control-Allow-Methods` ใน response headers
- มี `Access-Control-Allow-Headers` ใน response headers

### 2. ทดสอบการล็อกอิน
1. ไปที่หน้า Login
2. กรอกอีเมลและรหัสผ่าน
3. ตรวจสอบว่าไม่มี CORS error

## การแก้ไขปัญหาเพิ่มเติม

### 1. ถ้ายังมี CORS Error
- ตรวจสอบว่า Google Apps Script deploy แล้ว
- ตรวจสอบว่า URL ใน .env.local ถูกต้อง
- ลองใช้ incognito mode

### 2. ถ้า Google Apps Script ไม่ทำงาน
- ตรวจสอบว่า Apps Script API เปิดใช้งานแล้ว
- ตรวจสอบสิทธิ์การเข้าถึง Google Sheets
- ตรวจสอบว่า SHEET_ID ถูกต้อง

### 3. ถ้า Authentication ไม่ทำงาน
- ตรวจสอบข้อมูลในตาราง Users
- ตรวจสอบรหัสผ่าน
- ตรวจสอบว่า user is_active = true

## CORS Headers ที่จำเป็น

### Preflight Request (OPTIONS)
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 3600
```

### Actual Request (GET/POST)
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 3600
```

## หมายเหตุ

- `Access-Control-Allow-Origin: *` อนุญาตให้ทุก domain เข้าถึงได้
- สำหรับ production ควรระบุ domain ที่เฉพาะเจาะจง
- `Access-Control-Max-Age: 3600` บอกเบราว์เซอร์ให้ cache preflight response เป็น 1 ชั่วโมง

---

**หลังจากแก้ไขแล้ว**: ระบบล็อกอินควรทำงานได้ปกติโดยไม่มี CORS error
