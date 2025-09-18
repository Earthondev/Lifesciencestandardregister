# 🔒 การตั้งค่า Google Apps Script แบบส่วนตัว

## 🚨 ความสำคัญของความเป็นส่วนตัว

Google Apps Script ที่ใช้กับข้อมูลภายในองค์กรควรตั้งค่าให้เป็นส่วนตัวและปลอดภัย

## 🔧 ขั้นตอนการตั้งค่า

### ขั้นตอนที่ 1: ตั้งค่า Google Apps Script เป็น Private

#### 1. เปิด Google Apps Script
1. ไปที่ https://script.google.com
2. เปิดโปรเจค `Life Science Standards Register`

#### 2. ตั้งค่า Project Properties
1. คลิก "Project Settings" (⚙️)
2. ตั้งค่า:
   - **Project name**: `Life Science Standards Register - Private`
   - **Description**: `Private API for Life Science Standards Register`

#### 3. ตั้งค่า Sharing
1. คลิก "Share" (👥)
2. ตั้งค่า:
   - **Access**: "Anyone with the link can view" → "Restricted"
   - **Add people**: เพิ่ม email ของทีมงานเท่านั้น
   - **Permission**: "Viewer" หรือ "Editor" ตามความเหมาะสม

### ขั้นตอนที่ 2: ตั้งค่า Google Sheets เป็น Private

#### 1. เปิด Google Sheets
1. ไปที่ https://sheets.google.com
2. เปิด `StandardsRegister` sheet

#### 2. ตั้งค่า Sharing
1. คลิก "Share" (👥)
2. ตั้งค่า:
   - **Access**: "Anyone with the link can view" → "Restricted"
   - **Add people**: เพิ่ม email ของทีมงานเท่านั้น
   - **Permission**: "Viewer" หรือ "Editor" ตามความเหมาะสม

#### 3. ตั้งค่า Users Sheet
1. เปิด `Users` sheet (ถ้ามี)
2. ตั้งค่า sharing เดียวกัน
3. **สำคัญ**: ตั้งค่าเป็น "Editor" สำหรับ admin เท่านั้น

### ขั้นตอนที่ 3: ตั้งค่า Deployment เป็น Private

#### 1. ตั้งค่า Web App
1. คลิก "Deploy" > "New deployment"
2. ตั้งค่า:
   - **Type**: "Web app"
   - **Description**: "Private API for Life Science Standards Register"
   - **Execute as**: "Me"
   - **Who has access**: "Only myself" หรือ "Anyone in [your organization]"

#### 2. ตั้งค่า API Key (ถ้าต้องการ)
1. ไปที่ Google Cloud Console
2. สร้าง API key
3. ตั้งค่า restrictions:
   - **Application restrictions**: "HTTP referrers"
   - **API restrictions**: "Restrict key" → เลือก APIs ที่ต้องการ

### ขั้นตอนที่ 4: ตั้งค่า Security

#### 1. ตั้งค่า CORS
```javascript
// ใน Google Apps Script
function createResponse(success, data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success, data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': 'https://your-domain.com', // เปลี่ยนเป็น domain ของคุณ
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600'
    });
}
```

#### 2. ตั้งค่า Authentication
```javascript
// เพิ่มการตรวจสอบ authentication
function authenticateRequest(e) {
  const authHeader = e.parameter.auth;
  const validAuth = 'your-secret-key'; // เปลี่ยนเป็น key ที่ปลอดภัย
  
  if (authHeader !== validAuth) {
    return createResponse(false, { error: 'Unauthorized' });
  }
  
  return true;
}
```

#### 3. ตั้งค่า Rate Limiting
```javascript
// เพิ่ม rate limiting
function checkRateLimit(email) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${email}`;
  const count = cache.get(key) || 0;
  
  if (count > 100) { // จำกัด 100 requests ต่อชั่วโมง
    return false;
  }
  
  cache.put(key, parseInt(count) + 1, 3600); // เก็บ 1 ชั่วโมง
  return true;
}
```

## 🛡️ การรักษาความปลอดภัย

### 1. ข้อมูลที่ต้องปกป้อง
- **ข้อมูลสารมาตรฐาน**: ข้อมูลภายในองค์กร
- **ข้อมูลผู้ใช้**: ข้อมูลส่วนตัว
- **ข้อมูลการใช้งาน**: ข้อมูลการเข้าถึง
- **ข้อมูลการตั้งค่า**: ข้อมูลระบบ

### 2. การควบคุมการเข้าถึง
- **Domain whitelist**: อนุญาตเฉพาะ domain ขององค์กร
- **IP whitelist**: อนุญาตเฉพาะ IP ขององค์กร
- **User authentication**: ตรวจสอบผู้ใช้ก่อนเข้าถึง
- **Role-based access**: ควบคุมสิทธิ์ตาม role

### 3. การตรวจสอบและ Audit
- **Logging**: บันทึกการเข้าถึงทั้งหมด
- **Monitoring**: ตรวจสอบการใช้งาน
- **Alerts**: แจ้งเตือนเมื่อมีการเข้าถึงผิดปกติ
- **Audit trail**: ติดตามการเปลี่ยนแปลง

## 🔐 การตั้งค่า Authentication

### 1. Google OAuth
```javascript
// ใช้ Google OAuth
function getCurrentUser() {
  const user = Session.getActiveUser();
  const email = user.getEmail();
  
  // ตรวจสอบว่าเป็น email ขององค์กรหรือไม่
  if (!email.endsWith('@your-organization.com')) {
    throw new Error('Unauthorized domain');
  }
  
  return user;
}
```

### 2. API Key Authentication
```javascript
// ใช้ API key
function validateApiKey(apiKey) {
  const validKeys = [
    'your-secret-api-key-1',
    'your-secret-api-key-2'
  ];
  
  return validKeys.includes(apiKey);
}
```

### 3. JWT Token
```javascript
// ใช้ JWT token (ต้องใช้ library เพิ่มเติม)
function validateJWT(token) {
  // ตรวจสอบ JWT token
  // ต้องใช้ library เช่น jwt-js
}
```

## 📱 การ Deploy แบบส่วนตัว

### 1. Private Vercel
```bash
# ตั้งค่า environment variables
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_API_KEY=your-secret-api-key
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_PRIVATE=true
```

### 2. Private Netlify
```bash
# ตั้งค่า environment variables เดียวกัน
# ตั้งค่า password protection
# ใช้ custom domain
```

### 3. Self-Hosted
```bash
# Deploy บน server ขององค์กร
# ตั้งค่า firewall rules
# ใช้ HTTPS only
```

## 🚨 ข้อควรระวัง

### 1. ข้อมูลที่ต้องปกป้อง
- ตรวจสอบ permissions ทุกครั้ง
- ตั้งค่า audit logs
- ใช้ monitoring
- ตั้งค่า alerts

### 2. การรั่วไหลของข้อมูล
- ตรวจสอบ sharing settings
- ตั้งค่า domain restrictions
- ใช้ IP whitelist
- ตั้งค่า rate limiting

### 3. การเข้าถึงที่ไม่ได้รับอนุญาต
- ใช้ strong passwords
- ตั้งค่า 2FA
- ใช้ service accounts
- ตั้งค่า session timeout

## 🎉 สรุป

การตั้งค่า Google Apps Script แบบส่วนตัวจะช่วย:
- ✅ ป้องกันการรั่วไหลของข้อมูล
- ✅ ควบคุมการเข้าถึงได้
- ✅ รักษาความปลอดภัยของข้อมูล
- ✅ ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต

**แนะนำให้ตั้งค่าเป็น Private + Domain Restrictions + API Key Authentication**
