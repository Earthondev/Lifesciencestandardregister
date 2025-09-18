# 🔐 การตั้งค่า Environment Variables แบบปลอดภัย

## 🚨 ความสำคัญของความปลอดภัย

Environment Variables ที่ใช้กับข้อมูลภายในองค์กรควรตั้งค่าให้ปลอดภัยและไม่เปิดเผย

## 🔧 ขั้นตอนการตั้งค่า

### ขั้นตอนที่ 1: สร้าง Environment Variables ที่ปลอดภัย

#### 1. Google Sheets API
```bash
# ตั้งค่าใน deployment platform
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_API_KEY=your-secret-api-key
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_PRIVATE=true
```

#### 2. Authentication
```bash
# ตั้งค่า authentication
NEXT_PUBLIC_AUTH_DOMAIN=your-organization.com
NEXT_PUBLIC_AUTH_REQUIRED=true
NEXT_PUBLIC_SESSION_TIMEOUT=3600
```

#### 3. Security
```bash
# ตั้งค่า security
NEXT_PUBLIC_CORS_ORIGIN=https://your-domain.com
NEXT_PUBLIC_RATE_LIMIT=100
NEXT_PUBLIC_ENABLE_LOGGING=true
```

### ขั้นตอนที่ 2: ตั้งค่าใน Deployment Platform

#### สำหรับ Vercel
1. ไปที่ Vercel Dashboard
2. เลือกโปรเจค
3. ไปที่ "Settings" > "Environment Variables"
4. เพิ่ม variables:
   - **Name**: `NEXT_PUBLIC_GOOGLE_SHEETS_API_URL`
   - **Value**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - **Environment**: `Production`

#### สำหรับ Netlify
1. ไปที่ Netlify Dashboard
2. เลือกโปรเจค
3. ไปที่ "Site settings" > "Environment variables"
4. เพิ่ม variables เดียวกัน

#### สำหรับ Railway
1. ไปที่ Railway Dashboard
2. เลือกโปรเจค
3. ไปที่ "Variables"
4. เพิ่ม variables เดียวกัน

### ขั้นตอนที่ 3: ตั้งค่าใน Google Apps Script

#### 1. ตั้งค่า Properties
```javascript
// ใน Google Apps Script
function setProperties() {
  PropertiesService.getScriptProperties().setProperties({
    'API_KEY': 'your-secret-api-key',
    'ALLOWED_DOMAINS': 'your-domain.com,another-domain.com',
    'RATE_LIMIT': '100',
    'ENABLE_LOGGING': 'true'
  });
}
```

#### 2. ตั้งค่า CORS
```javascript
// ตั้งค่า CORS ให้รองรับเฉพาะ domain ที่อนุญาต
function createResponse(success, data) {
  const allowedOrigins = [
    'https://your-domain.com',
    'https://your-vercel-app.vercel.app',
    'https://your-netlify-app.netlify.app'
  ];
  
  const origin = getOrigin();
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'null';
  
  return ContentService
    .createTextOutput(JSON.stringify({ success, data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '3600'
    });
}
```

#### 3. ตั้งค่า Authentication
```javascript
// ตรวจสอบ API key
function validateApiKey(request) {
  const apiKey = request.parameter.api_key || request.headers['X-API-Key'];
  const validApiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}
```

## 🛡️ การรักษาความปลอดภัย

### 1. ข้อมูลที่ต้องปกป้อง
- **API Keys**: ไม่เปิดเผยในโค้ด
- **Database URLs**: ใช้ environment variables
- **Authentication Tokens**: เก็บใน secure storage
- **Configuration**: ใช้ encrypted storage

### 2. การควบคุมการเข้าถึง
- **Domain Restrictions**: อนุญาตเฉพาะ domain ที่ต้องการ
- **IP Whitelist**: อนุญาตเฉพาะ IP ที่ต้องการ
- **API Key Authentication**: ตรวจสอบ API key ทุกครั้ง
- **Rate Limiting**: จำกัดจำนวน requests

### 3. การตรวจสอบและ Audit
- **Logging**: บันทึกการเข้าถึงทั้งหมด
- **Monitoring**: ตรวจสอบการใช้งาน
- **Alerts**: แจ้งเตือนเมื่อมีการเข้าถึงผิดปกติ
- **Audit Trail**: ติดตามการเปลี่ยนแปลง

## 🔐 การตั้งค่า Authentication

### 1. API Key Authentication
```javascript
// ตรวจสอบ API key ในทุก request
function doGet(e) {
  if (!validateApiKey(e)) {
    return createResponse(false, { error: 'Unauthorized' });
  }
  
  // ทำงานต่อ
  return handleRequest(e);
}

function doPost(e) {
  if (!validateApiKey(e)) {
    return createResponse(false, { error: 'Unauthorized' });
  }
  
  // ทำงานต่อ
  return handleRequest(e);
}
```

### 2. Domain Validation
```javascript
// ตรวจสอบ domain ที่อนุญาต
function validateDomain(request) {
  const allowedDomains = PropertiesService.getScriptProperties()
    .getProperty('ALLOWED_DOMAINS').split(',');
  
  const origin = getOrigin(request);
  const domain = new URL(origin).hostname;
  
  return allowedDomains.includes(domain);
}
```

### 3. Rate Limiting
```javascript
// จำกัดจำนวน requests
function checkRateLimit(identifier) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${identifier}`;
  const count = cache.get(key) || 0;
  const limit = parseInt(PropertiesService.getScriptProperties()
    .getProperty('RATE_LIMIT')) || 100;
  
  if (count > limit) {
    return false;
  }
  
  cache.put(key, parseInt(count) + 1, 3600); // เก็บ 1 ชั่วโมง
  return true;
}
```

## 📱 การ Deploy แบบปลอดภัย

### 1. Private Vercel
```bash
# ตั้งค่า environment variables
vercel env add NEXT_PUBLIC_GOOGLE_SHEETS_API_URL
vercel env add NEXT_PUBLIC_API_KEY
vercel env add NEXT_PUBLIC_APP_ENV production
vercel env add NEXT_PUBLIC_APP_PRIVATE true
```

### 2. Private Netlify
```bash
# ตั้งค่า environment variables
netlify env:set NEXT_PUBLIC_GOOGLE_SHEETS_API_URL "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
netlify env:set NEXT_PUBLIC_API_KEY "your-secret-api-key"
netlify env:set NEXT_PUBLIC_APP_ENV "production"
netlify env:set NEXT_PUBLIC_APP_PRIVATE "true"
```

### 3. Self-Hosted
```bash
# สร้างไฟล์ .env.production
cat > .env.production << EOF
NEXT_PUBLIC_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_API_KEY=your-secret-api-key
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_PRIVATE=true
EOF

# Build และ deploy
npm run build
npm start
```

## 🚨 ข้อควรระวัง

### 1. ข้อมูลที่ต้องปกป้อง
- ตรวจสอบ environment variables ทุกครั้ง
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

การตั้งค่า Environment Variables แบบปลอดภัยจะช่วย:
- ✅ ป้องกันการรั่วไหลของข้อมูล
- ✅ ควบคุมการเข้าถึงได้
- ✅ รักษาความปลอดภัยของข้อมูล
- ✅ ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต

**แนะนำให้ใช้ Environment Variables + API Key Authentication + Domain Restrictions**
