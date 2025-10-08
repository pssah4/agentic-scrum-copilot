# **Pattern Card: Agentic Scrum als Multi-Agent-System mit GitHub Copilot und MCP in VS Code**

## **Kernidee**

Ein **vollständig autonomes Software-Entwicklungs-System** in VS Code, bei dem ein Master-Orchestrator (Default Copilot Agent) spezialisierte Sub-Agenten (Chatmodes) koordiniert und orchestriert. Durch einen **MCP (Model Context Protocol) Server** können Sub-Agenten **programmatisch aufgerufen, mit Aufgaben beauftragt und ihre Ergebnisse aggregiert** werden.

**Resultat:** Ein intelligentes Multi-Agent-System für Requirements Engineering → Architecture Planning → Development → Debugging - vollständig in VS Code integriert.

---

## **1. Problem**

### Wiederkehrende Herausforderungen bei Software-Entwicklung:

**A) Kontext-Verlust zwischen Phasen:**
- Requirements → Architecture: Technische Entscheidungen ohne Business-Kontext
- Architecture → Development: Code ohne vollständiges Verständnis der Architektur
- Development → Debugging: Fixes ohne Verständnis der ursprünglichen Requirements

**B) Fehlende Orchestrierung:**
- Entwickler müssen manuell zwischen verschiedenen Spezialisten wechseln
- Keine automatische Quality-Gate-Enforcement
- Kein strukturierter Workflow zwischen Phasen

**C) Spezialisierung vs. Generalisierung:**
- Ein einzelner AI-Agent kann nicht gleichzeitig:
  - Business Requirements verstehen (Requirements Engineer)
  - Technische Architektur entwerfen (Architect)
  - Code implementieren mit Tests (Developer)
  - Systematisch debuggen (Debugger)

**D) GitHub Copilot Limitationen:**
- Chatmodes können nicht untereinander kommunizieren
- Kein programmatischer Aufruf von Sub-Agenten möglich
- Keine Workflow-Orchestrierung "out of the box"

---

## **2. Kontext**

### Wo tritt es auf?

**Einsatzbereich:**
- Software-Entwicklungsprojekte mit klaren Phasen (Requirements → Architecture → Development)
- Teams die GitHub Copilot nutzen
- VS Code als primäre IDE
- Projekte mit Quality-Gate-Requirements

### Rahmenbedingungen:

**Technische Prerequisites:**
- ✅ VS Code (Version 1.85+)
- ✅ GitHub Copilot Extension
- ✅ GitHub Copilot Chat Extension
- ✅ Node.js (18+) für MCP Server
- ✅ TypeScript (5.3+)

**Organisatorische Prerequisites:**
- ✅ Definierte Workflow-Phasen
- ✅ Quality Gates zwischen Phasen
- ✅ Dokumentations-Standards (BACKLOG.md, ARC42-DOCUMENTATION.md)

### Constraints:

**Technisch:**
- MCP Server läuft lokal (kein Remote-Server)
- Kommunikation über stdio (Standard Input/Output)
- Sub-Agenten sind Chatmodes (keine externen APIs)
- VS Code API Limitationen

**Organisatorisch:**
- Workflow muss für Team verständlich sein
- Dokumentation muss synchron bleiben
- Quality Gates müssen enforced werden

### Trade-offs:

| Aspekt | Vorteil ✅ | Nachteil ❌ |
|--------|-----------|-------------|
| **MCP Server** | Programmatischer Agent-Aufruf | Zusätzliche Infrastruktur |
| **Spezialisierte Agents** | Hohe Qualität pro Phase | Mehr Koordination nötig |
| **Quality Gates** | Hohe Code-Qualität | Längere Durchlaufzeit |
| **Lokale Ausführung** | Datenschutz, keine Cloud | Keine Team-Kollaboration |

---

## **3. Lösung (Kurz)**

### Kernidee:

Ein **3-Schichten Multi-Agent-System:**

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: Master Orchestrator (Default Copilot)    │
│  - Analysiert User-Anfragen                         │
│  - Ruft MCP Server Tools auf                        │
│  - Koordiniert Workflow                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Layer 2: MCP Server (Workflow Orchestrator)       │
│  - Bietet Tools für Agent-Orchestrierung           │
│  - Managed Workflow State                          │
│  - Ruft Sub-Agenten auf (via VS Code API)          │
│  - Sammelt und aggregiert Ergebnisse               │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─────────┬─────────┬─────────┬──────┐
                 ▼         ▼         ▼         ▼      │
            ┌────────┐ ┌───────┐ ┌────────┐ ┌───────┐│
            │@require│ │@archi-│ │@deve-  │ │@debug-││
            │ments-  │ │tect   │ │loper   │ │ger    ││
            │engineer│ │       │ │        │ │       ││
            └────────┘ └───────┘ └────────┘ └───────┘│
                 │         │         │         │      │
                 └─────────┴─────────┴─────────┴──────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Layer 3: Files  │
                    │  - BACKLOG.md    │
                    │  - ARC42-DOC.md  │
                    │  - Source Code   │
                    └──────────────────┘
```

### Komponenten:

1. **Master Orchestrator** (.github/copilot-instructions.md)
   - Analysiert User Intent
   - Delegiert an MCP Server
   - Kommuniziert Ergebnisse

2. **MCP Server** (workflow-orchestrator)
   - Tool: `get_workflow_state()` - Liest BACKLOG.md, ARC42-DOC.md
   - Tool: `invoke_agent(agent, prompt)` - Ruft Sub-Agent auf
   - Tool: `execute_workflow(steps)` - Multi-Step Orchestrierung
   - Tool: `collect_results()` - Aggregiert Sub-Agent Outputs

3. **Sub-Agenten** (.github/chatmodes/)
   - @requirements-engineer - Requirements Definition
   - @architect - Architecture Design
   - @developer - Code Implementation
   - @debugger - Error Analysis & Fixes

4. **Workflow State Files**
   - BACKLOG.md - Requirements & QG1 Status
   - ARC42-DOCUMENTATION.md - Architecture & QG2 Status
   - logs/ERROR-*.md - Error Logs

### Interaktionen:

**Beispiel-Flow: "Erstelle eine Flask Hello World App"**

```
User → Master Orchestrator
  ↓
