# **Pattern Card: Multi-Agent Orchestration mit MCP Server in GitHub Copilot**

**Pattern-ID:** PATTERN-001  
**Version:** 1.0  
**Datum:** 2025-10-08  
**Status:** ✅ Produktiv  
**Repository:** https://github.com/pssah4/agentic-scrum-copilot

---

## **Kernidee**

Der **Default Copilot Chat Agent** (der Agent ohne @-Präfix) fungiert als intelligenter Orchestrator, konfiguriert durch erweiterte Instructions (`.github/copilot-instructions.md`). Er nutzt einen **MCP Server als Tool** zur Workflow-Analyse und ruft spezialisierte **@-Chatmodes** (Sub-Agenten) auf, um Multi-Step Software-Development-Workflows zu automatisieren und Quality Gates zu enforcen - ohne manuelle Mode-Wechsel durch den User.

**Warum der Default Agent?**
- ✅ Kann MCP Server Tools nutzen (VS Code Integration)
- ✅ Kann andere @-Chatmodes programmatisch aufrufen
- ✅ Liest erweiterte `copilot-instructions.md` 
- ✅ Zugriff auf alle VS Code APIs

**Die @-Chatmodes sind Sub-Agenten:**
- @requirements-engineer, @architect, @developer, @debugger
- Spezialisiert auf einzelne Workflow-Phasen
- **Können NICHT** andere Modes aufrufen
- **Können NICHT** MCP Server Tools nutzen

**In einem Satz:**
> "Der User gibt einen High-Level Request an den Default Copilot Agent (Orchestrator), dieser nutzt den MCP Server als Tool um Workflow-State zu analysieren, wählt passende @-Chatmodes aus, delegiert Aufgaben mit Kontext und sammelt Ergebnisse - vollautomatisch."

---

## **1. Problem**

### Wiederkehrende Herausforderungen:

**Problem 1: Manuelle Agent-Koordination**
- User muss manuell zwischen Chatmodes wechseln (@requirements-engineer → @architect → @developer)
- Workflow-State geht zwischen Mode-Wechseln verloren
- Keine automatische Quality-Gate-Validierung

**Problem 2: Fehlende Workflow-Intelligenz**
- User kann Quality Gates überspringen (z.B. direkt Code schreiben ohne Requirements)
- Kein zentrales State-Management (QG1, QG2, QG3 Status)
- Sub-Agenten haben keinen Kontext aus vorherigen Steps

**Problem 3: Keine Rückkopplung zwischen Agenten**
- Developer findet unklare Requirements → Muss manuell zurück zu Requirements Engineer
- Error-Logs werden nicht automatisch an Debugger weitergeleitet
- Keine End-to-End Orchestrierung

**Beispiel-Szenario:**
```
User: "Ich will ein Login-Feature"

❌ Ohne Orchestrator:
1. User: @requirements-engineer Login Feature
2. Requirements Engineer: Erstellt FEATURE-042
3. User: @architect FEATURE-042 designen
4. Architect: Erstellt ADRs, Tasks
5. User: @developer TASK-001 implementieren
6. Developer: Code + Tests
7. Tests schlagen fehl
8. User: Muss manuell @debugger aktivieren

✅ Mit Orchestrator (Default Copilot Agent + MCP Server):
1. User: "Ich will ein Login-Feature" (an Default Agent ohne @-Präfix)
2. Default Copilot Agent (Orchestrator):
   → Nutzt MCP Tool get_workflow_state() → Phase: "requirements"
   → Nutzt MCP Tool recommend_agent() → Empfehlung: @requirements-engineer
   → Aktiviert @requirements-engineer
   → Sammelt Ergebnis (FEATURE-042)
   → Nutzt MCP Tool get_workflow_state() → Phase: "architecture"
   → Aktiviert @architect
   → Sammelt Ergebnis (Tasks)
   → Aktiviert @developer
   → Tests schlagen fehl → Aktiviert @debugger
   → Alle Tests passed ✅
3. User: Erhält fertiges, getestetes Feature
```

---

## **2. Kontext**

### Wo tritt das Problem auf?

**Technischer Kontext:**
- GitHub Copilot Chat in VS Code
- Multi-Agent Software-Entwicklungs-Workflows
- Komplexe Projekte mit Requirements → Architecture → Development → Testing Phasen

