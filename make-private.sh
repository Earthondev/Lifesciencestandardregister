#!/bin/bash

# 🔒 Make Repository Private Script
# This script helps make the GitHub repository private and secure

echo "🔒 Making Life Science Standards Register Private and Secure"
echo "=========================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it first:"
    echo "   brew install gh"
    echo "   or visit: https://cli.github.com/"
    exit 1
fi

# Check if user is logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged in to GitHub CLI. Please login first:"
    echo "   gh auth login"
    exit 1
fi

echo "🔍 Current repository status:"
gh repo view --json visibility,name,owner

echo ""
echo "⚠️  WARNING: This will make the repository PRIVATE!"
echo "   Only you and invited collaborators will be able to access it."
echo "   The repository will no longer be visible to the public."
echo ""

read -p "Are you sure you want to make this repository private? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo "🔒 Making repository private..."
    
    # Make repository private
    gh repo edit --visibility private
    
    if [ $? -eq 0 ]; then
        echo "✅ Repository is now PRIVATE!"
        echo ""
        echo "🔐 Next steps for security:"
        echo "1. Add collaborators: gh repo invite USERNAME"
        echo "2. Set up branch protection: gh api repos/OWNER/REPO/branches/main/protection"
        echo "3. Configure deployment with password protection"
        echo "4. Set up environment variables securely"
        echo ""
        echo "🌐 Repository URL: https://github.com/Earthondev/Lifesciencestandardregister"
        echo "   (Only accessible to you and invited collaborators)"
    else
        echo "❌ Failed to make repository private. Please check your permissions."
        exit 1
    fi
else
    echo "❌ Operation cancelled. Repository remains public."
    exit 0
fi

echo ""
echo "🛡️  Security recommendations:"
echo "1. Use strong passwords for deployment platforms"
echo "2. Enable 2FA on all accounts"
echo "3. Set up IP whitelist if possible"
echo "4. Use service accounts for Google Sheets"
echo "5. Enable audit logs"
echo ""
echo "📖 For detailed security setup, see: PRIVATE_DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Repository is now secure and private!"
