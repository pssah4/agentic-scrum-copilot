# 🤖 Agentic Scrum - Multi-Agent Orchestration mit GitHub Copilot & MCP

**Ein autonomes Software-Development-Workflow-System mit intelligenter Agent-Orchestrierung**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/agentic-scrum-demo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-0.5.0-orange.svg)](https://modelcontextprotocol.io/)

---

## 🎯 Übersicht

Dieses Projekt demonstriert ein **Pattern für Multi-Agent Orchestration** in GitHub Copilot mittels eines **MCP (Model Context Protocol) Servers**. 

**Kernidee:**
> Der User gibt einen High-Level Request → Der MCP Orchestrator analysiert Workflow-State → Wählt passende Sub-Agenten → Delegiert Aufgaben mit Kontext → Sammelt Ergebnisse → **Vollautomatisch!**

### Was macht dieses System besonders?

- 🎭 **4 Spezialisierte Agenten** - Requirements Engineer, Architect, Developer, Debugger
- 🔄 **Automatische Orchestrierung** - Kein manueller Mode-Wechsel nötig
- 🛡️ **Quality Gate Enforcement** - Verhindert Phase-Skipping (QG1, QG2, QG3)
- 📊 **State Management** - Workflow-State zwischen Agent-Calls persistiert
- 🔗 **MCP Integration** - Model Context Protocol für Tool-Zugriff
- 📝 **Vollständig dokumentiert** - Pattern Card, Versuchs-Card, Code-Dokumentation

---

## 🏗️ Architektur

```
┌─────────────────────────────────────┐
│   GitHub Copilot (Master Agent)     │
│   mit erweiterten Instructions      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   MCP Server: workflow-orchestrator │
│                                     │
│   Tools:                            │
│   • get_workflow_state()            │
│   • recommend_agent()               │
│   • invoke_agent() ← Kern!          │
│   • execute_workflow()              │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    ▼         ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│@req-eng│ │@archit │ │@devel  │ │@debuggr│
└────────┘ └────────┘ └────────┘ └────────┘
    │         │         │         │
    └─────────┴─────────┴─────────┘
              │
              ▼
    ┌──────────────────┐
    │   BACKLOG.md     │
    │   ARC42-DOC.md   │
    │   Source Code    │
    └──────────────────┘
```

---

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **VS Code** mit **GitHub Copilot** Extension
- **GitHub Copilot Subscription** (Pro oder Enterprise)
- **Git** für Version Control

### Installation

```bash
# 1. Repository klonen
git clone https://github.com/yourusername/agentic-scrum-demo.git
cd agentic-scrum-demo

# 2. Environment Variables konfigurieren
cp .env.example .env
# Öffne .env und passe WORKSPACE_ROOT an

# 3. MCP Server Dependencies installieren
cd mcp-servers/workflow-orchestrator
npm install

# 4. TypeScript kompilieren
npm run build

# 5. Zurück zum Root
cd ../..

# 6. VS Code öffnen
code .
```

### VS Code Konfiguration

Erstelle oder erweitere `.vscode/settings.json`:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": ".github/copilot-instructions.md"
    }
  ],
  "github.copilot.chat.mcp.servers": {
    "workflow-orchestrator": {
      "command": "node",
      "args": [
        "${workspaceFolder}/mcp-servers/workflow-orchestrator/build/index.js"
      ],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

### Erste Schritte

1. **Öffne GitHub Copilot Chat** (Cmd/Ctrl + I)
2. **Gib einen High-Level Request:**
   ```
   Ich möchte ein Login-Feature mit Email/Passwort
   ```
3. **Der Orchestrator übernimmt automatisch:**
   - Analysiert Request
   - Erkennt: Requirements Phase
   - Aktiviert @requirements-engineer
   - Sammelt Requirements
   - Aktiviert @architect
   - Erstellt Architecture
   - Aktiviert @developer
   - Implementiert Code + Tests
   - Bei Test-Failure → @debugger
   - ✅ Fertiges, getestetes Feature!

---

## 📁 Projekt-Struktur

```
agentic-scrum-demo/
├── .github/
│   ├── chatmodes/                    # 4 Spezialisierte Agenten
│   │   ├── requirements-engineer.chatmode.md
│   │   ├── architect.chatmode.md
│   │   ├── developer.chatmode.md
│   │   └── debugger.chatmode.md
│   ├── instructions/                 # Automatische Validierung
│   │   ├── requirements-engineer.instructions.md
│   │   ├── architect.instructions.md
│   │   ├── developer.instructions.md
│   │   └── debugger.instructions.md
│   ├── templates/                    # EPIC, FEATURE, ISSUE Templates
│   └── copilot-instructions.md       # Master Agent Instructions
│
├── mcp-servers/
│   └── workflow-orchestrator/        # MCP Server (dieser Code!)
│       ├── src/
│       │   └── index.ts              # Haupt-Server Code
│       ├── build/                    # Kompilierter JS Code
│       ├── package.json              # Dependencies (wie requirements.txt)
│       ├── tsconfig.json             # TypeScript Config
│       └── README.md                 # MCP Server Doku
│
├── requirements/                     # Requirements-Artefakte
│   ├── epics/                       # EPIC-XXX-*.md
│   ├── features/                    # FEATURE-XXX-*.md
│   └── issues/                      # ISSUE-XXX-*.md
│
├── architecture/                     # Architecture-Artefakte
│   ├── decisions/                   # ADRs
│   └── diagrams/                    # Mermaid Diagrams
│
├── backlog/tasks/                   # Task-Files für Developer
├── logs/                            # Error-Logs für Debugger
├── src/                             # Source Code
├── tests/                           # Test Files
│
├── docs/                            # Dokumentation
│   ├── PATTERN-Multi-Agent-Orchestration-MCP.md    # Pattern Card
│   └── VERSUCH-001-Multi-Agent-Orchestration-MCP.md # Versuchs-Card
│
├── BACKLOG.md                       # Master Requirements Document
├── ARC42-DOCUMENTATION.md           # Master Architecture Document
├── .env.example                     # Environment Variables Template
├── .gitignore                       # Git Ignore Rules
└── README.md                        # Diese Datei
```

---

## 🤖 Die 4 Agenten

### 1. @requirements-engineer
**Phase:** Requirements Discovery  
**Verantwortlich für:**
- Business Requirements analysieren
- EPICs, Features, Issues definieren
- Gherkin-Szenarien erstellen
- BACKLOG.md verwalten
- **Quality Gate 1** validieren

**Trigger Keywords:** requirement, feature, epic, user story, backlog

### 2. @architect
**Phase:** Technical Architecture  
**Verantwortlich für:**
- Technische Architektur designen
- ADRs (Architecture Decision Records) erstellen
- Task-Breakdown (atomic ≤4h)
- ARC42-DOCUMENTATION.md verwalten
- **Quality Gate 2** validieren

**Trigger Keywords:** architecture, design, adr, technical, component

### 3. @developer
**Phase:** Implementation  
**Verantwortlich für:**
- Code implementieren (mit Tests! Mandatory!)
- Test-Driven Development (TDD)
- Tasks aus backlog/tasks/ abarbeiten
- Code-Mapping aktualisieren
- Bei Test-Failure: Error-Logs erstellen
- **Quality Gate 3** validieren

**Trigger Keywords:** implement, code, build, develop, function

### 4. @debugger
**Phase:** Debugging  
**Verantwortlich für:**
- Error-Logs analysieren (logs/ERROR-*.md)
- Root Cause identifizieren
- Systematisches Debugging
- Fix implementieren + ALLE Tests re-run
- Fix dokumentieren

**Trigger Keywords:** error, bug, failed, test failure, broken

---

## 🛡️ Quality Gates

### QG1: Requirements Complete & Approved
**Kriterien:**
- ✅ Alle EPICs/Features haben min. 2 Gherkin-Szenarien
- ✅ Business Value quantifiziert (€, %, Zeit, User-Zahlen)
- ✅ Bidirektionale Links (Epic ↔ Feature ↔ Issue)
- ✅ Acceptance Criteria testbar
- ✅ Keine Platzhalter ([...], TODO, TBD)

**Status in:** `BACKLOG.md`

### QG2: Architecture Complete & Approved
**Kriterien:**
- ✅ Alle Features haben ADRs für Key-Decisions
- ✅ Tasks sind atomic (≤4h pro Task)
- ✅ Dependencies explizit dokumentiert
- ✅ Technology Stack definiert
- ✅ Mermaid Diagrams vorhanden

**Status in:** `ARC42-DOCUMENTATION.md`

### QG3: All Tests Passed & Deployed
**Kriterien:**
- ✅ 100% der Tasks completed
- ✅ Alle Tests passed (min. 80% Coverage)
- ✅ Keine Error-Logs in logs/
- ✅ Code deployed
- ✅ Dokumentation aktualisiert

**Status:** Automatisch wenn alle Bedingungen erfüllt

---

## 🔧 MCP Server Tools

### 1. `get_workflow_state`
**Input:** Keine  
**Output:** WorkflowState JSON

```json
{
  "phase": "requirements",
  "qg1Status": "pending",
  "qg2Status": "pending",
  "qg3Status": "pending",
  "errorLogs": [],
  "openTasks": [],
  "requirementsCount": 3
}
```

**Verwendung:** Aktuellen Projekt-Zustand abfragen

### 2. `recommend_agent`
**Input:** `userRequest: string`  
**Output:** AgentRecommendation JSON

```json
{
  "agent": "requirements-engineer",
  "reasoning": "Currently in requirements phase...",
  "contextFiles": ["BACKLOG.md"],
  "optimizedPrompt": "...",
  "priority": "high"
}
```

**Verwendung:** Passenden Agent für Request finden

### 3. `invoke_agent` ⭐ **Kern-Tool!**
**Input:** `agent`, `prompt`, `contextFiles`  
**Output:** AgentInvocationResult JSON

```json
{
  "agent": "developer",
  "success": true,
  "output": "...",
  "filesCreated": ["src/auth.ts"],
  "filesModified": ["BACKLOG.md"],
  "duration": 45000
}
```

**Verwendung:** Sub-Agent programmatisch aufrufen

### 4. `execute_workflow`
**Input:** `steps: AgentName[]`, `initialPrompt: string`  
**Output:** AgentInvocationResult[] JSON

**Verwendung:** Multi-Step Workflow orchestrieren

---

## 📚 Dokumentation

- **[Pattern Card](docs/PATTERN-Multi-Agent-Orchestration-MCP.md)** - Vollständige Pattern-Beschreibung mit Schritt-für-Schritt Anleitung
- **[Versuchs-Card](docs/VERSUCH-001-Multi-Agent-Orchestration-MCP.md)** - Experiment-Dokumentation, Hypothesen, Learnings
- **[Copilot Instructions](.github/copilot-instructions.md)** - Master Agent Orchestration Logic
- **[MCP Server README](mcp-servers/workflow-orchestrator/README.md)** - Detaillierte Server-Dokumentation

---

## 🧪 Testing

```bash
# MCP Server testen
cd mcp-servers/workflow-orchestrator
npm test

# End-to-End Test in VS Code
# 1. Öffne Copilot Chat
# 2. Gib Request: "Ich will ein Hello World Feature"
# 3. Beobachte Orchestration
```

---

## 🔍 Troubleshooting

### Problem: MCP Server startet nicht

**Lösung:**
```bash
# Prüfe Node Version
node --version  # Muss >=18 sein

# Prüfe Build
cd mcp-servers/workflow-orchestrator
npm run build

# Prüfe Logs
cat build/index.js  # Sollte existieren
```

### Problem: Agenten werden nicht aufgerufen

**Lösung:**
- Prüfe `.vscode/settings.json` Konfiguration
- Reload VS Code Window (Cmd/Ctrl + Shift + P → "Reload Window")
- Prüfe VS Code Output Panel → "GitHub Copilot"

### Problem: Quality Gates werden übersprungen

**Lösung:**
- Setze `QG_STRICT_MODE=true` in `.env`
- Prüfe `.github/instructions/*.instructions.md` Files
- Validiere BACKLOG.md und ARC42-DOCUMENTATION.md Format

---

## 🤝 Contributing

Contributions willkommen! Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Guidelines.

**Workflow:**
1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📜 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

---

## 🙏 Acknowledgments

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) - Protocol Specification
- [GitHub Copilot](https://github.com/features/copilot) - AI Pair Programming
- [TypeScript](https://www.typescriptlang.org/) - Language & Tooling
- Agentic Scrum Team - Concept & Implementation

---

## 📞 Support & Contact

**Issues:** [GitHub Issues](https://github.com/yourusername/agentic-scrum-demo/issues)  
**Documentation:** [Wiki](https://github.com/yourusername/agentic-scrum-demo/wiki)  
**Email:** your.email@example.com

---

**Status:** 🚧 Active Development - Version 1.0.0  
**Last Updated:** 2025-10-08
