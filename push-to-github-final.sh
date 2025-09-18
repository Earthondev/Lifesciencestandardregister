#!/bin/bash

# 🚀 Final Push to GitHub for Life Science Standard Register
# This script pushes the project to GitHub repository

echo "🚀 Pushing Life Science Standard Register to GitHub..."

# Check if git repository exists
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run git-commands.sh first."
    exit 1
fi

# Add remote origin (if not already added)
echo "🔗 Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Earthondev/Lifesciencestandardregister.git

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

# Push tags
echo "🏷️ Pushing tags..."
git push origin v1.0.0

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 Repository URL: https://github.com/Earthondev/Lifesciencestandardregister"
echo ""
echo "📋 Next steps:"
echo "1. Visit your repository: https://github.com/Earthondev/Lifesciencestandardregister"
echo "2. Check if all files are uploaded correctly"
echo "3. Update repository description and topics"
echo "4. Enable GitHub Pages if needed"
echo ""
echo "🎉 Your Life Science Standard Register is now on GitHub!"
