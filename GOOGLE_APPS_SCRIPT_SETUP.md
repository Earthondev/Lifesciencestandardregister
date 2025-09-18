# 🚀 คู่มือการติดตั้ง Google Apps Script

## 📋 ขั้นตอนการติดตั้ง

### 1. เปิด Google Apps Script
- ไปที่: https://script.google.com
- คลิก "New Project"

### 2. คัดลอกโค้ด
- ลบโค้ดเริ่มต้นทั้งหมด
- คัดลอกโค้ดจากไฟล์ `GoogleSheetsAPI.gs` ทั้งหมด
- วางลงใน Apps Script Editor

### 3. ตั้งค่า Google Sheets
- เปิด Google Sheets: https://docs.google.com/spreadsheets/d/1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM/edit
- สร้าง Sheet ชื่อ `StandardsRegister` (ถ้ายังไม่มี)
- สร้าง Sheet ชื่อ `ScanLogs` (สำหรับบันทึกการเปลี่ยนแปลง)
- สร้าง Sheet ชื่อ `ID_CAS_Map` (สำหรับเก็บ CAS numbers)
- สร้าง Sheet ชื่อ `Config` (สำหรับการตั้งค่า)

### 4. ตั้งค่า Permissions
- ใน Apps Script Editor คลิก "Review permissions"
- เลือก Google Account ของคุณ
- คลิก "Advanced" → "Go to [Project Name] (unsafe)"
- คลิก "Allow"

### 5. Deploy เป็น Web App
- คลิก "Deploy" → "New deployment"
- เลือก "Web app" เป็น Type
- ตั้งค่า:
  - **Execute as**: Me
  - **Who has access**: Anyone
- คลิก "Deploy"
- คัดลอก Web App URL ที่ได้

### 6. อัปเดต Environment Variables
สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SHEETS_ID=1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM
```

## 🔧 การตั้งค่า Google Sheets

### Sheet: StandardsRegister
สร้างคอลัมน์ต่อไปนี้:
```
ID No. | Standard Reference Material Name (CRM/SRM/RM) | Storage | Material | CAS | Manufacturer | Supplier | Concentration | Concentration Unit | Packing Size | Packing Unit | Lot | Date Received | Certificate Expiry | Lab Expiry Date | Test Group | Status | Available Qty | Date Opened | Date Disposed | Deeplink In | Deeplink Out | QR In | QR Out
```

### Sheet: ScanLogs
สร้างคอลัมน์ต่อไปนี้:
```
Log ID | Timestamp | ID No. | From Status | To Status | By | Note
```

### Sheet: ID_CAS_Map
สร้างคอลัมน์ต่อไปนี้:
```
Name | CAS
```

### Sheet: Config
สร้างคอลัมน์ต่อไปนี้:
```
Key | Value
```

## 🧪 ทดสอบการเชื่อมต่อ

### 1. ทดสอบ Health Check
```bash
curl "YOUR_WEB_APP_URL?action=health"
```

### 2. ทดสอบในแอป
- ไปที่: http://localhost:3001/test-connection
- คลิก "ทดสอบใหม่"

## 📊 API Endpoints ที่พร้อมใช้งาน

### GET Requests
- `?action=health` - Health check
- `?action=getStats` - รับสถิติ
- `?action=getStandards` - รับรายการสารทั้งหมด
- `?action=getStandardById&id_no=ID` - รับข้อมูลสารตาม ID
- `?action=getStatusLog` - รับประวัติการเปลี่ยนแปลง
- `?action=findSimilarNames&query=ชื่อ` - ค้นหาชื่อที่คล้ายกัน
- `?action=lookupCAS&name=ชื่อ` - ค้นหา CAS number

### POST Requests
- `action=registerStandard` - ลงทะเบียนสารใหม่
- `action=changeStatus` - เปลี่ยนสถานะ
- `action=updateStandard` - อัปเดตข้อมูลสาร

## 🔒 การตั้งค่า CORS

Google Apps Script จะจัดการ CORS อัตโนมัติ แต่ถ้ามีปัญหา:

1. เพิ่มใน Apps Script:
```javascript
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
```

## 🚨 การแก้ไขปัญหา

### ปัญหา: "ไม่พบฟังก์ชันของสคริปต์: doGet"
**วิธีแก้:**
- ตรวจสอบว่าโค้ดถูกคัดลอกครบถ้วน
- ตรวจสอบว่าไม่มี syntax error
- Save โค้ดก่อน Deploy

### ปัญหา: CORS Error
**วิธีแก้:**
- ตรวจสอบว่า Deploy เป็น "Anyone" access
- ตรวจสอบ Web App URL ถูกต้อง

### ปัญหา: Permission Denied
**วิธีแก้:**
- ตรวจสอบว่า Apps Script มีสิทธิ์เข้าถึง Google Sheets
- ตรวจสอบว่า Google Sheets ID ถูกต้อง

## 📞 การสนับสนุน

หากมีปัญหา:
1. ตรวจสอบ Console ใน Apps Script Editor
2. ตรวจสอบ Logs ใน Apps Script Dashboard
3. ทดสอบ API endpoints ด้วย curl หรือ Postman

---

**🎯 เมื่อติดตั้งเสร็จแล้ว ระบบจะเชื่อมต่อกับ Google Sheets จริงแทนการใช้ Mock Data!** ✨
