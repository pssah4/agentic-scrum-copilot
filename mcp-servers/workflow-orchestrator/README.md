# Workflow Orchestrator MCP Server

**Ein Model Context Protocol Server für intelligente Multi-Agent Orchestrierung in GitHub Copilot**

---

## 🎯 Überblick

Dieser MCP Server ermöglicht es GitHub Copilot, spezialisierte Chatmode Sub-Agenten automatisch zu orchestrieren, Workflow-State zu lesen und Quality Gates zu enforced.

**Kern-Funktionalität:**
- 📊 Workflow-State aus BACKLOG.md, ARC42-DOCUMENTATION.md lesen
- 🎯 Passenden Sub-Agent empfehlen (5-Step Decision Algorithm)
- 🚀 Sub-Agent programmatisch aufrufen (invoke_agent)
- 🔄 Multi-Step Workflows orchestrieren
- 🛡️ Quality Gates enforced (QG1, QG2, QG3)

---

## 📦 Installation

```bash
# Dependencies installieren
npm install

# TypeScript kompilieren
npm run build

# Server starten (für Testing)
npm start
```

---

## 🔧 Bereitgestellte Tools

### 1. **get_workflow_state**

Liest den aktuellen Workflow-Zustand.

**Input:** Keine

**Output:**
```typescript
{
  phase: "requirements" | "architecture" | "development" | "debugging",
  qg1Status: "pending" | "approved" | "rejected",
  qg2Status: "pending" | "approved" | "rejected",
  qg3Status: "pending" | "approved" | "rejected",
  errorLogs: string[],
  openTasks: string[],
  requirementsCount: number,
  architectureComplete: boolean
}
```

**Verwendung in Copilot:**
```
Analysiere den aktuellen Workflow-State
```

---

### 2. **recommend_agent**

Empfiehlt den passenden Sub-Agent basierend auf Request und State.

**Input:**
- `userRequest: string` - Der User-Request

**Output:**
```typescript
{
  agent: "requirements-engineer" | "architect" | "developer" | "debugger",
  reasoning: string,
  contextFiles: string[],
  optimizedPrompt: string,
  priority: "low" | "medium" | "high" | "critical",
  prerequisites: string[],
  estimatedDuration: string
}
```

**Decision Algorithm:**
1. Check for error logs (highest priority) → @debugger
2. Analyze user request keywords
3. Check current workflow phase
4. Apply phase-based validation (Quality Gates)
5. Make final agent selection

**Verwendung in Copilot:**
```
Welcher Agent ist für "Ich will ein Login Feature" zuständig?
```

---

### 3. **invoke_agent** ⭐ **Kern-Tool!**

Ruft einen Sub-Agent programmatisch auf und sammelt das Ergebnis.

**Input:**
- `agent: AgentName` - Der aufzurufende Agent
- `prompt: string` - Der optimierte Prompt für den Agent
- `contextFiles?: string[]` - Relevante Context-Files

**Output:**
```typescript
{
  agent: string,
  success: boolean,
  output: string,
  filesCreated: string[],
  filesModified: string[],
  duration: number,
  error?: string
}
```

**Kommunikations-Mechanismus:**

Da VS Code API keinen direkten programmatischen Chatmode-Aufruf erlaubt, nutzt der Server einen **File-basierten Kommunikations-Ansatz**:

1. **Task-File schreiben:** `.mcp/queue/{agent}-{timestamp}.json`
2. **Agent liest Queue:** (via VS Code Automation oder Manual)
3. **Agent schreibt Result:** `.mcp/results/{agent}-{timestamp}.json`
4. **Orchestrator liest Result:** Parsed und returned

**Alternative (für Production):**
- VS Code Extension mit direktem API-Zugriff entwickeln
- WebSocket-basierte Kommunikation
- HTTP-basierter Agent-Service

**Verwendung in Copilot:**
```
Rufe @requirements-engineer auf mit "Definiere Login Feature"
```

---

### 4. **execute_workflow**

Führt einen Multi-Step Workflow aus (mehrere Agenten sequenziell).

**Input:**
- `steps: AgentName[]` - Array von Agent-Namen in Ausführungs-Reihenfolge
- `initialPrompt: string` - Der initiale User-Request

**Output:**
```typescript
AgentInvocationResult[]  // Array von Results
```

**Beispiel:**
```typescript
steps: ["requirements-engineer", "architect", "developer"]
initialPrompt: "Ich will ein Login Feature"

// Führt automatisch aus:
// 1. @requirements-engineer → Erstellt FEATURE-XXX
// 2. @architect → Erstellt ADRs + Tasks
// 3. @developer → Implementiert Code + Tests
```

**Verwendung in Copilot:**
```
Führe kompletten Workflow für "Login Feature" aus
```

---

## 🏗️ Architektur

### Klassen-Struktur

```
WorkflowOrchestrator
├── getWorkflowState()          # Liest BACKLOG.md, ARC42-DOC, Logs
├── recommendAgent()            # 5-Step Decision Algorithm
├── invokeAgent()               # Ruft Sub-Agent auf (Kern!)
├── executeWorkflow()           # Multi-Step Orchestration
├── scoreKeywords()             # Hilfsfunktion: Keyword-Scoring
└── estimateDuration()          # Hilfsfunktion: Dauer-Schätzung
```

