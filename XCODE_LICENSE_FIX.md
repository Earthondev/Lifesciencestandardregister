# แก้ไขปัญหา Xcode License Agreement

## ปัญหา
```
You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license' from within a Terminal window to review and agree to the Apple SDKs license.
```

## วิธีแก้ไข

### 1. เปิด Terminal แยกต่างหาก
- เปิด Terminal app แยกต่างหาก (ไม่ใช่ใน Cursor)
- หรือใช้ Spotlight Search: `Cmd + Space` แล้วพิมพ์ "Terminal"

### 2. รันคำสั่งแก้ไข License
```bash
sudo xcodebuild -license
```

### 3. อ่านและยอมรับ License
- กด `Space` เพื่อเลื่อนลงอ่าน License
- เมื่ออ่านจบแล้ว พิมพ์ `agree` แล้วกด Enter

### 4. ตรวจสอบการแก้ไข
```bash
git --version
```

## วิธีอื่น (ถ้าวิธีแรกไม่ได้)

### 1. ใช้ Homebrew ติดตั้ง Git แยก
```bash
# ติดตั้ง Homebrew (ถ้ายังไม่มี)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ติดตั้ง Git ผ่าน Homebrew
brew install git

# ใช้ Git จาก Homebrew
/opt/homebrew/bin/git --version
```

### 2. ตั้งค่า PATH
```bash
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## หลังจากแก้ไขแล้ว

### 1. กลับไปรัน Git Commands
```bash
cd "/Users/earthondev/Desktop/Life science standard register"
./git-commands.sh
```

### 2. หรือรันคำสั่ง Git แยก
```bash
git init
git add .
git commit -m "Initial commit: Life Science Standard Register v1.0.0"
git tag -a v1.0.0 -m "Release version 1.0.0"
```

## การสร้าง GitHub Repository

### 1. ไปที่ GitHub.com
- เข้าสู่ระบบ GitHub account
- คลิก "New repository"

### 2. ตั้งค่า Repository
- **Name**: `life-science-standard-register`
- **Description**: `Life Science Standard Register - Web App with Google Sheets Integration`
- **Public** หรือ **Private** (ตามต้องการ)
- ❌ **ไม่ต้องเลือก** "Initialize with README"

### 3. สร้าง Repository
- คลิก "Create repository"

### 4. Push โค้ดขึ้น GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/life-science-standard-register.git
git branch -M main
git push -u origin main
git push origin v1.0.0
```

## การตรวจสอบ

### 1. ตรวจสอบ Git Status
```bash
git status
```

### 2. ตรวจสอบ Commits
```bash
git log --oneline
```

### 3. ตรวจสอบ Tags
```bash
git tag
```

---

**หมายเหตุ**: ปัญหา Xcode License เป็นปัญหาที่พบบ่อยใน macOS เมื่อใช้ Git ที่มาพร้อมกับ Xcode Command Line Tools
