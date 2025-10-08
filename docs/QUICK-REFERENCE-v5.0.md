# Quick Reference: v5.0 Mandatory MCP Auto-Start

## 🚀 What Changed?

**The Copilot Agent Orchestrator NOW automatically starts the MCP server at the beginning of EVERY session.**

---

## 📋 New Startup Sequence

```
User Makes Request
    ↓
🤖 Copilot AUTOMATICALLY runs:
    ./setup-mcp-server.sh
    ↓
📊 Copilot informs user:
    "🤖 Initializing MCP Server..."
    ↓
⏳ Script executes (~30 seconds)
    ↓
✅ Success? → User reloads VS Code
❌ Failure? → Copilot tries manual fix
    ↓
🎯 MCP Tools Available
    ↓
🚀 Normal workflow continues
```

---

## 🎯 Key Rules

### ✅ DO (Copilot Agent)
1. **Run setup script immediately** - No waiting
2. **Use `run_in_terminal` tool** - Automatic execution
3. **Inform user during setup** - Clear communication
4. **Guide user to reload** - Step-by-step instructions
5. **Check for success** - Verify MCP tools available

### ❌ DON'T (Copilot Agent)
1. **Ask permission first** - Just execute
2. **Skip the setup step** - Always required
3. **Wait for user confirmation** - Automatic process
4. **Proceed without trying MCP** - Must attempt first
5. **Give up after one failure** - Try manual fix

---

## 🔍 What You'll See (User)

### On First Interaction

**Before any work begins:**

```
🤖 Initializing MCP Server...

I'm automatically setting up the workflow orchestrator MCP server.
This ensures I have access to intelligent agent routing capabilities.

⏳ Running setup script... (this takes ~30 seconds)
```

### After Setup Completes

**Success:**

```
✅ MCP Server Ready!

The workflow orchestrator is now active. 

📋 Next Step: Please reload VS Code to activate the server
   - Press Cmd/Ctrl + Shift + P
   - Type "Reload Window"  
   - Press Enter

After reload, I'll have full MCP-enhanced orchestration capabilities!
```

**Failure (automatic recovery):**

```
⚠️ Setup script encountered issues. Attempting manual fix...

[Runs: cd mcp-servers/workflow-orchestrator && npm install && npm run build]
```

---

## 🛠️ For Developers

### Testing the Auto-Start

1. Open a fresh VS Code window
2. Start a new Copilot chat
3. Make ANY request (e.g., "Hello")
4. Observe automatic `./setup-mcp-server.sh` execution
5. Follow reload prompt
6. Verify MCP tools work after reload

### Setup Script Location

```bash
./setup-mcp-server.sh
```

This script:
- Checks Node.js/npm prerequisites
- Installs dependencies (`npm install`)
- Builds TypeScript (`npm run build`)
- Verifies build output
- Makes executable

### Manual Fix Command

If auto-setup fails 2+ times:

```bash
cd mcp-servers/workflow-orchestrator
npm install && npm run build
cd ../..
```

---

## 🎓 Why This Change?

### Before v5.0
- ❌ Users had to manually run setup script
- ❌ MCP server often not started
- ❌ Confusing "MCP not available" errors
- ❌ Manual troubleshooting required

### After v5.0
- ✅ Automatic setup on first use
- ✅ MCP server always attempted
- ✅ Clear user communication
- ✅ Guided reload process
- ✅ Automatic error recovery

---

## 📞 Troubleshooting

### "Setup script keeps failing"

**Check:**
1. Node.js installed? (`node --version`)
2. npm installed? (`npm --version`)
3. In project root directory?
4. `mcp-servers/workflow-orchestrator/` exists?

**Manual fix:**
```bash
cd mcp-servers/workflow-orchestrator
rm -rf node_modules
npm install
npm run build
cd ../..
```

### "MCP tools still unavailable after reload"

**Check:**
1. Did you reload VS Code window? (Cmd/Ctrl+Shift+P → "Reload Window")
2. Check `.vscode/settings.json` for MCP configuration
3. Check VS Code Output panel for MCP server logs
4. Try manual orchestration as fallback

### "Script runs but build fails"

**Check:**
1. TypeScript compiler installed? (`npm list typescript`)
2. Check `mcp-servers/workflow-orchestrator/package.json`
3. Try `npm run build` manually in the directory
4. Check for TypeScript syntax errors in `src/index.ts`

---

## 🔗 Related Documentation

- `docs/CHANGELOG-v5.0-Mandatory-MCP-Startup.md` - Full changelog
- `.github/copilot-instructions.md` - Complete instructions
- `setup-mcp-server.sh` - Setup script source
- `mcp-servers/workflow-orchestrator/README.md` - MCP server docs

---

**Version:** 5.0  
**Type:** Mandatory Auto-Start Protocol  
**Status:** ✅ Active  
**Date:** October 8, 2025
