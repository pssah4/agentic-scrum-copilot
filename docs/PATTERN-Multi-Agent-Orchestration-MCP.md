# **Pattern Card: Multi-Agent Orchestration mit MCP Server in GitHub Copilot**

**Pattern-ID:** PATTERN-001  
**Version:** 1.0  
**Datum:** 2025-10-08  
**Status:** In Entwicklung

---

## **Kernidee**

Ein **MCP (Model Context Protocol) Server** fungiert als intelligenter Orchestrator, der GitHub Copilot Chatmodes als spezialisierte Sub-Agenten aufruft, Multi-Step Software-Development-Workflows automatisiert und dabei Quality Gates enforced - ohne manuelle Mode-Wechsel durch den User.

**In einem Satz:**
> "Der User gibt einen High-Level Request, der MCP Orchestrator analysiert Workflow-State, wählt passende Sub-Agenten, delegiert Aufgaben mit Kontext und sammelt Ergebnisse - vollautomatisch."

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

✅ Mit Orchestrator:
1. User: "Ich will ein Login-Feature"
2. Orchestrator: Erkennt → Requirements Phase
   → Ruft @requirements-engineer auf
   → Sammelt Ergebnis (FEATURE-042)
   → Ruft @architect auf
   → Sammelt Ergebnis (Tasks)
   → Ruft @developer auf
   → Tests schlagen fehl → Ruft @debugger auf
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

Ein **MCP Server** agiert als "Master Orchestrator" zwischen GitHub Copilot (Master Agent) und spezialisierten Chatmodes (Sub-Agenten).

### Komponenten:

1. **MCP Server (`workflow-orchestrator`)**
   - Liest Workflow-State (BACKLOG.md, ARC42-DOCUMENTATION.md, Error-Logs)
   - Analysiert User-Request (Keywords, Intent)
   - Empfiehlt passenden Sub-Agent
   - **Ruft Sub-Agent auf** via VS Code API
   - Sammelt Ergebnis und gibt zurück

2. **Enhanced Copilot Instructions (`.github/copilot-instructions.md`)**
   - Definiert Master Agent als "Intelligent Orchestrator"
   - 5-Step Decision Algorithm
   - Delegation Response Pattern
   - 4 Real-World Workflow Examples

3. **Spezialisierte Chatmodes (Sub-Agenten)**
   - `@requirements-engineer` - Requirements Discovery
   - `@architect` - Technical Architecture
   - `@developer` - Code Implementation
   - `@debugger` - Error Analysis & Fixing

4. **State Management**
   - BACKLOG.md (Requirements, QG1 Status)
   - ARC42-DOCUMENTATION.md (Architecture, QG2 Status)
   - backlog/tasks/*.md (Development Tasks)
   - logs/ERROR-*.md (Test Failures für Debugger)

### Interaktionen:

```
User Request
    ↓
Master Agent (GitHub Copilot)
    ↓ (nutzt MCP Tools)
MCP Server: workflow-orchestrator
    ↓ (analysiert State, wählt Agent)
    ├─ get_workflow_state() → Liest BACKLOG.md, ARC42-DOCUMENTATION.md
    ├─ recommend_agent() → Keyword-Analyse, Phase-Check
    ├─ invoke_agent() → Ruft @requirements-engineer auf
    │      ↓ (erstellt FEATURE-042)
    ├─ invoke_agent() → Ruft @architect auf
    │      ↓ (erstellt Tasks)
    └─ invoke_agent() → Ruft @developer auf
           ↓ (implementiert Code)
Result aggregiert und an User zurück
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

*Wird in den nächsten Implementierungs-Schritten detailliert...*

---

## **5. Architektur-Skizze / Diagramme**

```mermaid
graph TB
    User[👤 User: 'Ich will ein Login Feature']
    
    subgraph "GitHub Copilot (Master Agent)"
        MA[Master Agent<br/>mit erweiterten Instructions]
    end
    
    subgraph "MCP Server: workflow-orchestrator"
        MCP[MCP Server]
        Tools[Tools:<br/>- get_workflow_state<br/>- recommend_agent<br/>- invoke_agent<br/>- execute_workflow]
        State[State Reader:<br/>- BACKLOG.md<br/>- ARC42-DOCUMENTATION.md<br/>- logs/*.md]
    end
    
    subgraph "Sub-Agenten (Chatmodes)"
        RE[@requirements-engineer]
        AR[@architect]
        DE[@developer]
        DB[@debugger]
    end
    
    subgraph "Artefakte"
        BL[BACKLOG.md<br/>QG1 Status]
        A42[ARC42-DOCUMENTATION.md<br/>QG2 Status]
        Tasks[backlog/tasks/<br/>TASK-*.md]
        Code[src/<br/>Source Code]
        Logs[logs/<br/>ERROR-*.md]
    end
    
    User -->|Request| MA
    MA -->|nutzt MCP Tools| MCP
    MCP -->|liest State| State
    State -.->|liest| BL
    State -.->|liest| A42
    State -.->|liest| Logs
    
    MCP -->|invoke_agent| RE
    RE -->|erstellt/updated| BL
    
    MCP -->|invoke_agent| AR
    AR -->|liest| BL
    AR -->|erstellt/updated| A42
    AR -->|erstellt| Tasks
    
    MCP -->|invoke_agent| DE
    DE -->|liest| Tasks
    DE -->|erstellt| Code
    DE -->|bei Failure| Logs
    
    MCP -->|invoke_agent| DB
    DB -->|liest| Logs
    DB -->|fixt| Code
    
    MCP -->|aggregiert Results| MA
    MA -->|Antwort| User
    
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

### **Code-Snippets:**

*Werden während Implementation hinzugefügt...*

### **Konfigurationen:**

*Werden während Implementation hinzugefügt...*

### **Screenshots:**

*Werden nach Testing hinzugefügt...*

### **Interne Referenzen:**

- `#VERSUCH-001-Multi-Agent-Orchestration-MCP` - Versuchs-Card
- `.github/copilot-instructions.md` - Enhanced Master Agent Instructions
- `.github/chatmodes/*.chatmode.md` - Sub-Agent Definitionen
- `.github/instructions/*.instructions.md` - Validation Rules

### **Externe Referenzen:**

- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [GitHub Copilot Extensibility](https://docs.github.com/en/copilot)
- [VS Code Chatmode Docs](https://code.visualstudio.com/docs/copilot/copilot-chat)
- [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

**Status:** 🚧 In Entwicklung - Wird während Implementation vervollständigt
**Letzte Aktualisierung:** 2025-10-08 15:30