**Organisatorischer Kontext:**
- Teams die strukturierte Workflows brauchen (z.B. nach Scrum)
- Projekte mit Quality Gates (z.B. ISO, GDPR Compliance)
- Autonome Entwicklungs-Workflows

### Rahmenbedingungen:

**✅ Voraussetzungen (Prerequisites):**
- GitHub Copilot Subscription (Pro, Enterprise)
- VS Code mit Copilot Chat Extension
- Node.js 18+ für MCP Server
- Strukturiertes Projekt-Setup (BACKLOG.md, ARC42-DOCUMENTATION.md)

**⚠️ Constraints:**
- MCP Server läuft lokal (Performance-Impact bei großen Workflows)
- VS Code API Limitierungen (Rate-Limits für Chatmode-Calls)
- Chatmodes sind asynchron (keine Echtzeit-Kommunikation)

**🔄 Trade-offs:**
- **Pro:** Vollautomatische Orchestrierung, Quality-Gate-Enforcement, State-Management
- **Contra:** Zusätzliche Komplexität, Setup-Aufwand, Debugging schwieriger
- **Alternative:** Manuelle Mode-Wechsel (einfacher, aber fehleranfällig)

---

## **3. Lösung (Kurz)**

### Kernidee:

Der **Default Copilot Chat Agent** (Agent Mode ohne @-Präfix) agiert als "Master Orchestrator" (konfiguriert durch erweiterte Instructions) und nutzt einen **MCP Server als Tool** zur Workflow-Analyse und Agent-Orchestrierung.

### Komponenten:

1. **Default Copilot Chat Agent (Master Orchestrator)**
   - Der Agent Mode, den du normal im Chat verwendest (ohne @-Präfix)
   - Konfiguriert durch `.github/copilot-instructions.md`
   - 5-Step Decision Algorithm
   - Delegation Response Pattern
   - 4 Real-World Workflow Examples
   - **Nutzt MCP Server als Tool** für State-Analyse und Agent-Empfehlungen
   - **Kann andere @-Chatmodes aufrufen** (Sub-Agenten)

2. **MCP Server (`workflow-orchestrator`) - Tool für den Orchestrator**
   - Stellt 4 Tools bereit: `get_workflow_state`, `recommend_agent`, `invoke_agent`, `execute_workflow`
   - Liest Workflow-State (BACKLOG.md, ARC42-DOCUMENTATION.md, Error-Logs)
   - Analysiert User-Request (Keywords, Intent)
   - Empfiehlt passenden Sub-Agent basierend auf State
   - Dokumentiert Agent-Invocations via File-Queue (`.mcp/queue/`, `.mcp/results/`)

3. **Spezialisierte @-Chatmodes (Sub-Agenten)**
   - `@requirements-engineer` - Requirements Discovery
   - `@architect` - Technical Architecture
   - `@developer` - Code Implementation
   - `@debugger` - Error Analysis & Fixing
   - **Eingeschränkte Fähigkeiten:** Können KEINE anderen Modes aufrufen, KEINE MCP Tools nutzen

