# AI Toolkit Orchestrator - Setup Guide

**Setup für den Master Orchestrator Agent im Azure AI Toolkit**

---

## 📋 Voraussetzungen

- ✅ Azure AI Toolkit Extension installiert
- ✅ VS Code mit diesem Workspace geöffnet
- ✅ Claude Sonnet 4.5 Modell verfügbar

---

## 🚀 Setup-Schritte

### 1. AI Toolkit öffnen

1. VS Code öffnen mit dem Agentic Scrum Workspace
2. Drücke `Ctrl+Shift+P` (oder `Cmd+Shift+P` auf Mac)
3. Tippe: `AI Toolkit: Focus on AI Toolkit View`
4. AI Toolkit Panel öffnet sich in der Sidebar

---

### 2. Neuen Agent erstellen

1. **Im AI Toolkit Panel:**
   - Klicke auf `+ New Agent` oder `Create Agent`

2. **Agent Configuration:**
   ```
   Name: Agentic Scrum Orchestrator
   Model: Claude Sonnet 4.5
   Temperature: 0.3 (für konsistente Entscheidungen)
   Max Tokens: 8000
   ```

3. **Instructions einbinden:**
   - Kopiere den **vollständigen Inhalt** von `.github/aitk-orchestrator-instructions.md`
   - Füge ihn in das Instructions-Feld ein
   
   **ODER (empfohlen):**
   - Referenziere die Datei direkt:
     ```
     Read and follow instructions from:
     .github/aitk-orchestrator-instructions.md
     ```

---

### 3. Agent-Capabilities konfigurieren

**Tools aktivieren:**
```
✅ File System Access (read/write)
✅ Terminal Access (für git commits, etc.)
✅ Web Search (für Recherche)
✅ Code Execution (falls nötig)
```

**Workspace-Zugriff:**
```
✅ Full workspace read access
✅ Can read all files in project
✅ Can write to specific directories:
   - .mcp/queue/
   - .mcp/results/
```

---

### 4. Test-Prompt vorbereiten

**Erster Test-Request:**
```
Ich möchte eine Todo-Listen-Webapp erstellen, 
die ich und meine Kollegen online nutzen können.
```

**Erwartetes Verhalten:**
1. Orchestrator liest BACKLOG.md und ARC42-DOCUMENTATION.md
2. Erkennt: Kein BACKLOG.md vorhanden → Phase: requirements
3. Empfiehlt: @requirements-engineer
4. Gibt vollständige Task Analysis mit Reasoning
5. Delegiert mit context-reichem Prompt

---

## 🧪 Validierungs-Checks

### Check 1: File-Reading

**Test:**
```
Welche Phase ist aktuell aktiv? Lies BACKLOG.md und ARC42-DOCUMENTATION.md.
```

**Erwartung:**
- Agent liest beide Dateien (oder meldet "nicht gefunden")
- Bestimmt korrekte Phase
- Gibt QG1/QG2 Status an

---

### Check 2: Agent-Selection

**Test:**
```
Ich brauche User-Authentication in meiner App.
```

**Erwartung:**
- Analysiert: "User-Authentication" = neue Feature
- Prüft: BACKLOG.md existiert? QG1 Status?
- Empfiehlt: @requirements-engineer (wenn keine Requirements)
- Oder: @architect (wenn Requirements vorhanden, aber keine Architecture)
- Oder: @developer (wenn Architecture vorhanden)

---

### Check 3: Error-Priorität

**Test (wenn Error Log existiert):**
```
Implementiere das neue Dashboard.
```

**Erwartung:**
- Ignoriert Dashboard-Request
- Prüft logs/ zuerst
- Findet ERROR-TASK-*.md
- Gibt CRITICAL Priority
- Empfiehlt sofort: @debugger

---

### Check 4: Quality Gate Enforcement

**Test (ohne Architecture):**
```
Schreib den Code für die Login-API.
```

**Erwartung:**
- Erkennt: Implementation-Request
- Prüft: QG2 approved?
- Wenn NEIN: Blockiert mit klarer Message
- Empfiehlt: @architect (erst Architecture)
- Verhindert Phase-Skipping

---

## 🔧 Troubleshooting

### Problem: Agent liest keine Dateien

**Lösung:**
1. Prüfe Workspace-Zugriff in AI Toolkit Settings
2. Stelle sicher, dass "File System Access" aktiviert ist
3. Teste mit explizitem Befehl:
   ```
   Bitte lies die Datei BACKLOG.md und zeige mir die ersten 10 Zeilen.
   ```

---

### Problem: Agent delegiert ohne Context

**Lösung:**
1. Prüfe ob Instructions vollständig kopiert wurden
2. Erinnere Agent explizit:
   ```
   Bevor du delegierst, lies bitte BACKLOG.md und ARC42-DOCUMENTATION.md.
   ```

---

### Problem: Agent überspringt Quality Gates

