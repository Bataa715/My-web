#!/bin/bash
# GitHub Secrets Setup Script using GitHub CLI

echo "🔧 GitHub Secrets тохируулах скрипт"
echo "===================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) суулгаагүй байна"
    echo "📦 Суулгах: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "🔐 GitHub-д нэвтэрнэ үү..."
    gh auth login
fi

echo "✅ GitHub CLI бэлэн"
echo ""

# Read environment variables from .env.local
ENV_FILE="apps/nextn/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE файл олдсонгүй"
    exit 1
fi

echo "📖 Environment variables уншиж байна..."
echo ""

# Function to set GitHub secret
set_secret() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "⚠️  $key - хоосон утга, алгассан"
        return
    fi
    
    echo "🔒 $key тохируулж байна..."
    echo "$value" | gh secret set "$key"
    
    if [ $? -eq 0 ]; then
        echo "✅ $key амжилттай"
    else
        echo "❌ $key алдаа гарлаа"
    fi
    echo ""
}

# Read and set each secret
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    set_secret "$key" "$value"
done < "$ENV_FILE"

echo ""
echo "🎉 Бүх secrets тохируулагдлаа!"
echo ""
echo "🔍 Баталгаажуулах:"
echo "gh secret list"
