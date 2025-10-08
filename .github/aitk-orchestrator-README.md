# AI Toolkit Orchestrator - Dokumentation

**Vollständige Dokumentation für den Azure AI Toolkit Orchestrator Agent**

Dieses Verzeichnis enthält alle Ressourcen, die du brauchst, um einen intelligenten Master Orchestrator Agent im Azure AI Toolkit zu erstellen und zu betreiben.

---

## 📚 Verfügbare Dokumente

### 1. **aitk-orchestrator-instructions.md** ⭐
**Der Hauptdokument - Complete Agent Instructions**

- 📖 **67 Seiten** vollständige Instructions für den Orchestrator
- 🎯 Definiert die Identität und Rolle des Agents
- 🗺️ Enthält die komplette Projekt-Struktur
- 👥 Beschreibt alle 4 Sub-Agenten im Detail
- 🧠 Erklärt den 5-Schritt-Entscheidungsalgorithmus
- 📋 Liefert das mandatory Delegation-Response-Pattern
- 🔄 Enthält 4 vollständige Multi-Agent-Workflow-Beispiele
- ✅ Definiert Success-Metriken und Self-Checks

**Verwendung:**
- Kopiere den kompletten Inhalt in die Instructions des AI Toolkit Agents
- ODER: Referenziere die Datei direkt im Agent-Setup

**Zielgruppe:** Der AI Toolkit Agent selbst (Claude Sonnet 4.5)

---

### 2. **aitk-orchestrator-setup-guide.md** 🚀
**Schritt-für-Schritt-Anleitung zum Setup**

- 📋 Voraussetzungen und Checks
- 🛠️ Detaillierte Setup-Schritte
- 🧪 4 Validierungs-Tests mit erwarteten Ergebnissen
- 🔧 Troubleshooting-Section für häufige Probleme
- 🎯 Optimierungs-Tipps (Temperature, Context-Window, etc.)
- 📊 Success Metrics und Maintenance-Guide
- 🎓 Links zu weiteren Ressourcen

**Verwendung:**
- Folge dieser Anleitung beim ersten Setup des Agents
- Nutze als Referenz bei Problemen
- Verwende die Validierungs-Tests nach jedem Setup

**Zielgruppe:** Du (der Setup-Administrator)

---

### 3. **aitk-orchestrator-quick-reference.md** 📌
**Schnellreferenz-Karte (1-2 Seiten zum Ausdrucken)**

- 🎯 Agent-Selection Cheat Sheet (Tabelle)
- 🚦 Workflow-Phase Quick-Check (Flowchart)
- 🚨 Prioritäts-Matrix
- ✅ Must-Read Files Checkliste
- 🔀 Decision Tree (1-Pager)
- 📋 Delegation Prompt Template
- 🚫 Critical DON'Ts und ✅ Critical DO's
- 🎯 Keyword Maps für alle 4 Agents
- 📊 File Naming Conventions
- 🔄 Common Scenarios (6 typische Situationen)
- 🧪 Self-Check Before Delegation

**Verwendung:**
- Drucke diese Karte aus und halte sie griffbereit
- Nutze als Spickzettel während der Arbeit mit dem Orchestrator
- Perfekt für schnelle Nachschlage-Bedürfnisse

**Zielgruppe:** Du (während der Nutzung des Orchestrators)

---

## 🎯 Welches Dokument wann nutzen?

### Beim ersten Setup:
1. ✅ Lies **Setup-Guide** komplett
2. ✅ Folge den Setup-Schritten
3. ✅ Kopiere **Instructions** in AI Toolkit
4. ✅ Führe Validierungs-Tests durch
5. ✅ Drucke **Quick-Reference** aus

### Bei täglicher Nutzung:
- 📌 Halte **Quick-Reference** griffbereit
- 🔍 Nutze für schnelle Agent-Selection-Entscheidungen
- ✅ Verwende Self-Check-Liste vor Delegationen

### Bei Problemen:
- 🔧 Konsultiere **Setup-Guide** Troubleshooting-Section
- 📖 Re-read relevante Sections in **Instructions**
- 🧪 Führe Validierungs-Tests erneut durch

### Für Deep-Dive:
- 📖 Lies **Instructions** komplett durch
- 🧠 Verstehe den Entscheidungs-Algorithmus
- 🔄 Studiere die Multi-Agent-Workflow-Beispiele

---

## 📂 Datei-Struktur im Projekt

```
.github/
├── aitk-orchestrator-instructions.md      # Main instructions (67 pages)
├── aitk-orchestrator-setup-guide.md       # Setup guide
├── aitk-orchestrator-quick-reference.md   # Quick reference card
├── aitk-orchestrator-README.md            # This file
│
├── copilot-instructions.md                # Original VS Code Copilot instructions
│
├── chatmodes/                             # The 4 Sub-Agents
│   ├── requirements-engineer.chatmode.md
│   ├── architect.chatmode.md
│   ├── developer.chatmode.md
│   └── debugger.chatmode.md
│
└── instructions/                          # Validation rules
    ├── requirements-engineer.instructions.md
    ├── architect.instructions.md
    ├── developer.instructions.md
    └── debugger.instructions.md
```

