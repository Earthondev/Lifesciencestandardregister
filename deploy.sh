#!/bin/bash

# 🚀 Deploy Script for Life Science Standards Register
# This script helps deploy the project to various platforms

echo "🚀 Life Science Standards Register - Deploy Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Login to Vercel: vercel login"
    echo "3. Deploy: vercel --prod"
    echo ""
    echo "🌐 Or visit: https://vercel.com/new"
    echo "   Import from: https://github.com/Earthondev/Lifesciencestandardregister"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "📦 Deploying to Netlify..."
    echo "1. Install Netlify CLI: npm i -g netlify-cli"
    echo "2. Login to Netlify: netlify login"
    echo "3. Build: npm run build"
    echo "4. Deploy: netlify deploy --prod --dir=out"
    echo ""
    echo "🌐 Or visit: https://app.netlify.com/start"
    echo "   Import from: https://github.com/Earthondev/Lifesciencestandardregister"
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo "📦 Deploying to GitHub Pages..."
    echo "1. Push the GitHub Actions workflow to main branch"
    echo "2. Go to: https://github.com/Earthondev/Lifesciencestandardregister/settings/pages"
    echo "3. Select 'Source': 'GitHub Actions'"
    echo "4. The workflow will automatically deploy on next push"
    echo ""
    echo "🌐 Repository: https://github.com/Earthondev/Lifesciencestandardregister"
}

# Function to deploy to Railway
deploy_railway() {
    echo "📦 Deploying to Railway..."
    echo "1. Visit: https://railway.app"
    echo "2. Sign up with GitHub"
    echo "3. Click 'New Project' > 'Deploy from GitHub repo'"
    echo "4. Select: Earthondev/Lifesciencestandardregister"
    echo "5. Configure environment variables"
    echo ""
    echo "🌐 Railway: https://railway.app"
}

# Main menu
echo "Select deployment platform:"
echo "1) Vercel (Recommended for Next.js)"
echo "2) Netlify"
echo "3) GitHub Pages"
echo "4) Railway"
echo "5) Show all options"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        deploy_github_pages
        ;;
    4)
        deploy_railway
        ;;
    5)
        echo "🚀 All Deployment Options:"
        echo "========================="
        deploy_vercel
        echo ""
        deploy_netlify
        echo ""
        deploy_github_pages
        echo ""
        deploy_railway
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment instructions completed!"
echo ""
echo "📋 Next steps:"
echo "1. Follow the instructions above"
echo "2. Set up environment variables"
echo "3. Test the deployed application"
echo "4. Set up custom domain (optional)"
echo ""
echo "🎉 Good luck with your deployment!"