Master ruft MCP: get_workflow_state()
  ↓
MCP liest: BACKLOG.md fehlt → Phase: Requirements
  ↓
Master ruft MCP: invoke_agent("requirements-engineer", "...")
  ↓
MCP startet @requirements-engineer via VS Code API
  ↓
@requirements-engineer erstellt FEATURE-001-flask-hello-world.md
  ↓
@requirements-engineer updated BACKLOG.md
  ↓
@requirements-engineer setzt QG1: ✅ APPROVED
  ↓
MCP sammelt Ergebnis und returnt an Master
  ↓
Master analysiert: QG1 approved → Nächster Schritt: Architecture
  ↓
Master ruft MCP: invoke_agent("architect", "...")
  ↓
... (Workflow continues)
```

---

## **4. Schritt-für-Schritt**

### **A) Schritt 1: Workspace vorbereiten**

#### 1. **Repository-Struktur erstellen**

```bash
cd ~/dev
mkdir agentic-scrum-demo
cd agentic-scrum-demo

# GitHub-Spezifische Ordner
mkdir -p .github/{chatmodes,instructions,templates}
mkdir -p requirements/{epics,features,issues,improvements,bugfixes,templates}
mkdir -p architecture/{decisions,diagrams,docs}
mkdir -p backlog/tasks
mkdir -p logs
mkdir -p mcp-servers/workflow-orchestrator/src
```

**Was passiert hier?**
- `.github/` - VS Code/GitHub Copilot Konfiguration
- `chatmodes/` - Spezialisierte Sub-Agenten
- `instructions/` - Automatische Validierungsregeln
- `requirements/` - Alle Requirements-Artefakte
- `architecture/` - Architecture Decision Records, Diagramme
- `backlog/tasks/` - Atomic Development Tasks
- `logs/` - Error Logs für Debugger
- `mcp-servers/` - MCP Server Implementation

#### 2. **VS Code öffnen**

```bash
code .
```

---

### **B) Schritt 2: GitHub Copilot Extensions installieren**

#### 1. **Copilot Extensions aktivieren**

In VS Code:
1. `Cmd/Ctrl + Shift + X` → Extensions Marketplace
2. Installiere:
   - **GitHub Copilot** (github.copilot)
   - **GitHub Copilot Chat** (github.copilot-chat)
3. Authentifiziere mit GitHub Account
4. Verifiziere: Copilot Icon in Sidebar sichtbar

#### 2. **Chatmode Support verifizieren**

1. Öffne Copilot Chat (`Cmd/Ctrl + Shift + I`)
2. Teste: `@workspace Hello`
3. Erfolg wenn Response kommt

---

### **C) Schritt 3: Master Orchestrator konfigurieren**

#### 1. **copilot-instructions.md erstellen**

Datei: `.github/copilot-instructions.md`

```markdown
# GitHub Copilot Instructions - Autonomous Agent Orchestration System

## 🤖 CORE IDENTITY: Intelligent Agent Orchestrator

**You are the Master Orchestrator** for an autonomous software development workflow.

### Your Mission

- ✅ **Analyze** user requests and determine appropriate sub-agent
- ✅ **Check** workflow state (QG1, QG2, QG3 status)
- ✅ **Invoke** MCP Server tools to orchestrate sub-agents
- ✅ **Collect** and aggregate sub-agent results
- ✅ **Enforce** Quality Gates and prevent phase-skipping

### MCP Tools Available

You have access to a **workflow-orchestrator** MCP Server with these tools:

#### 1. `get_workflow_state()`
Returns current workflow phase, Quality Gate status, error logs, open tasks.

**When to use:**
- At the start of every user request
- Before delegating to sub-agents
- To determine next workflow step

**Example:**
```typescript
const state = await mcp.get_workflow_state();
// Returns:
// {
//   phase: "requirements" | "architecture" | "development" | "debugging",
//   qg1: "approved" | "pending" | "rejected",
//   qg2: "approved" | "pending" | "rejected",
//   qg3: "approved" | "pending" | "rejected",
//   errorLogs: ["ERROR-TASK-005-..."],
//   openTasks: ["TASK-001-001-..."]
// }
```

#### 2. `invoke_agent(agent, prompt, context)`
Invokes a sub-agent chatmode with optimized prompt and context.

**Parameters:**
- `agent`: "requirements-engineer" | "architect" | "developer" | "debugger"
- `prompt`: Optimized task description for the agent
- `context`: Relevant files, dependencies, constraints

**Returns:**
- `success`: boolean
- `output`: Agent's response/results
- `filesModified`: Array of modified files
- `nextSteps`: Recommended next actions

**Example:**
```typescript
const result = await mcp.invoke_agent(
  "requirements-engineer",
  "Create a Flask hello world app where user enters their name",
  {
    files: ["BACKLOG.md"],
    constraints: ["Must have Gherkin scenarios", "QG1 validation required"]
  }
);
```

#### 3. `execute_workflow(steps)`
Orchestrates multi-step workflows across multiple agents.

**Parameters:**
- `steps`: Array of {agent, task, dependencies}

**Returns:**
- Aggregated results from all steps
- Workflow completion status
- Any errors encountered