---

## 🚀 Quick-Start (5 Minuten)

### Schritt 1: AI Toolkit öffnen
```
Ctrl+Shift+P → "AI Toolkit: Focus on AI Toolkit View"
```

### Schritt 2: Neuen Agent erstellen
```
Name: Agentic Scrum Orchestrator
Model: Claude Sonnet 4.5
Temperature: 0.3
```

### Schritt 3: Instructions einbinden
```
Kopiere gesamten Inhalt von:
.github/aitk-orchestrator-instructions.md
```

### Schritt 4: Erste Anfrage testen
```
"Ich möchte eine Todo-Listen-Webapp erstellen."
```

### Schritt 5: Validierung
```
Erwartung:
✅ Agent liest BACKLOG.md und ARC42-DOCUMENTATION.md
✅ Erkennt Phase: requirements
✅ Empfiehlt: @requirements-engineer
✅ Gibt vollständige Task Analysis mit Reasoning
```

---

## 🎓 Was macht dieser Orchestrator anders?

### Problem mit GitHub Copilot in VS Code:
- ❌ Keine direkte API zum Aufrufen von Chatmodes
- ❌ Keine programmatische Agent-Invokation
- ❌ Manuelle @agent-Switching erforderlich
- ❌ Kein automatisches Context-Gathering

### Lösung mit AI Toolkit Orchestrator:
- ✅ **Intelligent Agent Selection** - Wählt automatisch den richtigen Sub-Agent
- ✅ **Automatic Context Gathering** - Liest alle relevanten Files vor Delegation
- ✅ **Quality Gate Enforcement** - Verhindert Phase-Skipping automatisch
- ✅ **Error-Priority-Management** - Debugging hat absolute Priorität
- ✅ **Clear Communication** - Transparentes Reasoning für jede Entscheidung
- ✅ **Multi-Step Workflow Coordination** - Orchestriert komplexe Workflows

### Was der Orchestrator NICHT tut (und warum das gut ist):
- ❌ Implementiert keinen Code selbst → Delegiert an @developer
- ❌ Schreibt keine Requirements selbst → Delegiert an @requirements-engineer
- ❌ Entwirft keine Architektur selbst → Delegiert an @architect
- ❌ Debuggt keine Fehler selbst → Delegiert an @debugger

**Philosophie:** Der Orchestrator ist ein **Coordinator, nicht ein Executor**. 
Seine Stärke liegt in intelligenter Delegation, nicht in direkter Implementierung.

---

## 🧪 Wie gut funktioniert der Orchestrator?

### Success-Metriken:

**Excellent Performance:**
- ✅ 95%+ korrekte Agent-Selection beim ersten Versuch
- ✅ 100% Quality Gate Enforcement
- ✅ 0 Phase-Skipping-Incidents
- ✅ Error-Logs werden in <5s erkannt und @debugger aktiviert
- ✅ Vollständiger Context in 90%+ der Delegationen

**Good Performance:**
- ✅ 80-95% korrekte Agent-Selection
- ✅ 95%+ Quality Gate Enforcement
- ✅ Error-Logs werden erkannt, aber manchmal verzögert
- ✅ Context meistens vollständig

**Needs Improvement:**
- ⚠️ <80% korrekte Agent-Selection
- ⚠️ Quality Gates werden übersprungen
- ⚠️ Error-Logs werden ignoriert
- ⚠️ Context unvollständig oder fehlend

**→ Bei "Needs Improvement":** Re-check Instructions, führe Setup-Guide erneut durch, tune Temperature

---

## 🔧 Häufige Anpassungen

### 1. Temperature Anpassen

**Für mehr Konsistenz:**
```
Temperature: 0.2
→ Sehr deterministisch
→ Gleicher Input = Fast gleicher Output
```

**Für mehr Kreativität:**
```
Temperature: 0.5
→ Mehr Variation
→ Kreativere Analysen
```

### 2. Keywords Erweitern

**Wenn Agent einen Request-Type oft falsch einordnet:**

Bearbeite in Instructions die Keyword-Maps:
```typescript
const keywordMap: Record<AgentName, string[]> = {
  "requirements-engineer": [
    "requirement", "feature", "epic", // existing
    "YOUR_NEW_KEYWORD_HERE"           // add here
  ],
  // ...
};
```

### 3. Context-Files Erweitern

**Wenn Agent wichtige Context-Files vergisst:**

Füge in Instructions zu "Context Gathering" hinzu:
```
Priority 3: Current Work
4. backlog/tasks/TASK-*.md
5. YOUR_ADDITIONAL_FILE_PATTERN   // add here
```

