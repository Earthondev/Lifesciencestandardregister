# 🚀 คู่มือการติดตั้งระบบ Life Science Standards Register แบบสมบูรณ์

## 📋 โครงสร้างระบบ

### 🗂️ Google Sheets Structure (5 Sheets)

1. **StandardsRegister** - ข้อมูลสารมาตรฐานหลัก
2. **StatusLog** - บันทึกการเปลี่ยนสถานะ
3. **CAS_Index** - จับคู่ชื่อสารกับ CAS No.
4. **Config** - ค่ากำหนดระบบ
5. **Holidays** - วันหยุดราชการ (ทางเลือก)

---

## 🔧 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Google Apps Script

#### 1.1 เปิด Google Apps Script
- ไปที่: https://script.google.com
- คลิก **"New Project"**

#### 1.2 คัดลอกโค้ด
- ลบโค้ดเริ่มต้นทั้งหมด
- เปิดไฟล์ `GoogleAppsScript_Updated.gs`
- คัดลอกโค้ดทั้งหมด (800+ บรรทัด)
- วางลงใน Apps Script Editor
- คลิก **"Save"** (Ctrl+S)

#### 1.3 Deploy เป็น Web App
- คลิก **"Deploy"** → **"New deployment"**
- เลือก **"Web app"** เป็น Type
- ตั้งค่า:
  - **Execute as**: Me
  - **Who has access**: Anyone
- คลิก **"Deploy"**
- **คัดลอก Web App URL** ที่ได้

### 2. ตั้งค่า Google Sheets

#### 2.1 เปิด Google Sheets
- ไปที่: https://docs.google.com/spreadsheets/d/1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM/edit

#### 2.2 สร้าง Sheets ตามลำดับ

**Sheet 1: StandardsRegister**
- สร้าง Sheet ชื่อ `StandardsRegister`
- คัดลอกข้อมูลจาก `StandardsRegister_Structure.csv`
- วางลงใน Sheet (รวม Header)

**Sheet 2: StatusLog**
- สร้าง Sheet ชื่อ `StatusLog`
- คัดลอกข้อมูลจาก `StatusLog_Structure.csv`
- วางลงใน Sheet (รวม Header)

**Sheet 3: CAS_Index**
- สร้าง Sheet ชื่อ `CAS_Index`
- คัดลอกข้อมูลจาก `CAS_Index_Structure.csv`
- วางลงใน Sheet (รวม Header)

**Sheet 4: Config**
- สร้าง Sheet ชื่อ `Config`
- คัดลอกข้อมูลจาก `Config_Structure.csv`
- วางลงใน Sheet (รวม Header)

**Sheet 5: Holidays (ทางเลือก)**
- สร้าง Sheet ชื่อ `Holidays`
- คัดลอกข้อมูลจาก `Holidays_Structure.csv`
- วางลงใน Sheet (รวม Header)

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SHEETS_ID=1KJAfxnbH8iFDopf6rN6Kt47TWZUCV_oSCxZXNu9GvGM
```

### 4. ทดสอบการเชื่อมต่อ

- ไปที่: http://localhost:3001/test-connection
- คลิก **"ทดสอบใหม่"**

---

## 📊 ฟีเจอร์ที่พร้อมใช้งาน

### 🔍 API Endpoints

#### GET Requests
- `?action=health` - Health check + Config
- `?action=getStats` - สถิติแบบ Real-time
- `?action=getStandards` - รายการสารทั้งหมด
- `?action=getStandardById&id_no=ID` - ข้อมูลสารตาม ID
- `?action=getStatusLog&id_no=ID` - ประวัติการเปลี่ยนแปลง
- `?action=findSimilarNames&query=ชื่อ` - ค้นหาชื่อที่คล้ายกัน
- `?action=lookupCAS&name=ชื่อ` - ค้นหา CAS number
- `?action=getConfig` - ดูการตั้งค่าระบบ
- `?action=getHolidays` - ดูวันหยุดราชการ

#### POST Requests
- `action=registerStandard` - ลงทะเบียนสารใหม่
- `action=changeStatus` - เปลี่ยนสถานะ
- `action=updateStandard` - อัปเดตข้อมูลสาร
- `action=updateConfig` - อัปเดตการตั้งค่า
- `action=addCASEntry` - เพิ่ม CAS number

### 🎯 ฟีเจอร์หลัก

#### 1. การลงทะเบียนสารใหม่
- ✅ สร้าง ID อัตโนมัติ: `LS-ชื่อสาร-yy-###`
- ✅ ค้นหา CAS number อัตโนมัติ
- ✅ ตรวจสอบชื่อที่คล้ายกัน
- ✅ บันทึกใน StatusLog

