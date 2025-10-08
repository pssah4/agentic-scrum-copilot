#!/bin/bash

# ============================================================================
# Setup Script for Workflow Orchestrator MCP Server
# ============================================================================
#
# This script automates the setup of the MCP server required for
# intelligent agent orchestration in GitHub Copilot.
#
# Usage: ./setup-mcp-server.sh
#
# ============================================================================

set -e  # Exit on error

echo ""
echo "🤖 Agentic Scrum - MCP Server Setup"
echo "===================================="
echo ""

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    echo ""
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    echo ""
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm found: $NPM_VERSION"
echo ""

# Navigate to MCP server directory
MCP_DIR="mcp-servers/workflow-orchestrator"

if [ ! -d "$MCP_DIR" ]; then
    echo "❌ MCP server directory not found: $MCP_DIR"
    echo ""
    echo "Are you running this from the project root?"
    exit 1
fi

echo "📂 Navigating to $MCP_DIR..."
cd "$MCP_DIR"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "   This may take a minute..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Verify build
if [ ! -f "build/index.js" ]; then
    echo "❌ Build verification failed: build/index.js not found"
    exit 1
fi

echo "✅ Build successful: build/index.js created"

# Make executable
chmod +x build/index.js
echo "✅ Made executable"

# Return to project root
cd ../..

# Create .mcp directories
echo ""
echo "📁 Creating .mcp directories..."
mkdir -p .mcp/queue
mkdir -p .mcp/results
echo "✅ Created .mcp/queue and .mcp/results directories"

# Check VS Code settings
echo ""
echo "📋 Verifying VS Code configuration..."

if [ ! -f ".vscode/settings.json" ]; then
    echo "⚠️  Warning: .vscode/settings.json not found"
    echo "   MCP server may not be configured in VS Code"
else
    echo "✅ VS Code settings found"
fi

# Success message
echo ""
echo "============================================"
echo "✅ MCP Server setup complete!"
echo "============================================"
echo ""
echo "📋 Next steps:"
echo ""
echo "   1. Reload VS Code window"
echo "      - Press Cmd/Ctrl + Shift + P"
echo "      - Type 'Reload Window'"
echo "      - Press Enter"
echo ""
echo "   2. Start a new Copilot Chat session"
echo ""
echo "   3. Verify MCP server is working:"
echo "      - In chat, ask: 'Is the MCP server available?'"
echo "      - Copilot should confirm MCP tools are accessible"
echo ""
echo "🎯 You're ready to use autonomous agent orchestration!"
echo ""