### Workflow-State-Bestimmung

```typescript
// Priority 1: Error Logs
if (errorLogs.length > 0) → phase = "debugging"

// Priority 2: QG1 Status
else if (qg1Status !== "approved") → phase = "requirements"

// Priority 3: QG2 Status
else if (qg2Status !== "approved") → phase = "architecture"

// Default: Development
else → phase = "development"
```

### Agent-Recommendation Algorithm

```typescript
1. CHECK error logs
   → IF exists: return @debugger (CRITICAL)

2. CHECK current phase
   → IF "requirements": return @requirements-engineer
   → IF "architecture": return @architect

3. ANALYZE keywords
   → Score all agents
   → Best match wins

4. APPLY phase validation
   → IF user wants "implement" but phase = "requirements"
      → BLOCK and return @requirements-engineer

5. RETURN recommendation with reasoning
```

---

## 🔍 Debugging

### Server-Logs aktivieren

```bash
# Starte Server mit Debug-Logs
DEBUG=true npm start

# Oder setze in .env
DEBUG=true
```

### Logs prüfen

```bash
# VS Code Output Panel
# View → Output → Select "GitHub Copilot"

# Oder stderr direkt
npm start 2>&1 | tee server.log
```

### Häufige Probleme

**Problem:** Server startet nicht

```bash
# Prüfe Node Version
node --version  # Muss >=18 sein

# Reinstall Dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Tools werden nicht erkannt

```bash
# Prüfe VS Code Settings
cat ../../.vscode/settings.json

# Reload VS Code
# Cmd/Ctrl + Shift + P → "Reload Window"
```

**Problem:** Agent-Invocation hängt

```bash
# Prüfe Queue
ls -la ../../.mcp/queue/

# Prüfe Results
ls -la ../../.mcp/results/

# Timeout-Settings anpassen in .env
RESULT_TIMEOUT=600  # 10 Minuten
```

---

## 🧪 Testing

### Unit Tests (Coming Soon)

```bash
npm test
```

### Manual Testing

```bash
# 1. Server starten
npm start

# 2. In anderem Terminal: Test-Request senden
echo '{"tool":"get_workflow_state"}' | npm start

# 3. Prüfe Output
```

### Integration Testing mit VS Code

1. Öffne VS Code mit Projekt
2. Öffne Copilot Chat
3. Gib Request: `"Analysiere Workflow-State"`
4. Prüfe ob Tool aufgerufen wird (Output Panel)

---

## ⚙️ Konfiguration

### Environment Variables

Siehe `.env.example` im Root-Verzeichnis.

**Wichtigste Variablen:**
- `WORKSPACE_ROOT` - Pfad zum Workspace
- `MCP_LOG_LEVEL` - Log-Level (debug, info, warn, error)
- `AGENT_TIMEOUT` - Timeout für Agent-Calls in Sekunden
- `QG_STRICT_MODE` - Quality Gate Enforcement aktivieren

### VS Code Settings

```json
{
  "github.copilot.chat.mcp.servers": {
    "workflow-orchestrator": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-servers/workflow-orchestrator/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}",
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

---

## 📊 Performance

### Typische Ausführungszeiten

| Tool | Durchschnitt | Max |
|------|-------------|-----|
| get_workflow_state | 50-100ms | 200ms |
| recommend_agent | 100-200ms | 500ms |
| invoke_agent | 30-120s | 300s (5min) |
| execute_workflow | 2-10min | 30min |

### Optimierungs-Tipps

- ✅ Caching aktivieren für Workflow-State
- ✅ Parallele Agent-Execution wo möglich
- ✅ Timeout-Werte anpassen
- ✅ Streaming für lange Workflows

---

## 🔐 Sicherheit

### Best Practices

- ✅ **Keine Secrets in Code** - Nur via .env
- ✅ **Input Validation** - Alle User-Inputs validieren
- ✅ **File-Path Sanitization** - Path Traversal verhindern
- ✅ **Timeout Enforcement** - Verhindert Hangs
- ✅ **Error Handling** - Try-Catch überall

### Audit-Logging

Alle Tool-Aufrufe werden geloggt:
```
[MCP Server] Tool called: invoke_agent
[Orchestrator] Invoking agent: @developer
[Orchestrator] Prompt: "Implement login..."
```

---

## 🚀 Deployment

### Lokale Entwicklung

```bash
npm run dev  # Watch-Mode mit Auto-Reload
```

### Production Build

```bash
npm run build
npm start
```

### Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY build ./build
CMD ["node", "build/index.js"]
```

---

## 📚 Weitere Ressourcen

- **[MCP Protocol Specification](https://spec.modelcontextprotocol.io/)**
- **[Parent README](../../README.md)**
- **[Pattern Card](../../docs/PATTERN-Multi-Agent-Orchestration-MCP.md)**
- **[TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)**

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-08  
**Maintainer:** Agentic Scrum Team
