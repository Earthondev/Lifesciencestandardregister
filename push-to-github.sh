#!/bin/bash

# Life Science Standard Register - Push to GitHub
# Run this script after creating GitHub repository

echo "🚀 Pushing Life Science Standard Register to GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Navigate to project directory
cd "/Users/earthondev/Desktop/Life science standard register"

# Check if repository exists
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run git-commands.sh first."
    exit 1
fi

# Get GitHub username
echo "📝 Please enter your GitHub username:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required."
    exit 1
fi

# Repository URL
REPO_URL="https://github.com/$GITHUB_USERNAME/life-science-standard-register.git"

echo "🔗 Repository URL: $REPO_URL"

# Add remote origin
echo "📡 Adding remote origin..."
git remote add origin "$REPO_URL"

# Check if remote was added successfully
if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully!"
else
    echo "⚠️ Remote origin might already exist. Continuing..."
fi

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully!"
else
    echo "❌ Failed to push to GitHub. Please check your repository URL and permissions."
    exit 1
fi

# Push tags
echo "🏷️ Pushing tags..."
git push origin v1.0.0

if [ $? -eq 0 ]; then
    echo "✅ Tags pushed successfully!"
else
    echo "⚠️ Failed to push tags. You can push them manually later."
fi

echo ""
echo "🎉 Successfully pushed to GitHub!"
echo "📋 Repository URL: https://github.com/$GITHUB_USERNAME/life-science-standard-register"
echo ""
echo "📖 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Add repository description and topics"
echo "3. Create a release (v1.0.0)"
echo "4. Set up branch protection rules"
echo "5. Enable GitHub Pages (optional)"
echo ""
echo "📚 For detailed instructions, see:"
echo "- GITHUB_REPOSITORY_SETUP.md"
echo "- GIT_SETUP_GUIDE.md"