4. **State Management**
   - BACKLOG.md (Requirements, QG1 Status)
   - ARC42-DOCUMENTATION.md (Architecture, QG2 Status)
   - backlog/tasks/*.md (Development Tasks)
   - logs/ERROR-*.md (Test Failures für Debugger)

### Interaktionen:

```
User Request (an Default Agent, OHNE @-Präfix)
    ↓
Default Copilot Agent (Master Orchestrator)
    ↓ (nutzt MCP Server als Tool)
MCP Server: workflow-orchestrator
    ↓ (stellt Tools bereit)
    ├─ get_workflow_state() → Liest BACKLOG.md, ARC42-DOCUMENTATION.md
    └─ recommend_agent() → Keyword-Analyse, Phase-Check
    ↓ (gibt Empfehlung zurück)
Default Copilot Agent (entscheidet & delegiert)
    ↓
    ├─ Aktiviert @requirements-engineer (Sub-Agent)
    │      ↓ (erstellt FEATURE-042)
    ├─ Aktiviert @architect (Sub-Agent)
    │      ↓ (erstellt Tasks)
    └─ Aktiviert @developer (Sub-Agent)
           ↓ (implementiert Code)
Default Copilot Agent aggregiert Results und antwortet User
```

---

## **4. Schritt-für-Schritt Anleitung**

Diese Anleitung ermöglicht es einem Dritten, das Pattern **vollständig nachzubauen**.

### **Übersicht der Schritte:**

**Phase A: Projekt-Setup**
- A1: Workspace-Struktur erstellen
- A2: Chatmodes definieren
- A3: Copilot Instructions erweitern

**Phase B: MCP Server Implementation**
- B1: package.json & TypeScript Setup
- B2: MCP Server Basis-Struktur
- B3: Workflow-State-Reader implementieren
- B4: Agent-Recommendation-Logic implementieren
- B5: Agent-Invocation implementieren (Kern!)
- B6: Multi-Step-Workflow-Engine

**Phase C: VS Code Integration**
- C1: MCP Server registrieren
- C2: Testing & Debugging

**Phase D: Validierung**
- D1: End-to-End Test
- D2: Quality-Gate-Enforcement prüfen

---

### **A) Phase A: Projekt-Setup**

#### **A1: Workspace-Struktur erstellen**

**Was:** Projekt-Ordner mit standardisierter Struktur anlegen

**Warum:** Chatmodes benötigen definierte Dateien (BACKLOG.md, ARC42-DOCUMENTATION.md) für State-Management

**Wie:**

```bash
# 1. Projekt-Root erstellen
mkdir -p agentic-scrum-demo
cd agentic-scrum-demo

# 2. GitHub-spezifische Ordner
mkdir -p .github/chatmodes
mkdir -p .github/instructions
mkdir -p .github/templates

# 3. Requirements-Struktur
mkdir -p requirements/{epics,features,issues,improvements,bugfixes,templates}

# 4. Architecture-Struktur
mkdir -p architecture/{decisions,diagrams,docs}

# 5. Development-Struktur
mkdir -p backlog/tasks
mkdir -p logs
mkdir -p src
mkdir -p tests

# 6. MCP Server Ordner
mkdir -p mcp-servers/workflow-orchestrator/src

# 7. Master-Dokumente erstellen (leer)
touch BACKLOG.md
touch ARC42-DOCUMENTATION.md
touch README.md
```

**Ergebnis-Struktur:**
```
agentic-scrum-demo/
├── .github/
│   ├── chatmodes/          # Hier kommen die 4 Agenten
│   ├── instructions/       # Validierungs-Regeln
│   └── templates/          # EPIC, FEATURE, ISSUE Templates
├── requirements/           # Requirements-Artefakte
├── architecture/           # ADRs, Diagrams
├── backlog/tasks/         # Task-Files für Developer
├── logs/                  # Error-Logs für Debugger
├── mcp-servers/           # Unser MCP Server
├── src/                   # Source Code
├── tests/                 # Test Files
├── BACKLOG.md             # Master Requirements
└── ARC42-DOCUMENTATION.md # Master Architecture
```

---

#### **A2: Chatmodes definieren**

**Was:** 4 spezialisierte Chatmode-Agenten erstellen

**Warum:** Jeder Agent hat spezifische Capabilities und fokussiert auf eine Workflow-Phase

**Wie:**

Erstelle 4 Chatmode-Dateien in `.github/chatmodes/`:

**1. Requirements Engineer** ([Vollständige Datei im Repo](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/requirements-engineer.chatmode.md))
```yaml
---
description: 'Requirements Discovery & BACKLOG.md Management'
model: Claude Sonnet 4.5
tools: ['codebase', 'fetch']
---
```

**2. Architect** ([Vollständige Datei im Repo](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/architect.chatmode.md))
```yaml
---
description: 'Technical Architecture & ARC42-DOCUMENTATION.md'
model: Claude Sonnet 4.5
tools: ['codebase', 'fetch']
---
```

**3. Developer** ([Vollständige Datei im Repo](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/developer.chatmode.md))
```yaml
---
description: 'Code Implementation with mandatory Tests'
model: Claude Sonnet 4.5
tools: ['codebase', 'terminal']
---
```

**4. Debugger** ([Vollständige Datei im Repo](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/debugger.chatmode.md))
```yaml
---
description: 'Error Analysis & Systematic Debugging'
model: Claude Sonnet 4.5
tools: ['codebase', 'terminal']
---
```

**Automatische Validierung:**

Für jeden Chatmode eine `.instructions.md` Datei in `.github/instructions/` erstellen:
- [requirements-engineer.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/requirements-engineer.instructions.md)
- [architect.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/architect.instructions.md)
- [developer.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/developer.instructions.md)
- [debugger.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/debugger.instructions.md)

---

#### **A3: Copilot Instructions erweitern**

**Was:** Default Copilot Agent als "Intelligent Orchestrator" definieren

**Warum:** Der Default Agent (der Agent ohne @-Präfix) muss lernen, wann welcher @-Sub-Agent aktiviert werden soll

**Wie:**

Erstelle `.github/copilot-instructions.md` mit:

**Vollständige Datei:** [copilot-instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/copilot-instructions.md)

**Kern-Komponenten:**
1. **Core Identity** - "You are the Master Orchestrator"
2. **5-Step Decision Algorithm:**
   - Step 1: Check for Error Logs (höchste Priorität)
   - Step 2: Determine Current Workflow Phase (read BACKLOG.md, ARC42-DOCUMENTATION.md)
   - Step 3: Analyze User Request Keywords
   - Step 4: Apply Phase-Based Validation (Quality Gates)
   - Step 5: Make Final Agent Selection
3. **Delegation Response Pattern** - Standardisiertes Format für Agent-Übergaben
4. **4 Real-World Workflow Examples:**
   - New Feature Request
   - Implementation ohne Architecture (blocked)
   - Test Failure (critical priority)
   - Architecture Change Request

**Ergebnis:** Der Master Agent kann jetzt intelligent zwischen Sub-Agenten delegieren.

---

### **B) Phase B: MCP Server Implementation**

#### **B1: package.json & TypeScript Setup**

**Was:** Node.js Projekt mit TypeScript und MCP SDK aufsetzen

**Wie:**

```bash
cd mcp-servers/workflow-orchestrator
npm init -y
npm install @modelcontextprotocol/sdk
npm install --save-dev typescript @types/node
```

**Vollständige Dateien:**
- [package.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/package.json)
- [tsconfig.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/tsconfig.json)

**Scripts:**
```json
{
  "build": "tsc && chmod +x build/index.js",
  "watch": "tsc --watch",
  "start": "node build/index.js"
}
```

---

#### **B2-B6: MCP Server Core Implementation**

**Was:** Der komplette MCP Server mit 4 Tools

**Vollständige Implementation:** [src/index.ts](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/src/index.ts) (680+ Zeilen)

**Kern-Komponenten:**

**1. Type Definitions:**
```typescript
interface WorkflowState {
  phase: "requirements" | "architecture" | "development";
  qg1Status: "not-started" | "in-progress" | "approved";
  qg2Status: "not-started" | "in-progress" | "approved";
  qg3Status: "not-started" | "in-progress" | "approved";
  errorLogs: string[];
  openTasks: string[];
}
```

**2. WorkflowOrchestrator Class:**
- `getWorkflowState()` - Liest BACKLOG.md, ARC42-DOCUMENTATION.md, logs/, tasks/
- `recommendAgent()` - 5-Step Decision Algorithm
- `invokeAgent()` - **Kern-Funktion** - Ruft Sub-Agenten via File-Queue auf
- `executeWorkflow()` - Multi-Step Workflow Orchestration

**3. MCP Server Registration:**
- 4 Tools: `get_workflow_state`, `recommend_agent`, `invoke_agent`, `execute_workflow`
- stdio Transport für VS Code Integration

**4. File-Based Communication Pattern (Option B):**

**Gewählte Strategie:** File-Based Queue System aufgrund VS Code API Limitierungen

**Workflow:**
1. **Default Agent** (Orchestrator) nutzt `invoke_agent()` MCP Tool
2. **MCP Server** schreibt Task nach `.mcp/queue/{agent}-{timestamp}.json`:
   ```json
   {
     "taskId": "requirements-engineer-2025-10-08-1430",
     "agent": "requirements-engineer",
     "prompt": "Define requirements for user authentication feature",
     "contextFiles": ["BACKLOG.md"],
     "timestamp": "2025-10-08T14:30:00",
     "status": "pending"
   }
   ```
3. **Sub-Agent** (@requirements-engineer) wird aktiviert und:
   - Prüft `.mcp/queue/` beim Start
   - Liest Task-Datei
   - Verarbeitet Aufgabe
   - Schreibt Result nach `.mcp/results/{taskId}.json`:
     ```json
     {
       "taskId": "requirements-engineer-2025-10-08-1430",
       "success": true,
       "output": "Created FEATURE-042 with 3 Gherkin scenarios",
       "filesCreated": ["requirements/features/FEATURE-042-user-authentication.md"],
       "filesModified": ["BACKLOG.md"],
       "timestamp": "2025-10-08T14:32:00"
     }
     ```
   - Löscht Task aus Queue
4. **MCP Server** pollt `.mcp/results/` (mit Timeout 5min)
5. **Default Agent** erhält Result und kommuniziert mit User

**Vorteile:**
- ✅ Keine VS Code API Limitierungen
- ✅ Asynchrone Verarbeitung möglich
- ✅ Auditierbar (Logs in Dateien)
- ✅ Sub-Agenten können manuell oder automatisch aktiviert werden

**Nachteile:**
- ⚠️ Polling-Overhead (2s Intervall)
- ⚠️ Sub-Agent muss manuell aktiviert werden (noch keine Automatisierung)
- ⚠️ Timeout nach 5 Minuten

**Details:** Siehe [MCP Server README](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/README.md)

**Build:**
```bash
npm run build  # Kompiliert zu build/index.js
```

---

### **C) Phase C: VS Code Integration**

#### **C1: MCP Server in VS Code registrieren**

**Was:** VS Code Settings konfigurieren, damit GitHub Copilot den MCP Server nutzen kann

**Wie:**

Erstelle `.vscode/settings.json`:

**Vollständige Datei:** [.vscode/settings.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.vscode/settings.json)

```json
{
  "github.copilot.chat.mcpServers": {
    "workflow-orchestrator": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-servers/workflow-orchestrator/build/index.js"],
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

**Zusätzlich:** `.vscode/extensions.json` für empfohlene Extensions

**Ergebnis:** VS Code startet MCP Server automatisch beim Workspace-Load

---

#### **C2: Testing & Debugging**

**Test-Scripts:**
- [test-mcp-server.sh](https://github.com/pssah4/agentic-scrum-copilot/blob/main/test-mcp-server.sh) - Server Startup Test
- [test-mcp-tool.sh](https://github.com/pssah4/agentic-scrum-copilot/blob/main/test-mcp-tool.sh) - Tool Call Test

**Debugging Guide:** [VS-CODE-INTEGRATION.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/docs/VS-CODE-INTEGRATION.md)

**VS Code Logs:**
1. `Cmd/Ctrl + Shift + P` → "Developer: Show Logs..."
2. Wähle "Extension Host"
3. Suche nach "workflow-orchestrator"

---

### **D) Phase D: End-to-End Validierung**

#### **D1: End-to-End Test**

**Was:** Testen ob der komplette Workflow funktioniert

**Test-Szenario:**
```
1. User: "I want to add user authentication"
2. Erwartung: 
   - Copilot nutzt get_workflow_state()
   - Erkennt Phase: "requirements"
   - Empfiehlt @requirements-engineer
   - Zeigt klare Delegation-Message
```

**Validierung:**
- ✅ MCP Server wird von VS Code gestartet
- ✅ Tools werden in Copilot Chat angezeigt
- ✅ get_workflow_state() liefert korrekten State
- ✅ recommend_agent() gibt passende Empfehlung
- ✅ Delegation-Message folgt Pattern

---

#### **D2: Quality-Gate-Enforcement prüfen**

**Test-Szenario:**
```
1. Kein BACKLOG.md existiert (QG1 nicht approved)
2. User: "Implement login API"
3. Erwartung:
   - Copilot blockt Implementation
   - Empfiehlt @requirements-engineer stattdessen
   - Erklärt warum (QG1 fehlt)
```

**Validierung:**
- ✅ Phase-Skipping wird verhindert
- ✅ Fehlende Quality Gates werden erkannt
- ✅ Klare Error-Messages
- ✅ Alternative Lösungswege aufgezeigt

---

## **5. Architektur-Skizze / Diagramme**

```mermaid
graph TB
    User[👤 User: 'Ich will ein Login Feature']
    
    subgraph "🎯 ORCHESTRATOR"
        MA[Default Copilot Agent<br/>Agent Mode OHNE @-Präfix<br/>Master Orchestrator<br/>.github/copilot-instructions.md<br/>5-Step Decision Algorithm]
    end
    
    subgraph "🔧 TOOL für Orchestrator"
        MCP[MCP Server: workflow-orchestrator<br/>stdio Transport]
        Tools[4 Tools:<br/>- get_workflow_state<br/>- recommend_agent<br/>- invoke_agent<br/>- execute_workflow]
        State[State Reader:<br/>- BACKLOG.md<br/>- ARC42-DOCUMENTATION.md<br/>- logs/*.md]
    end
    
    subgraph "Sub-Agenten @-Chatmodes"
        RE[@requirements-engineer<br/>Spezialisiert, eingeschränkt]
        AR[@architect<br/>Spezialisiert, eingeschränkt]
        DE[@developer<br/>Spezialisiert, eingeschränkt]
        DB[@debugger<br/>Spezialisiert, eingeschränkt]
    end
    
    subgraph "Artefakte"
        BL[BACKLOG.md<br/>QG1 Status]
        A42[ARC42-DOCUMENTATION.md<br/>QG2 Status]
        Tasks[backlog/tasks/<br/>TASK-*.md]
        Code[src/<br/>Source Code]
        Logs[logs/<br/>ERROR-*.md]
    end
    
    User -->|Request| MA
    MA -->|ruft MCP Tools auf| MCP
    MCP -->|nutzt| Tools
    Tools -->|lesen| State
    State -.->|liest| BL
    State -.->|liest| A42
    State -.->|liest| Logs
    
    MCP -->|gibt Empfehlung zurück| MA
    
    MA -->|aktiviert| RE
    RE -->|erstellt/updated| BL
    
    MA -->|aktiviert| AR
    AR -->|liest| BL
    AR -->|erstellt/updated| A42
    AR -->|erstellt| Tasks
    
    MA -->|aktiviert| DE
    DE -->|liest| Tasks
    DE -->|erstellt| Code
    DE -->|bei Failure| Logs
    
    MA -->|aktiviert| DB
    DB -->|liest| Logs
    DB -->|fixt| Code
    
    MA -->|Antwort aggregiert| User
    
    style User fill:#e1f5ff
    style MA fill:#ffe1e1
    style MCP fill:#fff4e1
    style RE fill:#e1ffe1
    style AR fill:#e1ffe1
    style DE fill:#e1ffe1
    style DB fill:#e1ffe1
```

---

## **6. Risiken & Gegenmaßnahmen**

### **Risiko 1: VS Code API Limitierungen**

**Problem:** VS Code API erlaubt möglicherweise keinen programmatischen Chatmode-Aufruf

**Wahrscheinlichkeit:** Mittel  
**Impact:** Hoch (Kern-Feature!)

**Gegenmaßnahmen:**
- ✅ Fallback: MCP Server gibt nur Empfehlungen, User aktiviert manuell
- ✅ Alternative: VS Code Extension entwickeln mit direktem API-Zugriff
- ✅ Workaround: File-basierte Kommunikation (Agent schreibt in `.mcp/queue/*.json`)

---

### **Risiko 2: Performance bei großen Workflows**

**Problem:** Multi-Agent-Calls dauern lange (Requirements → Architecture → Development)

**Wahrscheinlichkeit:** Hoch  
**Impact:** Mittel

**Gegenmaßnahmen:**
- ✅ Caching: Workflow-State cachen, nur bei Änderungen neu lesen
- ✅ Parallele Execution: Unabhängige Agenten parallel ausführen
- ✅ Streaming: Partial Results an User zurückgeben
- ✅ Timeout: Max. 5min pro Agent-Call, dann Fallback

---

### **Risiko 3: Debugging-Komplexität**

**Problem:** Fehler in Multi-Agent-Workflows schwer zu tracken

**Wahrscheinlichkeit:** Hoch  
**Impact:** Mittel

**Gegenmaßnahmen:**
- ✅ Structured Logging: Jeder Agent-Call geloggt
- ✅ Trace-IDs: Eindeutige IDs für Request-Chains
- ✅ Debug-Mode: Verbose-Modus für detaillierte Logs
- ✅ State-Snapshots: Workflow-State bei jedem Schritt persistieren

---

### **Risiko 4: Quality-Gate-Bypassing**

**Problem:** User oder Agent umgehen Quality Gates

**Wahrscheinlichkeit:** Niedrig  
**Impact:** Hoch

**Gegenmaßnahmen:**
- ✅ Hard Enforcement: MCP Server blockt Code-Implementation ohne QG2
- ✅ Validation Hooks: `.instructions.md` Files prüfen automatisch
- ✅ Audit-Log: Alle QG-Überprüfungen protokolliert
- ✅ Manual Override: Nur mit expliziter Begründung

---

## **7. Referenzen / Beispiele**

### **📦 Template Repository (Public)**

**Vollständiges funktionsfähiges Beispiel:**
👉 **https://github.com/pssah4/agentic-scrum-copilot**

**Direkte Links zu Schlüssel-Dateien:**

#### **Chatmodes (Sub-Agenten):**
- [requirements-engineer.chatmode.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/requirements-engineer.chatmode.md) - Requirements Discovery
- [architect.chatmode.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/architect.chatmode.md) - Technical Architecture
- [developer.chatmode.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/developer.chatmode.md) - Code Implementation
- [debugger.chatmode.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/chatmodes/debugger.chatmode.md) - Error Analysis

#### **Validation Rules:**
- [requirements-engineer.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/requirements-engineer.instructions.md)
- [architect.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/architect.instructions.md)
- [developer.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/developer.instructions.md)
- [debugger.instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/instructions/debugger.instructions.md)

#### **Master Agent:**
- [copilot-instructions.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.github/copilot-instructions.md) - Intelligent Orchestrator (Version 4.0)

#### **MCP Server:**
- [src/index.ts](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/src/index.ts) - Core Implementation (680+ Zeilen)
- [package.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/package.json) - Dependencies & Scripts
- [tsconfig.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/tsconfig.json) - TypeScript Config
- [README.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/mcp-servers/workflow-orchestrator/README.md) - Tool Documentation

#### **VS Code Integration:**
- [.vscode/settings.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.vscode/settings.json) - MCP Server Registration
- [.vscode/extensions.json](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.vscode/extensions.json) - Empfohlene Extensions

#### **Configuration Files:**
- [.gitignore](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.gitignore) - Node.js/TypeScript Excludes
- [.env.example](https://github.com/pssah4/agentic-scrum-copilot/blob/main/.env.example) - Environment Variables Template

#### **Testing:**
- [test-mcp-server.sh](https://github.com/pssah4/agentic-scrum-copilot/blob/main/test-mcp-server.sh) - Server Startup Test
- [test-mcp-tool.sh](https://github.com/pssah4/agentic-scrum-copilot/blob/main/test-mcp-tool.sh) - Tool Call Test

#### **Documentation:**
- [README.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/README.md) - Main Project Documentation (400+ Zeilen)
- [VS-CODE-INTEGRATION.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/docs/VS-CODE-INTEGRATION.md) - Setup & Debugging Guide
- [VERSUCH-001-Multi-Agent-Orchestration-MCP.md](https://github.com/pssah4/agentic-scrum-copilot/blob/main/docs/VERSUCH-001-Multi-Agent-Orchestration-MCP.md) - Experiment Card

---

### **📚 Externe Referenzen**

**MCP Protocol:**
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/) - Offizielle Spezifikation
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - MCP SDK für Node.js
- [MCP SDK v0.5.0 Docs](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

**GitHub Copilot:**
- [GitHub Copilot Extensibility](https://docs.github.com/en/copilot) - Offizielle Docs
- [VS Code Copilot Chat](https://code.visualstudio.com/docs/copilot/copilot-chat) - Chatmode System
- [Custom Instructions](https://aka.ms/vscode-ghcp-custom-instructions) - Instruction Files

**arc42 Architecture:**
- [arc42 Template](https://arc42.org/overview) - Architecture Documentation Template
- [ADRs (Architecture Decision Records)](https://adr.github.io/) - Decision Documentation

---

### **🚀 Quick Start**

```bash
# 1. Template Repository klonen
git clone https://github.com/pssah4/agentic-scrum-copilot.git
cd agentic-scrum-copilot

# 2. MCP Server builden
cd mcp-servers/workflow-orchestrator
npm install
npm run build

# 3. VS Code öffnen
code ../..

# 4. GitHub Copilot Chat nutzen
# Cmd/Ctrl + Shift + I → Chat öffnen
# "What's the current workflow state?"
```

**Erwartete Antwort:** Copilot nutzt `get_workflow_state()` Tool und zeigt aktuellen Workflow-Status.

---

**Status:** ✅ Produktiv - Vollständig implementiert und getestet  
**Letzte Aktualisierung:** 2025-10-08  
**Repository:** https://github.com/pssah4/agentic-scrum-copilot
