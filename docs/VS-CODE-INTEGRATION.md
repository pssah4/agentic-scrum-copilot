# VS Code Integration Guide

## 🎯 MCP Server Setup in VS Code

Der Workflow Orchestrator MCP Server ist jetzt in VS Code konfiguriert und kann von GitHub Copilot genutzt werden.

## 📋 Setup-Schritte (bereits erledigt)

### 1. ✅ MCP Server gebaut
```bash
cd mcp-servers/workflow-orchestrator
npm install
npm run build
```

### 2. ✅ VS Code Settings konfiguriert

Die Datei `.vscode/settings.json` enthält:

```json
{
  "github.copilot.chat.mcpServers": {
    "workflow-orchestrator": {
      "command": "node",
      "args": [
        "${workspaceFolder}/mcp-servers/workflow-orchestrator/build/index.js"
      ],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}",
        "MCP_LOG_LEVEL": "info",
        "AGENT_TIMEOUT": "300000",
        "QG_STRICT_MODE": "true"
      }
    }
  }
}
```

### 3. ✅ Empfohlene Extensions

Die Datei `.vscode/extensions.json` empfiehlt:
- `github.copilot`
- `github.copilot-chat`

## 🚀 Wie es funktioniert

### VS Code Startup

Wenn du VS Code öffnest:

1. **VS Code liest** `.vscode/settings.json`
2. **Startet automatisch** den MCP Server als Child-Process:
   ```bash
   node ${workspaceFolder}/mcp-servers/workflow-orchestrator/build/index.js
   ```
3. **Übergibt Environment-Variablen** (WORKSPACE_ROOT, etc.)
4. **Kommuniziert via stdio** (Standard Input/Output)

### GitHub Copilot Nutzung

Wenn du mit GitHub Copilot chattest:

1. **Copilot sendet Anfrage** an Orchestrator (z.B. "Implement user authentication")
2. **Orchestrator analysiert** → 5-Step Decision Algorithm
3. **Orchestrator ruft Tool auf**:
   - `get_workflow_state()` → Liest BACKLOG.md, ARC42-DOCUMENTATION.md
   - `recommend_agent()` → Empfiehlt @requirements-engineer / @architect / @developer
   - `invoke_agent()` → Schreibt Task zu `.mcp/queue/{agent}-{timestamp}.json`
4. **Sub-Agent arbeitet** → Schreibt Ergebnis zu `.mcp/results/{agent}-{timestamp}.json`
5. **Orchestrator liest Ergebnis** → Gibt zurück an Copilot

## 🔍 Debugging

### MCP Server Logs anzeigen

```bash
# Erhöhe Log-Level in .vscode/settings.json
"MCP_LOG_LEVEL": "debug"
```

Dann in VS Code:
- `Cmd/Ctrl + Shift + P` → "Developer: Show Logs..."
- Wähle "Extension Host"

### Manueller Server-Test

```bash
# Terminal-Test (Server startet und wartet auf stdin)
./test-mcp-server.sh
```

### Tool-Test (JSON-RPC Request)

```bash
# Test eines einzelnen Tools
./test-mcp-tool.sh
```

## 📊 Verfügbare Tools

Der MCP Server stellt 4 Tools zur Verfügung:

### 1. `get_workflow_state`
```typescript
// Returns: { phase, qg1Status, qg2Status, qg3Status, errorLogs, openTasks }
```

### 2. `recommend_agent`
```typescript
// Input: { userRequest: string }
// Returns: { agent, reasoning, context, priority }
```

### 3. `invoke_agent`
```typescript
// Input: { agent: string, task: string, context?: object }
// Returns: { success, output, filesModified }
```

### 4. `execute_workflow`
```typescript
// Input: { steps: Array<{ agent, task }> }
// Returns: { results: Array<AgentInvocationResult> }
```

## 🎓 Beispiel-Nutzung in Copilot Chat

### Beispiel 1: Neues Feature
```
User: "I want to add user authentication"

Copilot (intern):
1. Ruft get_workflow_state() auf → Phase: "requirements"
2. Ruft recommend_agent() auf → Empfiehlt: @requirements-engineer
3. Zeigt Empfehlung dem User

Copilot (an User):
"Ich empfehle @requirements-engineer, weil..."
```

### Beispiel 2: Implementierung
```
User: "Implement the login API"

Copilot (intern):
1. get_workflow_state() → Phase: "architecture" (QG2 nicht approved)
2. recommend_agent() → Empfiehlt: @architect (blockiert Development)
3. Zeigt Warnung

Copilot (an User):
"Die Architektur fehlt noch. Ich aktiviere @architect..."
```

## ⚠️ Troubleshooting

### Problem: MCP Server startet nicht

**Symptom:** Copilot zeigt keine Tool-Empfehlungen

**Lösung:**
```bash
# 1. Prüfe ob build/ existiert
ls mcp-servers/workflow-orchestrator/build/

# 2. Rebuild wenn nötig
cd mcp-servers/workflow-orchestrator
npm run build

# 3. Reload VS Code Window
Cmd/Ctrl + Shift + P → "Reload Window"
```

### Problem: Tools werden nicht aufgerufen

**Symptom:** Copilot antwortet normal, nutzt aber keine Tools

**Lösung:**
- Stelle sicher, dass GitHub Copilot Chat Extension installiert ist
- Prüfe `.vscode/settings.json` Syntax
- Prüfe MCP Server Logs (siehe oben)

### Problem: Workspace-Root falsch

**Symptom:** Fehler "Cannot read BACKLOG.md"

**Lösung:**
```json
// In .vscode/settings.json:
"env": {
  "WORKSPACE_ROOT": "${workspaceFolder}",  // Nutzt VS Code Variable
  ...
}
```

## 🎉 Erfolgreiche Integration testen

1. **Öffne VS Code** in diesem Workspace
2. **Öffne GitHub Copilot Chat** (`Cmd/Ctrl + Shift + I`)
3. **Stelle eine Frage:**
   ```
   What's the current workflow state?
   ```
4. **Erwartete Antwort:** Copilot nutzt `get_workflow_state()` Tool und zeigt:
   - Current phase
   - QG1/QG2/QG3 Status
   - Error logs (if any)
   - Open tasks

## 📚 Weitere Dokumentation

- **MCP Server Details:** `mcp-servers/workflow-orchestrator/README.md`
- **Pattern Card:** `docs/PATTERN-Multi-Agent-Orchestration-MCP.md`
- **Orchestrator Instructions:** `.github/copilot-instructions.md`

---

**Status:** ✅ VS Code Integration vollständig konfiguriert  
**Next Step:** End-to-End Testing mit echten Copilot-Requests
