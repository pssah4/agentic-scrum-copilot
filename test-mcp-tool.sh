#!/bin/bash
# Interactive test for MCP Server tools

echo "🧪 Testing MCP Server Tool: get_workflow_state"
echo ""

cd "$(dirname "$0")"
export WORKSPACE_ROOT="/home/hankese/dev/agentic-scrum-demo"
export MCP_LOG_LEVEL="info"

# Create a test request in MCP JSON-RPC format
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_workflow_state",
    "arguments": {}
  }
}' | node mcp-servers/workflow-orchestrator/build/index.js 2>&1 | grep -A 20 '"result"'

echo ""
echo "✅ Test completed. Check output above."