---

## 📊 Vergleich: VS Code Copilot vs. AI Toolkit Orchestrator

| Feature | VS Code Copilot | AI Toolkit Orchestrator |
|---------|----------------|-------------------------|
| Agent-Switching | ✅ Manuell mit @agent | ✅ Automatisch empfohlen |
| Context-Gathering | ⚠️ Manual (user must provide) | ✅ Automatic (liest Files selbst) |
| Quality Gates | ⚠️ Enforcement fehlt | ✅ Automatisch enforced |
| Error-Priorität | ⚠️ Nicht automatisch | ✅ Automatisch höchste Priorität |
| Reasoning | ✅ Gut | ✅ Transparent und ausführlich |
| Workflow-State | ⚠️ Muss user tracken | ✅ Agent tracked automatisch |
| Multi-Step-Workflows | ⚠️ Manual coordination | ✅ Orchestriert automatisch |
| Direct Chatmode Invocation | ❌ Keine API | ⚠️ Via Instructions-Delegation |

**Fazit:** Der AI Toolkit Orchestrator ergänzt VS Code Copilot perfekt durch **intelligente Koordination** und **automatisches Context-Management**.

---

## 🎯 Best Practices

### 1. Klare Anfragen stellen
```
❌ "Mach das Portal"
✅ "Ich möchte ein Customer-Portal mit User-Authentication und Dashboard erstellen"
```

### 2. Orchestrator Feedback geben
```
Nach jeder Delegation:
"War diese Entscheidung korrekt?"
"Hattest du alle Informationen?"
```

### 3. Edge-Cases dokumentieren
```
Wenn Orchestrator falsch entscheidet:
→ Notiere Situation
→ Update Instructions
→ Re-teste
```

### 4. Regelmäßig validieren
```
Wöchentlich:
→ Test mit Standard-Szenarien
→ Check Success-Metriken
→ Review Agent-Decisions
```

---

## 🚀 Next Steps

### Nach dem Setup:

1. **Teste alle 4 Agent-Delegations-Szenarien:**
   - Neue Feature-Anfrage → @requirements-engineer
   - Architecture-Frage → @architect
   - Implementation-Request → @developer
   - Bug-Report → @debugger

2. **Teste Quality Gate Enforcement:**
   - Versuche Implementation ohne Requirements → sollte blocken
   - Versuche Implementation ohne Architecture → sollte blocken

3. **Teste Error-Priorität:**
   - Erstelle dummy Error Log
   - Stelle andere Anfrage
   - Agent sollte @debugger empfehlen

4. **Real-World-Usage:**
   - Starte echtes Projekt
   - Dokumentiere alle Edge-Cases
   - Iteriere auf Instructions

---

## 📞 Support & Feedback

### Bei Problemen:

1. **Check Setup-Guide Troubleshooting**
2. **Review Quick-Reference Self-Checks**
3. **Re-read relevante Instructions-Sections**
4. **Test mit Validierungs-Prompts**

### Für Verbesserungsvorschläge:

- Dokumentiere was gut funktioniert
- Notiere was verbessert werden könnte
- Teile deine Erkenntnisse
- Erweitere die Instructions

---

## 📚 Weitere Ressourcen

**In diesem Repo:**
- `.github/copilot-instructions.md` - Original VS Code Copilot Instructions
- `docs/PATTERN-Multi-Agent-Orchestration-MCP.md` - Pattern-Dokumentation
- `mcp-servers/workflow-orchestrator/` - MCP Server Implementation
- `.github/chatmodes/` - Die 4 Sub-Agent-Definitionen

**Externe Links:**
- Azure AI Toolkit: https://github.com/microsoft/vscode-ai-toolkit
- Model Context Protocol: https://modelcontextprotocol.io/
- arc42 Documentation: https://arc42.org/
- Gherkin Scenarios: https://cucumber.io/docs/gherkin/

---

## 🎓 Zusammenfassung

**Du hast jetzt alle Tools für einen intelligenten Orchestrator:**

1. ✅ **67 Seiten vollständige Instructions** (aitk-orchestrator-instructions.md)
2. ✅ **Detaillierter Setup-Guide mit Tests** (aitk-orchestrator-setup-guide.md)
3. ✅ **Quick-Reference-Karte zum Ausdrucken** (aitk-orchestrator-quick-reference.md)
4. ✅ **Diese README als Navigationshilfe**

**Ready to create your Orchestrator? 🚀**

1. Folge dem Setup-Guide
2. Kopiere die Instructions
3. Teste mit den Validierungs-Prompts
4. Drucke die Quick-Reference
5. Starte dein erstes Projekt!

**Viel Erfolg mit deinem AI Toolkit Orchestrator Agent! 🎯**

---

**Version:** 1.0.0  
**Last Updated:** October 8, 2025  
**Maintained by:** Agentic Scrum Multi-Agent System  
**License:** MIT
