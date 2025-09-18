# 🚀 Manual Git Commands for GitHub Push

เนื่องจากมีปัญหา Xcode license ให้รันคำสั่งเหล่านี้ใน Terminal ตามลำดับ:

## 📋 คำสั่งที่ต้องรัน:

### 1. เพิ่ม Remote Origin
```bash
git remote add origin https://github.com/Earthondev/Lifesciencestandardregister.git
```

### 2. ตั้งค่า Main Branch
```bash
git branch -M main
```

### 3. Push ขึ้น GitHub
```bash
git push -u origin main
```

### 4. Push Tags
```bash
git push origin v1.0.0
```

## 🔍 ตรวจสอบสถานะ:

### ตรวจสอบ Remote
```bash
git remote -v
```

### ตรวจสอบ Branch
```bash
git branch -a
```

### ตรวจสอบ Status
```bash
git status
```

## 🎯 ผลลัพธ์ที่คาดหวัง:

- ✅ Repository ถูก push ขึ้น GitHub สำเร็จ
- ✅ ไฟล์ทั้งหมดถูกอัปโหลด
- ✅ Tag v1.0.0 ถูกสร้าง
- ✅ สามารถเข้าถึงได้ที่: https://github.com/Earthondev/Lifesciencestandardregister

## 🚨 หากมีปัญหา:

### หาก Remote มีอยู่แล้ว:
```bash
git remote remove origin
git remote add origin https://github.com/Earthondev/Lifesciencestandardregister.git
```

### หากต้องการ Force Push:
```bash
git push -u origin main --force
```

## 📱 หลังจาก Push สำเร็จ:

1. ไปที่ https://github.com/Earthondev/Lifesciencestandardregister
2. ตรวจสอบว่าทุกไฟล์ถูกอัปโหลด
3. อัปเดต Repository description
4. เพิ่ม Topics/Tags
5. เปิดใช้งาน GitHub Pages หากต้องการ
