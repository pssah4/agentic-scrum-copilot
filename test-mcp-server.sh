#!/bin/bash
# Test script for MCP Server

echo "🧪 Testing MCP Server startup..."
echo ""

cd "$(dirname "$0")"
export WORKSPACE_ROOT="/home/hankese/dev/agentic-scrum-demo"
export MCP_LOG_LEVEL="debug"

echo "📂 Workspace: $WORKSPACE_ROOT"
echo "🔧 Starting MCP Server..."
echo ""

# Run server with timeout (will exit after 3 seconds)
timeout 3 node mcp-servers/workflow-orchestrator/build/index.js 2>&1 | head -20

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 124 ]; then
    echo "✅ Server started successfully (timed out as expected)"
    echo "   The MCP Server is waiting for stdio input from VS Code."
elif [ $EXIT_CODE -eq 0 ]; then
    echo "⚠️  Server exited immediately (check logs above)"
else
    echo "❌ Server failed with exit code: $EXIT_CODE"
fi
