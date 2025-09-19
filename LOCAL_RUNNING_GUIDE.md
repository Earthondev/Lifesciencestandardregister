# 🚀 คำแนะนำการรันโปรเจคในโหมด Local

## ✅ โปรเจครันอยู่แล้ว!

โปรเจค **Life Science Standards Register** กำลังรันอยู่ในโหมด development แล้ว

### 🌐 **URLs ที่สามารถเข้าถึงได้:**

#### **Port 3000 (หลัก)**
- **URL**: http://localhost:3000
- **สถานะ**: ✅ กำลังรัน
- **คำอธิบาย**: Port หลักสำหรับการพัฒนา

#### **Port 3001 (สำรอง)**
- **URL**: http://localhost:3001
- **สถานะ**: ✅ กำลังรัน
- **คำอธิบาย**: Port สำรองสำหรับการทดสอบ

## 🎯 **หน้าที่สามารถเข้าถึงได้:**

### 1. **หน้าแรก (Home)**
- **URL**: http://localhost:3000
- **คำอธิบาย**: หน้าแรกของระบบ

### 2. **หน้า Login**
- **URL**: http://localhost:3000/login
- **คำอธิบาย**: หน้าล็อกอิน

### 3. **หน้า Dashboard**
- **URL**: http://localhost:3000/dashboard
- **คำอธิบาย**: แดชบอร์ดหลัก

### 4. **หน้า Dashboard ใหม่**
- **URL**: http://localhost:3000/dashboard-new
- **คำอธิบาย**: แดชบอร์ดแบบใหม่

### 5. **หน้ารายการสาร**
- **URL**: http://localhost:3000/list
- **คำอธิบาย**: รายการสารมาตรฐาน

### 6. **หน้าลงทะเบียน**
- **URL**: http://localhost:3000/register
- **คำอธิบาย**: ลงทะเบียนสารใหม่

### 7. **หน้าจัดการผู้ใช้ (Admin)**
- **URL**: http://localhost:3000/admin/users
- **คำอธิบาย**: จัดการผู้ใช้ (เฉพาะ Admin)

### 8. **หน้าทดสอบการเชื่อมต่อ**
- **URL**: http://localhost:3000/test-connection
- **คำอธิบาย**: ทดสอบการเชื่อมต่อ Google Sheets

## 🔧 **การใช้งาน:**

### 1. **เปิดเว็บไซต์**
1. เปิดเบราว์เซอร์
2. ไปที่ http://localhost:3000
3. จะเห็นหน้าแรกของระบบ

### 2. **ทดสอบการล็อกอิน**
1. ไปที่ http://localhost:3000/login
2. ใช้ข้อมูลทดสอบ:
   - **Email**: `admin@lifescience.com`
   - **Password**: `hello`
3. คลิก "เข้าสู่ระบบ"

### 3. **ทดสอบฟีเจอร์ต่างๆ**
- **Dashboard**: ดูสถิติและข้อมูลสรุป
- **รายการสาร**: ดูรายการสารมาตรฐาน
- **ลงทะเบียน**: เพิ่มสารใหม่
- **จัดการผู้ใช้**: จัดการผู้ใช้ (เฉพาะ Admin)

## 🎨 **ฟีเจอร์ที่สามารถทดสอบได้:**

### 1. **ธีม (Themes)**
- คลิกปุ่มธีมใน navigation
- เลือกธีม: Light, Dark, Orange, Blue, Green
- ธีมจะเปลี่ยนทันที

### 2. **การค้นหาและกรอง**
- ไปที่หน้ารายการสาร
- ใช้ฟีเจอร์ค้นหาและกรองขั้นสูง
- ทดสอบการเรียงลำดับ

### 3. **การจัดการผู้ใช้**
- ไปที่หน้าจัดการผู้ใช้ (ต้องเป็น Admin)
- เพิ่ม, แก้ไข, ลบผู้ใช้
- ทดสอบ role-based access control

## 🚨 **ข้อควรระวัง:**

### 1. **การเชื่อมต่อ Google Sheets**
- ต้องตั้งค่า Google Apps Script ก่อน
- ต้องตั้งค่า environment variables
- ดูคำแนะนำใน `GOOGLE_APPS_SCRIPT_SETUP.md`

### 2. **ข้อมูลทดสอบ**
- ใช้ข้อมูล mock data สำหรับการทดสอบ
- ข้อมูลจริงต้องเชื่อมต่อกับ Google Sheets

### 3. **การเข้าถึง**
- ระบบใช้ mock authentication
- ข้อมูลผู้ใช้เก็บใน localStorage

## 🔄 **การหยุดและเริ่มใหม่:**

### หยุดการรัน
```bash
# กด Ctrl+C ใน terminal ที่รันอยู่
# หรือหา process และ kill
ps aux | grep "npm run dev"
kill [PID]
```

### เริ่มใหม่
```bash
cd "/Users/earthondev/Desktop/Life science standard register"
npm run dev
```

## 📱 **การทดสอบบน Mobile:**

### 1. **ใช้ Network IP**
```bash
# หา IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# เข้าถึงจาก mobile
http://[YOUR_IP]:3000
```

### 2. **ใช้ ngrok (ถ้าติดตั้งแล้ว)**
```bash
# ติดตั้ง ngrok
brew install ngrok

# รัน ngrok
ngrok http 3000

# ใช้ URL ที่ได้จาก ngrok
```

## 🎉 **สรุป:**

โปรเจค **Life Science Standards Register** รันอยู่ที่:
- ✅ **Port 3000**: http://localhost:3000
- ✅ **Port 3001**: http://localhost:3001

**คุณสามารถเปิดเบราว์เซอร์และไปที่ http://localhost:3000 เพื่อทดสอบระบบได้เลย!** 🚀
