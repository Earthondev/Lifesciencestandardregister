# ⚡ แก้ไขปัญหา CORS แบบเร็ว

## 🚨 ปัญหาปัจจุบัน
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'http://localhost:3001' has been blocked by CORS policy
```

## 🔧 วิธีแก้ไขแบบเร็ว (5 นาที)

### ขั้นตอนที่ 1: ตรวจสอบ Google Apps Script
1. ไปที่ https://script.google.com
2. เปิดโปรเจค `Life Science Standards Register`
3. ตรวจสอบว่ามีโค้ด `doOptions(e)` function
4. ตรวจสอบว่ามี CORS headers ใน `createResponse`

### ขั้นตอนที่ 2: Deploy ใหม่
1. คลิก "Deploy" > "New deployment"
2. เลือก "Type": "Web app"
3. เลือก "Execute as": "Me"
4. เลือก "Who has access": "Anyone"
5. คลิก "Deploy"
6. **คัดลอก URL ใหม่**

### ขั้นตอนที่ 3: อัปเดต Environment Variables
1. เปิดไฟล์ `.env.local`
2. อัปเดต URL:
```bash
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
```

### ขั้นตอนที่ 4: ทดสอบ
1. รีเฟรชหน้าเว็บ
2. ลองล็อกอินใหม่
3. ตรวจสอบ Console สำหรับ errors

## 🧪 ทดสอบด้วย test-cors.html

### วิธีใช้:
1. เปิดไฟล์ `test-cors.html` ใน browser
2. คลิก "ทดสอบการเชื่อมต่อ"
3. ดูผลลัพธ์

### หากทดสอบสำเร็จ:
- ✅ การเชื่อมต่อสำเร็จ
- ✅ CORS Headers พบ
- ✅ API calls ทำงานได้

### หากทดสอบล้มเหลว:
- ❌ ตรวจสอบ Google Apps Script
- ❌ Deploy ใหม่
- ❌ อัปเดต URL

## 🚀 วิธีแก้ไขแบบชั่วคราว

### ใช้ Mock Data:
```javascript
// ใน lib/googleSheets.ts
if (process.env.NODE_ENV === 'development') {
  // ใช้ mock data แทน
  return mockData;
}
```

### ใช้ ngrok:
```bash
# ติดตั้ง ngrok
brew install ngrok

# รัน ngrok
ngrok http 3000

# ใช้ URL ที่ได้จาก ngrok
```

## 📋 Checklist

- [ ] Google Apps Script มี `doOptions(e)` function
- [ ] Google Apps Script มี CORS headers
- [ ] Google Apps Script ถูก Deploy เป็น Web App
- [ ] Google Apps Script ตั้งค่า "Anyone" access
- [ ] Environment Variables อัปเดตแล้ว
- [ ] ทดสอบด้วย test-cors.html สำเร็จ

## 🎯 ผลลัพธ์ที่คาดหวัง

หลังจากแก้ไขแล้ว:
- ✅ ไม่มี CORS error
- ✅ การล็อกอินทำงานได้
- ✅ ข้อมูลโหลดได้ปกติ
- ✅ API calls สำเร็จ

## 🚨 หากยังมีปัญหา

### ตรวจสอบเพิ่มเติม:
1. **Google Apps Script Logs**: ดู Execution transcript
2. **Network Tab**: ตรวจสอบ request/response
3. **Console**: ดู error messages
4. **test-cors.html**: ทดสอบการเชื่อมต่อ

### วิธีแก้ไขเพิ่มเติม:
1. **ใช้ Vercel**: Deploy ไปยัง Vercel แทน localhost
2. **ใช้ Firebase**: ใช้ Firebase Functions
3. **ใช้ Google Sheets API**: ใช้ API โดยตรง

## 📞 การขอความช่วยเหลือ

หากยังมีปัญหา:
1. ตรวจสอบ Google Apps Script Logs
2. ตรวจสอบ Network Tab ใน Browser
3. ตรวจสอบ Environment Variables
4. ทดสอบด้วย test-cors.html
5. ลองใช้ ngrok หรือ Vercel