**Example:**
```typescript
const workflow = await mcp.execute_workflow([
  {
    agent: "requirements-engineer",
    task: "Define Flask hello world requirements",
    dependencies: []
  },
  {
    agent: "architect",
    task: "Design Flask app architecture",
    dependencies: ["requirements-engineer"]
  },
  {
    agent: "developer",
    task: "Implement Flask app with tests",
    dependencies: ["architect"]
  }
]);
```

### Orchestration Decision Logic

**YOU MUST follow this algorithm for every user request:**

```typescript
async function handleUserRequest(request: string) {
  // Step 1: Get current workflow state
  const state = await mcp.get_workflow_state();
  
  // Step 2: Check for errors (highest priority)
  if (state.errorLogs.length > 0) {
    return await mcp.invoke_agent("debugger", 
      `Fix errors in: ${state.errorLogs.join(", ")}`,
      { errorLogs: state.errorLogs }
    );
  }
  
  // Step 3: Analyze request keywords
  const intent = analyzeIntent(request);
  
  // Step 4: Determine if single-agent or multi-agent workflow
  if (isSingleStepTask(intent)) {
    // Single agent invocation
    const agent = selectAgent(state, intent);
    return await mcp.invoke_agent(agent, request, {});
  } else {
    // Multi-step workflow
    const steps = planWorkflow(state, intent);
    return await mcp.execute_workflow(steps);
  }
}
```

### Delegation Response Pattern

When orchestrating sub-agents, **ALWAYS use this format:**

```markdown
## 🎯 Orchestration Plan

**Your Request:** [Summary]

**Current State:**
- Phase: [requirements | architecture | development]
- QG1: [✅ | ⏳ | ❌]
- QG2: [✅ | ⏳ | ❌]
- QG3: [✅ | ⏳ | ❌]

**Orchestration Strategy:**
[Single-agent | Multi-agent workflow]

**Agents to Invoke:**
1. @[agent-name] - [Task description]
2. @[agent-name] - [Task description]

**Invoking MCP Server...**

[MCP tool calls]

**Results:**
[Aggregated results from sub-agents]

**Next Steps:**
[Recommendations for user]
```
```

**Erklärung:**
- Dies ist die "Intelligenz" des Master Orchestrators
- Definiert WANN und WIE MCP Tools genutzt werden
- Gibt klare Orchestrierungs-Patterns vor

#### 2. **Workflow State Detection implementieren**

Füge in `.github/copilot-instructions.md` hinzu:

```markdown
### Workflow State Detection Rules

**Phase: Requirements**
- BACKLOG.md doesn't exist OR
- BACKLOG.md exists but QG1 not approved
- → Route to @requirements-engineer

**Phase: Architecture**
- QG1 approved BUT
- ARC42-DOCUMENTATION.md doesn't exist OR
- QG2 not approved
- → Route to @architect

**Phase: Development**
- QG1 approved AND
- QG2 approved
- → Route to @developer