#### 2. การจัดการสถานะ
- ✅ เปลี่ยนสถานะ: Unopened → In-Use → Disposed
- ✅ บันทึกวันที่เปิดใช้/ทิ้ง
- ✅ ประวัติการเปลี่ยนแปลงครบถ้วน

#### 3. การค้นหาและกรอง
- ✅ ค้นหาชื่อที่คล้ายกัน (Fuzzy Search)
- ✅ กรองตามสถานะ
- ✅ เรียงลำดับตามคอลัมน์
- ✅ แบ่งหน้า (Pagination)

#### 4. Dashboard และรายงาน
- ✅ สถิติแบบ Real-time
- ✅ แจ้งเตือนสารใกล้หมดอายุ
- ✅ กราฟแสดงแนวโน้ม

---

## 🔧 การปรับแต่งระบบ

### 1. ปรับการตั้งค่าใน Config Sheet

| Key | Value | คำอธิบาย |
|-----|-------|----------|
| `id_prefix` | LS | คำนำรหัส ID |
| `fuzzy_threshold` | 0.82 | ค่าความคล้ายกันขั้นต่ำ |
| `fuzzy_max_results` | 5 | จำนวนผลลัพธ์สูงสุด |
| `timezone` | Asia/Bangkok | เขตเวลา |
| `expiry_warning_days` | 30 | วันเตือนก่อนหมดอายุ |

### 2. เพิ่ม CAS Numbers ใน CAS_Index

เพิ่มรายการใน Sheet `CAS_Index`:
```
name,cas
ชื่อสาร,CAS-Number
```

### 3. เพิ่มวันหยุดใน Holidays

เพิ่มวันหยุดใน Sheet `Holidays`:
```
date
YYYY-MM-DD
```

---

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

### ปัญหา: Sheet not found
**วิธีแก้:**
- ตรวจสอบชื่อ Sheet ตรงกับที่กำหนด
- ตรวจสอบว่า Sheet มีข้อมูล Header

### ปัญหา: Permission Denied
**วิธีแก้:**
- ตรวจสอบว่า Apps Script มีสิทธิ์เข้าถึง Google Sheets
- ตรวจสอบว่า Google Sheets ID ถูกต้อง

---

## 📈 การขยายระบบในอนาคต

### 1. แจ้งเตือนผ่าน LINE
- เพิ่ม LINE Notify Token ใน Config
- สร้างฟังก์ชันแจ้งเตือนเมื่อสารใกล้หมดอายุ

### 2. Export ข้อมูล
- เพิ่มฟังก์ชัน Export เป็น Excel/PDF
- สร้างรายงานประจำเดือน

### 3. QR Code Integration
- เชื่อมต่อกับ QR Code Generator
- สร้าง Deep Links สำหรับ Mobile App

### 4. Backup และ Sync
- สร้างระบบ Backup อัตโนมัติ
- Sync ข้อมูลกับระบบอื่น

---

## 🎯 ผลลัพธ์ที่คาดหวัง

เมื่อติดตั้งเสร็จแล้ว:

✅ **ระบบครบถ้วน**: ลงทะเบียน, จัดการสถานะ, ค้นหา, รายงาน
✅ **ข้อมูลจริง**: เชื่อมต่อ Google Sheets จริง
✅ **การทำงานอัตโนมัติ**: สร้าง ID, ค้นหา CAS, บันทึกประวัติ
✅ **การปรับแต่งได้**: ตั้งค่าผ่าน Config Sheet
✅ **ขยายได้**: เพิ่มฟีเจอร์ใหม่ได้ง่าย

---

## 📞 การสนับสนุน

หากมีปัญหา:
1. ตรวจสอบ Console ใน Apps Script Editor
2. ตรวจสอบ Logs ใน Apps Script Dashboard
3. ทดสอบ API endpoints ด้วย curl หรือ Postman
4. ตรวจสอบหน้าทดสอบ: http://localhost:3001/test-connection

---

**🎯 เมื่อติดตั้งเสร็จแล้ว ระบบจะทำงานแบบสมบูรณ์และเชื่อมต่อกับ Google Sheets จริง!** ✨
