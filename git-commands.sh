#!/bin/bash

# Life Science Standard Register - Git Setup Commands
# Run these commands in terminal to set up Git repository

echo "🚀 Setting up Git repository for Life Science Standard Register..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Navigate to project directory
cd "/Users/earthondev/Desktop/Life science standard register"

# Initialize git repository
echo "📁 Initializing Git repository..."
git init

# Add all files
echo "📝 Adding all files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Life Science Standard Register v1.0.0

✨ Features:
- Complete dashboard with statistics and charts
- Advanced search and filtering system  
- Multi-theme support (Light, Dark, Orange, Blue, Green)
- User authentication with Google Sheets integration
- Admin user management system
- Responsive design for all devices
- Google Apps Script backend integration
- TypeScript implementation with Next.js 14

🛠️ Tech Stack:
- Frontend: Next.js 14, React 18, TypeScript
- Styling: Tailwind CSS
- Backend: Google Apps Script
- Database: Google Sheets
- Authentication: Custom Google Sheets Integration"

# Create version tag
echo "🏷️ Creating version tag v1.0.0..."
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial stable release"

echo "✅ Git repository initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add remote origin: git remote add origin https://github.com/YOUR_USERNAME/life-science-standard-register.git"
echo "3. Push to GitHub: git push -u origin main"
echo "4. Push tags: git push origin v1.0.0"
echo ""
echo "📖 For detailed instructions, see GIT_SETUP_GUIDE.md"
