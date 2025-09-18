#!/bin/bash

# 🚀 Simple Push to GitHub
# This script avoids Xcode license issues

echo "🚀 Pushing to GitHub..."

# Set environment variables to avoid Xcode issues
export DEVELOPER_DIR=""
export XCODE_SELECT=""

# Add remote origin
echo "🔗 Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Earthondev/Lifesciencestandardregister.git

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Done!"
