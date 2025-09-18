# ⚡ แก้ไขปัญหา Xcode License แบบเร็ว

## 🚨 ปัญหา
```
You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license' from within a Terminal window to review and agree to the Xcode and Apple SDKs license.
```

## 🔧 วิธีแก้ไข

### 1. เปิด Terminal
### 2. รันคำสั่ง:
```bash
sudo xcodebuild -license
```

### 3. ยอมรับ License:
- กด `q` เพื่อออกจาก license
- พิมพ์ `agree`
- กด `Enter`

### 4. Push ขึ้น GitHub:
```bash
git remote add origin https://github.com/Earthondev/Lifesciencestandardregister.git
git branch -M main
git push -u origin main
```

## ✅ เสร็จแล้ว!
Repository: https://github.com/Earthondev/Lifesciencestandardregister