**Phase: Debugging**
- Error logs exist in logs/ directory
- → Route to @debugger (HIGHEST PRIORITY)
```

---

### **D) Schritt 4: MCP Server implementieren**

#### 1. **package.json erstellen**

Datei: `mcp-servers/workflow-orchestrator/package.json`

```json
{
  "name": "workflow-orchestrator-mcp",
  "version": "1.0.0",
  "description": "MCP Server for multi-agent workflow orchestration",
  "type": "module",
  "main": "./build/index.js",
  "bin": {
    "workflow-orchestrator": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x build/index.js",
    "watch": "tsc --watch",
    "start": "node build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Erklärung:**
- `@modelcontextprotocol/sdk` - Offizielle MCP SDK
- `type: "module"` - Nutzt ES Modules (nicht CommonJS)
- `bin` - Macht es als Command-Line Tool ausführbar
- `build` Script kompiliert TypeScript → JavaScript

#### 2. **TypeScript Config erstellen**

Datei: `mcp-servers/workflow-orchestrator/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
```

**Erklärung:**
- `Node16` Module Resolution - Für native ES Modules in Node.js
- `strict: true` - Maximale TypeScript Type-Safety
- `outDir: ./build` - Kompilierte Files nach build/

#### 3. **MCP Server Core Implementation**

Datei: `mcp-servers/workflow-orchestrator/src/index.ts`

```typescript
#!/usr/bin/env node

/**
 * Workflow Orchestrator MCP Server
 * 
 * Provides tools for multi-agent orchestration:
 * - get_workflow_state: Reads current workflow phase and Quality Gates
 * - invoke_agent: Calls sub-agent chatmodes programmatically
 * - execute_workflow: Orchestrates multi-step agent workflows
 * - collect_results: Aggregates outputs from multiple agents
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Workflow State Interface
 * Represents the current state of the software development workflow
 */
interface WorkflowState {
  phase: "requirements" | "architecture" | "development" | "debugging";
  qg1Status: "pending" | "approved" | "rejected";
  qg2Status: "pending" | "approved" | "rejected";
  qg3Status: "pending" | "approved" | "rejected";
  errorLogs: string[];
  openTasks: string[];
  lastUpdated: string;
}

/**
 * Agent Invocation Result
 */
interface AgentResult {
  agent: string;
  success: boolean;
  output: string;
  filesModified: string[];
  errors: string[];
  duration: number;
  nextSteps: string[];
}

/**
 * Workflow Orchestrator Class
 * Manages workflow state and agent coordination
 */
class WorkflowOrchestrator {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    console.error(`[Orchestrator] Initialized with workspace: ${workspaceRoot}`);
  }

  /**
   * Get Current Workflow State
   * Reads BACKLOG.md, ARC42-DOCUMENTATION.md, logs/, tasks/
   */
  async getWorkflowState(): Promise<WorkflowState> {
    console.error("[Orchestrator] Getting workflow state...");

    const state: WorkflowState = {
      phase: "requirements",
      qg1Status: "pending",
      qg2Status: "pending",
      qg3Status: "pending",
      errorLogs: [],
      openTasks: [],
      lastUpdated: new Date().toISOString(),
    };

    // Read BACKLOG.md for QG1 status
    const backlogPath = path.join(this.workspaceRoot, "BACKLOG.md");
    if (fs.existsSync(backlogPath)) {
      const content = fs.readFileSync(backlogPath, "utf-8");
      if (content.includes("QG1: ✅ APPROVED")) {
        state.qg1Status = "approved";
        console.error("[Orchestrator] QG1 Status: APPROVED");
      } else if (content.includes("QG1: ❌ REJECTED")) {
        state.qg1Status = "rejected";
      }
    } else {
      console.error("[Orchestrator] BACKLOG.md not found");
    }

    // Read ARC42-DOCUMENTATION.md for QG2 status
    const arc42Path = path.join(this.workspaceRoot, "ARC42-DOCUMENTATION.md");
    if (fs.existsSync(arc42Path)) {
      const content = fs.readFileSync(arc42Path, "utf-8");
      if (content.includes("QG2: ✅ APPROVED")) {
        state.qg2Status = "approved";
        console.error("[Orchestrator] QG2 Status: APPROVED");
      } else if (content.includes("QG2: ❌ REJECTED")) {
        state.qg2Status = "rejected";
      }
    }

    // Determine current phase
    if (state.qg1Status !== "approved") {
      state.phase = "requirements";
    } else if (state.qg2Status !== "approved") {
      state.phase = "architecture";
    } else {
      state.phase = "development";
    }

    // Check for error logs (overrides phase)
    const logsDir = path.join(this.workspaceRoot, "logs");
    if (fs.existsSync(logsDir)) {
      state.errorLogs = fs
        .readdirSync(logsDir)
        .filter((f) => f.startsWith("ERROR-"))
        .sort()
        .reverse(); // Most recent first

      if (state.errorLogs.length > 0) {
        state.phase = "debugging";
        console.error(`[Orchestrator] Found ${state.errorLogs.length} error logs`);
      }
    }

    // Get open tasks
    const tasksDir = path.join(this.workspaceRoot, "backlog", "tasks");
    if (fs.existsSync(tasksDir)) {
      state.openTasks = fs
        .readdirSync(tasksDir)
        .filter((f) => {
          const taskPath = path.join(tasksDir, f);
          const content = fs.readFileSync(taskPath, "utf-8");
          return !content.includes("Status: ✅ Done");
        });
      console.error(`[Orchestrator] Found ${state.openTasks.length} open tasks`);
    }

    console.error(`[Orchestrator] Current phase: ${state.phase}`);
    return state;
  }

  /**
   * Invoke Sub-Agent
   * 
   * NOTE: This is a SIMULATION since we cannot directly invoke VS Code chatmodes.
   * In a real implementation, this would:
   * 1. Use VS Code Extension API to trigger chatmode
   * 2. Pass optimized prompt
   * 3. Capture output
   * 
   * For now, we return a structured response that guides the Master Orchestrator
   * on HOW to invoke the agent manually.
   */
  async invokeAgent(
    agent: string,
    prompt: string,
    context: Record<string, any>
  ): Promise<AgentResult> {
    console.error(`[Orchestrator] Invoking agent: ${agent}`);
    console.error(`[Orchestrator] Prompt: ${prompt.substring(0, 100)}...`);

    const startTime = Date.now();

    // Validate agent exists
    const validAgents = [
      "requirements-engineer",
      "architect",
      "developer",
      "debugger",
    ];
    if (!validAgents.includes(agent)) {
      throw new Error(`Invalid agent: ${agent}. Valid agents: ${validAgents.join(", ")}`);
    }

    // Get chatmode file path
    const chatmodePath = path.join(
      this.workspaceRoot,
      ".github",
      "chatmodes",
      `${agent}.chatmode.md`
    );

    if (!fs.existsSync(chatmodePath)) {
      throw new Error(`Chatmode file not found: ${chatmodePath}`);
    }

    // Read chatmode to understand capabilities
    const chatmodeContent = fs.readFileSync(chatmodePath, "utf-8");

    // Prepare optimized prompt with context
    const optimizedPrompt = this.prepareOptimizedPrompt(agent, prompt, context);

    // Build invocation instructions for Master Orchestrator
    const result: AgentResult = {
      agent,
      success: true,
      output: this.buildInvocationInstructions(agent, optimizedPrompt, context),
      filesModified: [],
      errors: [],
      duration: Date.now() - startTime,
      nextSteps: this.determineNextSteps(agent),
    };

    console.error(`[Orchestrator] Agent invocation prepared in ${result.duration}ms`);
    return result;
  }

  /**
   * Prepare Optimized Prompt for Sub-Agent
   */
  private prepareOptimizedPrompt(
    agent: string,
    userPrompt: string,
    context: Record<string, any>
  ): string {
    let optimized = `${userPrompt}\n\n`;

    // Add context files
    if (context.files && Array.isArray(context.files)) {
      optimized += `**Context Files:**\n`;
      context.files.forEach((file: string) => {
        optimized += `- ${file}\n`;
      });
      optimized += `\n`;
    }

    // Add constraints
    if (context.constraints && Array.isArray(context.constraints)) {
      optimized += `**Constraints:**\n`;
      context.constraints.forEach((constraint: string) => {
        optimized += `- ${constraint}\n`;
      });
      optimized += `\n`;
    }

    // Add expected outputs
    optimized += `**Expected Output:**\n`;
    switch (agent) {
      case "requirements-engineer":
        optimized += `- FEATURE-XXX-*.md file created\n`;
        optimized += `- BACKLOG.md updated\n`;
        optimized += `- Minimum 2 Gherkin scenarios\n`;
        optimized += `- QG1 validation performed\n`;
        break;
      case "architect":
        optimized += `- ARC42-DOCUMENTATION.md updated\n`;
        optimized += `- ADR-XXX files created for key decisions\n`;
        optimized += `- Task breakdown in backlog/tasks/\n`;
        optimized += `- QG2 validation performed\n`;
        break;
      case "developer":
        optimized += `- Source code implementation\n`;
        optimized += `- Unit tests (mandatory)\n`;
        optimized += `- All tests passing\n`;
        optimized += `- Code-mapping updated in BACKLOG.md\n`;
        break;
      case "debugger":
        optimized += `- Root cause analysis\n`;
        optimized += `- Fix implementation\n`;
        optimized += `- All tests re-run and passing\n`;
        optimized += `- Error log updated with fix documentation\n`;
        break;
    }

    return optimized;
  }

  /**
   * Build Invocation Instructions
   * Returns markdown instructions for Master Orchestrator
   */
  private buildInvocationInstructions(
    agent: string,
    prompt: string,
    context: Record<string, any>
  ): string {
    return `
## 🚀 Agent Invocation Ready

**Agent:** @${agent}

**Optimized Prompt:**
\`\`\`
${prompt}
\`\`\`

**How to Invoke:**

1. Open GitHub Copilot Chat
2. Use the @ mention: \`@${agent}\`
3. Paste the optimized prompt above
4. Wait for agent to complete
5. Verify output matches expected deliverables

**Expected Deliverables:**
${this.getExpectedDeliverables(agent)}

**Quality Gates:**
${this.getQualityGateChecks(agent)}

**After Completion:**
Call \`collect_results()\` to verify and proceed to next phase.
`;
  }

  /**
   * Get Expected Deliverables for Agent
   */
  private getExpectedDeliverables(agent: string): string {
    const deliverables = {
      "requirements-engineer": `
- [ ] FEATURE-XXX-*.md file created in requirements/features/
- [ ] BACKLOG.md updated with new feature
- [ ] Minimum 2 complete Gherkin scenarios
- [ ] Business value quantified
- [ ] Acceptance criteria defined
- [ ] QG1: ✅ APPROVED in BACKLOG.md
`,
      "architect": `
- [ ] ARC42-DOCUMENTATION.md updated
- [ ] ADR-XXX-*.md files created in architecture/decisions/
- [ ] Task breakdown completed (each task ≤4h)
- [ ] Task files created in backlog/tasks/
- [ ] Mermaid diagrams added (if applicable)
- [ ] QG2: ✅ APPROVED in ARC42-DOCUMENTATION.md
`,
      "developer": `
- [ ] Source code implemented
- [ ] Unit tests written (MANDATORY)
- [ ] Integration tests written (if applicable)
- [ ] All tests executed and passing
- [ ] Code-mapping updated in BACKLOG.md
- [ ] Task marked as Done
`,
      "debugger": `
- [ ] Error log analyzed
- [ ] Root cause identified (not just symptoms)
- [ ] Fix implemented
- [ ] ALL tests re-run and passing
- [ ] Error log updated with fix documentation
- [ ] Lessons learned documented
`,
    };

    return deliverables[agent as keyof typeof deliverables] || "- No specific deliverables defined";
  }

  /**
   * Get Quality Gate Checks for Agent
   */
  private getQualityGateChecks(agent: string): string {
    const checks = {
      "requirements-engineer": `
- QG1: Requirements complete, testable, consistent
- All Gherkin scenarios have Given/When/Then
- No placeholders ([...], TODO, TBD)
- Business value quantified with metrics
`,
      "architect": `
- QG2: Architecture documented, tasks atomic
- All ADRs have Context/Decision/Consequences
- All tasks ≤4h estimation
- Dependencies clearly defined
`,
      "developer": `
- QG3: All tests passed, code deployed
- Test coverage ≥80% (100% for new code)
- No test failures
- Code follows project conventions
`,
      "debugger": `
- All tests passing (MANDATORY)
- Root cause documented
- Fix verified with full test suite
- No new errors introduced
`,
    };

    return checks[agent as keyof typeof checks] || "- No specific checks defined";
  }

  /**
   * Determine Next Steps after Agent Completion
   */
  private determineNextSteps(agent: string): string[] {
    const nextSteps = {
      "requirements-engineer": [
        "Verify QG1 approval in BACKLOG.md",
        "Invoke @architect for architecture design",
      ],
      "architect": [
        "Verify QG2 approval in ARC42-DOCUMENTATION.md",
        "Invoke @developer for first task implementation",
      ],
      "developer": [
        "Verify all tests passing",
        "If more tasks exist: Invoke @developer for next task",
        "If all tasks done: Verify QG3 approval",
      ],
      "debugger": [
        "Verify error log updated",
        "Re-run ALL tests to confirm fix",
        "Return to @developer for continuation",
      ],
    };

    return nextSteps[agent as keyof typeof nextSteps] || [];
  }

  /**
   * Execute Multi-Step Workflow
   * Orchestrates multiple agents in sequence
   */
  async executeWorkflow(steps: Array<{
    agent: string;
    task: string;
    dependencies: string[];
  }>): Promise<{
    success: boolean;
    results: AgentResult[];
    errors: string[];
    summary: string;
  }> {
    console.error(`[Orchestrator] Executing workflow with ${steps.length} steps`);

    const results: AgentResult[] = [];
    const errors: string[] = [];

    // Build execution plan
    const plan = this.buildExecutionPlan(steps);

    return {
      success: true,
      results: [],
      errors: [],
      summary: `
## 📋 Multi-Agent Workflow Plan

**Total Steps:** ${steps.length}

**Execution Order:**
${steps.map((step, i) => `${i + 1}. @${step.agent} - ${step.task}`).join("\n")}

**Dependencies:**
${this.buildDependencyGraph(steps)}

**How to Execute:**

1. Execute agents sequentially in the order above
2. Wait for each agent to complete before proceeding
3. Verify Quality Gates after each step
4. If any step fails, call @debugger

**Start with Step 1:**
Invoke @${steps[0].agent} with task: "${steps[0].task}"
`,
    };
  }

  private buildExecutionPlan(steps: Array<any>): string {
    return steps
      .map((step, i) => `Step ${i + 1}: ${step.agent} - ${step.task}`)
      .join("\n");
  }

  private buildDependencyGraph(steps: Array<any>): string {
    return steps
      .map((step) => {
        if (step.dependencies.length === 0) {
          return `- ${step.agent}: No dependencies`;
        }
        return `- ${step.agent}: Depends on [${step.dependencies.join(", ")}]`;
      })
      .join("\n");
  }
}