**Lösung:**
1. Re-emphasize Quality Gate Enforcement in Instructions
2. Teste mit klarem Szenario:
   ```
   Wir haben keine Architecture. Schreib trotzdem den Code.
   ```
   - Erwartung: Agent sollte ablehnen und @architect empfehlen

---

### Problem: Agent kennt Projekt-Struktur nicht

**Lösung:**
1. Prüfe ob "Projekt-Struktur" Section in Instructions vorhanden
2. Erinnere explizit:
   ```
   Welche Sub-Agenten sind verfügbar? Wo liegen ihre Definitionen?
   ```
   - Erwartung: Agent sollte 4 Agenten auflisten können

---

## 🎯 Optimierungs-Tipps

### 1. Temperature-Tuning

**Für konsistente Entscheidungen:**
```
Temperature: 0.2 - 0.3
→ Deterministisches Verhalten
→ Gleicher Input = Gleicher Output
```

**Für kreativere Analysen:**
```
Temperature: 0.5 - 0.7
→ Mehr Variation in Reasoning
→ Kann alternative Ansätze vorschlagen
```

---

### 2. Context-Window-Management

**Bei großen Projekten:**
- Agent sollte nur relevante Files lesen
- Nutze gezielte Datei-Queries statt "read entire workspace"
- Beispiel:
  ```
  Lies nur BACKLOG.md und ARC42-DOCUMENTATION.md,
  nicht alle Requirements-Dateien.
  ```

---

### 3. Multi-Turn-Conversations

**Best Practice:**
1. **Turn 1:** Agent analysiert und empfiehlt
2. **Turn 2:** User bestätigt oder fragt nach
3. **Turn 3:** Agent delegiert mit vollständigem Prompt
4. **Turn 4:** Agent überwacht Progress

**Vermeiden:**
- Zu schnelle Delegation ohne User-Confirmation
- Fehlender Context-Gathering-Schritt

---

## 📊 Success Metrics

**Guter Orchestrator:**
- ✅ Liest IMMER Core-Files vor Entscheidung
- ✅ Empfiehlt richtigen Agent auf ersten Versuch
- ✅ Gibt vollständigen Context im Delegation-Prompt
- ✅ Verhindert Quality Gate Skipping
- ✅ Erkennt Error Logs proaktiv
- ✅ Kommuniziert Reasoning transparent

**Schlechter Orchestrator:**
- ❌ Rät Workflow-State ohne Files zu lesen
- ❌ Delegiert ohne Context
- ❌ Überspringt Quality Gates
- ❌ Ignoriert Error Logs
- ❌ Unklare Kommunikation

---

## 🚀 Next Steps nach Setup

1. **Teste alle 4 Agent-Delegations-Szenarien:**
   - Neue Feature-Anfrage → @requirements-engineer
   - Architecture-Frage → @architect
   - Implementation-Request → @developer (mit QG2 check)
   - Bug-Report → @debugger

2. **Teste Quality Gate Enforcement:**
   - Implementierung ohne Requirements → sollte blocken
   - Implementierung ohne Architecture → sollte blocken
   - Deployment mit failing tests → sollte blocken

3. **Teste Error-Priorität:**
   - Erstelle dummy Error Log in logs/
   - Stelle beliebige andere Anfrage
   - Agent sollte @debugger empfehlen

4. **Dokumentiere Edge Cases:**
   - Notiere Situationen, wo Agent falsch entscheidet
   - Tune Instructions basierend auf Learnings
   - Iteriere auf optimale Prompts

---

## 📝 Maintenance

### Regelmäßige Checks:

**Wöchentlich:**
- Review Agent-Decisions: Waren sie korrekt?
- Update Instructions bei neuen Patterns
- Test mit realen User-Requests

**Monatlich:**
- Evaluate Success Metrics
- Compare gegen manuelle Orchestrierung
- Fine-tune Temperature/Max-Tokens

**Bei Problemen:**
1. Review letzten Conversation Thread
2. Identifiziere wo Agent falsch lag
3. Update Instructions mit besserem Reasoning
4. Re-teste mit gleichem Szenario

---

## 🎓 Weitere Ressourcen

**In diesem Repo:**
- `.github/aitk-orchestrator-instructions.md` - Vollständige Instructions
- `.github/copilot-instructions.md` - Workflow-Details
- `docs/PATTERN-Multi-Agent-Orchestration-MCP.md` - Pattern-Beschreibung
- `mcp-servers/workflow-orchestrator/` - MCP Server Implementation

**Für Deep-Dive:**
- arc42-Dokumentation: https://arc42.org/
- Gherkin Scenarios: https://cucumber.io/docs/gherkin/
- Model Context Protocol: https://modelcontextprotocol.io/

---

**Ready? Dann erstelle jetzt deinen Orchestrator im AI Toolkit! 🚀**

**Version:** 1.0.0  
**Last Updated:** October 8, 2025