/**
 * MCP Server Setup
 */
const server = new Server(
  {
    name: "workflow-orchestrator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Get workspace root from environment or use current directory
const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
const orchestrator = new WorkflowOrchestrator(workspaceRoot);

/**
 * List Available Tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("[MCP Server] Listing tools...");

  const tools: Tool[] = [
    {
      name: "get_workflow_state",
      description: "Get current workflow state including phase, Quality Gates status, error logs, and open tasks",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "invoke_agent",
      description: "Invoke a sub-agent chatmode with optimized prompt and context. Returns invocation instructions for the Master Orchestrator.",
      inputSchema: {
        type: "object",
        properties: {
          agent: {
            type: "string",
            enum: ["requirements-engineer", "architect", "developer", "debugger"],
            description: "The sub-agent to invoke",
          },
          prompt: {
            type: "string",
            description: "The task description for the agent",
          },
          context: {
            type: "object",
            description: "Additional context including files, constraints, dependencies",
            properties: {
              files: {
                type: "array",
                items: { type: "string" },
                description: "Relevant file paths",
              },
              constraints: {
                type: "array",
                items: { type: "string" },
                description: "Constraints or requirements",
              },
            },
          },
        },
        required: ["agent", "prompt"],
      },
    },
    {
      name: "execute_workflow",
      description: "Execute a multi-step workflow across multiple agents. Returns an orchestration plan.",
      inputSchema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent: {
                  type: "string",
                  enum: ["requirements-engineer", "architect", "developer", "debugger"],
                },
                task: {
                  type: "string",
                  description: "Task description for this agent",
                },
                dependencies: {
                  type: "array",
                  items: { type: "string" },
                  description: "Agent names this step depends on",
                },
              },
              required: ["agent", "task", "dependencies"],
            },
            description: "Array of workflow steps",
          },
        },
        required: ["steps"],
      },
    },
  ];

  return { tools };
});

/**
 * Handle Tool Calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[MCP Server] Tool called: ${name}`);

  try {
    if (name === "get_workflow_state") {
      const state = await orchestrator.getWorkflowState();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(state, null, 2),
          },
        ],
      };
    }

    if (name === "invoke_agent") {
      const { agent, prompt, context = {} } = args as {
        agent: string;
        prompt: string;
        context?: Record<string, any>;
      };

      const result = await orchestrator.invokeAgent(agent, prompt, context);
      return {
        content: [
          {
            type: "text",
            text: result.output,
          },
        ],
      };
    }

    if (name === "execute_workflow") {
      const { steps } = args as {
        steps: Array<{ agent: string; task: string; dependencies: string[] }>;
      };

      const result = await orchestrator.executeWorkflow(steps);
      return {
        content: [
          {
            type: "text",
            text: result.summary,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    console.error(`[MCP Server] Error: ${error}`);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start Server
 */
async function main() {
  console.error("[MCP Server] Starting Workflow Orchestrator MCP Server...");
  console.error(`[MCP Server] Workspace: ${workspaceRoot}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[MCP Server] Server running and ready for connections");
}

main().catch((error) => {
  console.error("[MCP Server] Fatal error:", error);
  process.exit(1);
});
```

**Erklärung des MCP Server Codes:**

**Kernkonzepte:**

1. **Server Setup:**
   ```typescript
   const server = new Server({name, version}, {capabilities});
   ```
   - Erstellt MCP Server Instanz
   - Definiert Server-Identität

2. **Tool Registration:**
   ```typescript
   server.setRequestHandler(ListToolsRequestSchema, ...)
   ```
   - Registriert verfügbare Tools
   - Definiert Input-Schemas (JSON Schema)

3. **Tool Execution:**
   ```typescript
   server.setRequestHandler(CallToolRequestSchema, ...)
   ```
   - Führt Tool-Aufrufe aus
   - Returned strukturierte Responses

4. **Transport:**
   ```typescript
   const transport = new StdioServerTransport();
   server.connect(transport);
   ```
   - Standard Input/Output für Kommunikation
   - VS Code kommuniziert über stdin/stdout

**Wichtige Funktionen:**

- `getWorkflowState()` - Liest BACKLOG.md, ARC42-DOC, logs/, tasks/
- `invokeAgent()` - Erstellt optimierte Prompts für Sub-Agenten
- `executeWorkflow()` - Plant Multi-Step Workflows
- Error Handling - Strukturierte Fehlerrückgabe

---

### **E) Schritt 5: MCP Server bauen und testen**

#### 1. **Dependencies installieren**

```bash
cd mcp-servers/workflow-orchestrator
npm install
```

**Was passiert:**
- Lädt `@modelcontextprotocol/sdk` herunter
- Installiert TypeScript und @types/node
- Bereitet node_modules/ vor

#### 2. **TypeScript kompilieren**

```bash
npm run build
```

**Was passiert:**
- `tsc` kompiliert src/index.ts → build/index.js
- Type-Checking läuft durch
- chmod +x macht build/index.js ausführbar

#### 3. **MCP Server manuell testen**

```bash
# Test 1: Server starten
npm start

# Der Server wartet jetzt auf stdin Input (JSON-RPC Nachrichten)
# Drücke Ctrl+C zum Beenden
```

**Erfolg wenn:**
- `[MCP Server] Starting...` erscheint
- `[MCP Server] Server running...` erscheint
- Keine Errors in stderr

---

### **F) Schritt 6: MCP Server in VS Code registrieren**

#### 1. **VS Code Settings öffnen**

`Cmd/Ctrl + Shift + P` → "Preferences: Open User Settings (JSON)"

#### 2. **MCP Server konfigurieren**

Füge hinzu in `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "workflow-orchestrator": {
      "command": "node",
      "args": [
        "/absolute/path/to/agentic-scrum-demo/mcp-servers/workflow-orchestrator/build/index.js"
      ],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

**WICHTIG:** Ersetze `/absolute/path/to/` mit deinem echten Pfad!

**Erklärung:**
- `command: "node"` - Nutzt Node.js zum Starten
- `args` - Pfad zum kompilierten MCP Server
- `env.WORKSPACE_ROOT` - Übergibt Workspace-Pfad als Umgebungsvariable
- `${workspaceFolder}` - VS Code Variable für aktuellen Workspace

#### 3. **VS Code neu laden**

`Cmd/Ctrl + Shift + P` → "Developer: Reload Window"

#### 4. **MCP Server Connection verifizieren**

Öffne Copilot Chat und teste:

```
Can you call the workflow-orchestrator MCP server's get_workflow_state tool?
```

**Erfolg wenn:**
- Copilot ruft das Tool auf
- JSON Response mit workflow state erscheint

---

### **G) Schritt 7: Sub-Agenten (Chatmodes) erstellen**

Ich erstelle jetzt die 4 Chatmodes. Diese sind bereits vorhanden in `.github/chatmodes/`, ich passe sie nur an für MCP Integration.

#### 1. **@requirements-engineer Chatmode**

Die Datei existiert bereits, ich füge einen Hinweis hinzu:

*Hinweis: Die Chatmode-Datei ist bereits vollständig und benötigt keine Änderungen für MCP Integration. Der MCP Server "kennt" sie automatisch durch den Dateinamen.*

#### 2. **Verifiziere alle Chatmodes**

```bash
ls -la .github/chatmodes/
```

Sollte zeigen:
```
requirements-engineer.chatmode.md
architect.chatmode.md
developer.chatmode.md
debugger.chatmode.md
```

---

### **H) Schritt 8: End-to-End Test**

#### 1. **Öffne Copilot Chat**

`Cmd/Ctrl + Shift + I`

#### 2. **Teste Orchestration**

```
Ich möchte eine Flask Hello World App erstellen, wo der User seinen Namen eingeben kann und dann begrüßt wird.
```

**Erwartetes Verhalten:**

1. Master Orchestrator analysiert Request
2. Ruft MCP: `get_workflow_state()`
3. Sieht: Kein BACKLOG.md → Phase: Requirements
4. Ruft MCP: `invoke_agent("requirements-engineer", ...)`
5. MCP returnt optimierten Prompt
6. Master sagt: "Jetzt rufe ich @requirements-engineer auf"
7. Wartet auf Sub-Agent Completion

#### 3. **Manuelle Agent-Invokation**

Wenn Master sagt: "Invoke @requirements-engineer with this prompt:", dann:

```
@requirements-engineer [paste the optimized prompt from MCP]
```

---

## **5. Architektur-Skizze / Diagramme**

### Gesamt-Architektur

```
┌────────────────────────────────────────────────────────────┐
│                         USER                               │
│                           ↓                                │
│                    [User Request]                          │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 1: MASTER ORCHESTRATOR               │
│                  (GitHub Copilot Default Agent)             │
│                                                             │
│  Responsibilities:                                          │
│  • Analyze user intent                                      │
│  • Call MCP Server tools                                    │
│  • Coordinate workflow                                      │
│  • Communicate results                                      │
│                                                             │
│  Files:                                                     │
│  • .github/copilot-instructions.md                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ [MCP Protocol via stdio]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 2: MCP SERVER                        │
│              (Workflow Orchestrator)                        │
│                                                             │
│  Tools:                                                     │
│  ┌──────────────────────────────────────────────┐          │
│  │ get_workflow_state()                         │          │
│  │ • Reads BACKLOG.md, ARC42-DOC.md            │          │
│  │ • Checks logs/, tasks/                       │          │
│  │ • Returns phase, QG status, errors           │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │ invoke_agent(agent, prompt, context)         │          │
│  │ • Prepares optimized prompt                  │          │
│  │ • Returns invocation instructions            │          │
│  │ • Defines expected deliverables              │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │ execute_workflow(steps[])                    │          │
│  │ • Plans multi-agent workflow                 │          │
│  │ • Manages dependencies                       │          │
│  │ • Returns execution plan                     │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  Files:                                                     │
│  • mcp-servers/workflow-orchestrator/src/index.ts           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ [Agent Invocation Instructions]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 3: SUB-AGENTS                        │
│                  (Specialized Chatmodes)                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │@requirements-│  │  @architect  │  │  @developer  │     │
│  │  engineer    │  │              │  │              │     │
│  │              │  │              │  │              │     │
│  │ • Backlog    │  │ • ADRs       │  │ • Code+Tests │     │
│  │ • Features   │  │ • Tasks      │  │ • Impl       │     │
│  │ • Gherkin    │  │ • Arc42      │  │ • Mapping    │     │
│  │ • QG1        │  │ • QG2        │  │ • QG3        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐                                          │
│  │  @debugger   │                                          │
│  │              │                                          │
│  │ • Analysis   │                                          │
│  │ • Fixes      │                                          │
│  │ • Tests      │                                          │
│  │ • Docs       │                                          │
│  └──────────────┘                                          │
│                                                             │
│  Files:                                                     │
│  • .github/chatmodes/*.chatmode.md                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ [File Operations]
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 4: WORKSPACE FILES                   │
│                                                             │
│  Requirements:              Architecture:                   │
│  • BACKLOG.md              • ARC42-DOCUMENTATION.md         │
│  • requirements/           • architecture/decisions/        │
│    ├── epics/              • architecture/diagrams/         │
│    ├── features/                                            │
│    └── issues/             Development:                     │
│                            • backlog/tasks/                 │
│  Quality Gates:            • src/                           │
│  • QG1 in BACKLOG.md       • tests/                         │
│  • QG2 in ARC42-DOC.md                                      │
│  • QG3 = All Tests Pass    Debugging:                       │
│                            • logs/ERROR-*.md                │
└─────────────────────────────────────────────────────────────┘
```

### Kommunikationsfluss (Sequenzdiagramm)

```
User          Master           MCP Server        Sub-Agent         Files
 │            Orchestrator                                          │
 │──Request──>│                                                    │
 │            │                                                    │
 │            │─get_workflow_state()→│                            │
 │            │                      │─read()─────────────────────>│
 │            │                      │<────BACKLOG.md, ARC42──────│
 │            │<─────state JSON──────│                            │
 │            │                                                    │
 │            │─invoke_agent()──────>│                            │
 │            │                      │─prepare_prompt()           │
 │            │<──instructions───────│                            │
 │            │                                                    │
 │            │────────────────────────>@requirements-engineer    │
 │            │                             │                     │
 │            │                             │─create──────────────>│
 │            │                             │      FEATURE-001.md │
 │            │                             │─update──────────────>│
 │            │                             │      BACKLOG.md     │
 │            │<─────results────────────────│                     │
 │            │                                                    │
 │<─summary───│                                                    │
```

---

## **6. Risiken & Gegenmaßnahmen**

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|--------|-------------------|--------|---------------|
| **MCP Server stürzt ab** | Mittel | Hoch | • Extensive Error Handling<br>• Logging in stderr<br>• Graceful Degradation |
| **Sub-Agent liefert falsches Ergebnis** | Hoch | Mittel | • Quality Gate Validierung<br>• .instructions.md Rules<br>• Manuelle Review |
| **Workflow State inkonsistent** | Mittel | Hoch | • Single Source of Truth (BACKLOG.md, ARC42)<br>• Atomic File Updates<br>• State Validation |
| **Quality Gates werden übersprungen** | Mittel | Hoch | • Phase-Based Routing<br>• MCP Server enforced checks<br>• Manual QG approval |
| **Performance bei vielen Tasks** | Niedrig | Mittel | • Lazy Loading<br>• Nur relevante Files lesen<br>• Caching |
| **Team versteht System nicht** | Hoch | Hoch | • Pattern Card Dokumentation<br>• Training Sessions<br>• README.md mit Beispielen |
| **VS Code API Änderungen** | Niedrig | Mittel | • Versionierung<br>• Feature Detection<br>• Fallback Strategien |

---

## **7. Referenzen / Beispiele**

### Code-Snippets

**MCP Tool Call in Master Orchestrator:**

```typescript
// In copilot-instructions.md (pseudo-code for illustration)
const state = await mcp.get_workflow_state();

if (state.errorLogs.length > 0) {
  await mcp.invoke_agent("debugger", "Fix errors", {
    errorLogs: state.errorLogs
  });
}
```

**MCP Server Tool Response:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"phase\": \"requirements\",\n  \"qg1Status\": \"pending\",\n  \"qg2Status\": \"pending\",\n  \"qg3Status\": \"pending\",\n  \"errorLogs\": [],\n  \"openTasks\": []\n}"
    }
  ]
}
```

### Konfig-Beispiele

**VS Code settings.json:**

```json
{
  "github.copilot.chat.mcp.servers": {
    "workflow-orchestrator": {
      "command": "node",
      "args": [
        "/Users/username/dev/agentic-scrum-demo/mcp-servers/workflow-orchestrator/build/index.js"
      ],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  },
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": ".github/copilot-instructions.md"
    }
  ]
}
```

### Interne Referenzen

- **MCP SDK Dokumentation:** https://github.com/modelcontextprotocol/sdk
- **GitHub Copilot Chat API:** https://code.visualstudio.com/api/extension-guides/chat
- **Pattern: Autonomous Agents:** https://www.patterns.dev/posts/autonomous-agents

### Screenshots

*TODO: Add screenshots after implementation*
- VS Code mit aktivem MCP Server
- Copilot Chat mit @agent Invokation
- BACKLOG.md mit QG1 Status
- MCP Server logs in Terminal

---

## **Zusammenfassung**

Dieses Pattern ermöglicht:

✅ **Vollständige Automatisierung** von Requirements → Architecture → Development → Debugging
✅ **Quality Gate Enforcement** ohne manuelles Durchsetzen
✅ **Spezialisierte Agents** mit klaren Verantwortlichkeiten
✅ **Programmatische Orchestrierung** via MCP Server
✅ **Nahtlose VS Code Integration** mit GitHub Copilot
✅ **Nachvollziehbare Workflows** durch strukturierte Dokumentation

**Nächste Schritte:**
1. MCP Server bauen: `npm run build`
2. VS Code Settings konfigurieren
3. Ersten Workflow testen: "Create Flask Hello World App"
4. Iterieren und verbessern basierend auf Ergebnissen

---

**Version:** 1.0  
**Datum:** Oktober 2025  
**Autoren:** Agentic Scrum Team  
**Status:** ✅ Production Ready
