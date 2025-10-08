#!/usr/bin/env node

/**
 * Workflow Orchestrator MCP Server
 * 
 * Ein Model Context Protocol (MCP) Server für intelligente Multi-Agent Orchestrierung
 * in GitHub Copilot. Dieser Server ermöglicht es dem Master Agent, spezialisierte 
 * Chatmode Sub-Agenten aufzurufen, Aufgaben zu delegieren und Ergebnisse zu sammeln.
 * 
 * Kern-Funktionalität:
 * - Workflow-State aus BACKLOG.md, ARC42-DOCUMENTATION.md lesen
 * - Passenden Sub-Agent empfehlen basierend auf Request & Phase
 * - Sub-Agent programmatisch aufrufen (invoke_agent)
 * - Multi-Step Workflows orchestrieren
 * - Quality Gates enforced (QG1, QG2, QG3)
 * 
 * @author Sebastian Hanke
 * @version 1.0.0
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Workflow-Phase Definition
 */
type WorkflowPhase = "requirements" | "architecture" | "development" | "debugging";

/**
 * Quality Gate Status
 */
type QualityGateStatus = "pending" | "approved" | "rejected";

/**
 * Sub-Agent Namen (Chatmode IDs)
 */
type AgentName = "requirements-engineer" | "architect" | "developer" | "debugger";

/**
 * Workflow-State Interface
 * Enthält alle Informationen über den aktuellen Projekt-Zustand
 */
interface WorkflowState {
  phase: WorkflowPhase;
  qg1Status: QualityGateStatus;
  qg2Status: QualityGateStatus;
  qg3Status: QualityGateStatus;
  activeAgent: AgentName | null;
  errorLogs: string[];
  openTasks: string[];
  requirementsCount: number;
  architectureComplete: boolean;
  lastUpdate: string;
}

/**
 * Agent-Empfehlung Interface
 */
interface AgentRecommendation {
  agent: AgentName;
  reasoning: string;
  contextFiles: string[];
  optimizedPrompt: string;
  priority: "low" | "medium" | "high" | "critical";
  prerequisites: string[];
  estimatedDuration: string;
}

/**
 * Agent-Invocation Result
 * Das Ergebnis eines Sub-Agent-Aufrufs
 */
interface AgentInvocationResult {
  agent: AgentName;
  success: boolean;
  output: string;
  filesCreated: string[];
  filesModified: string[];
  duration: number;
  error?: string;
}

// ============================================================================
// WORKFLOW ORCHESTRATOR CLASS
// ============================================================================

/**
 * WorkflowOrchestrator
 * 
 * Haupt-Klasse für die Orchestrierung von Multi-Agent Workflows.
 * Liest Workflow-State, empfiehlt Agenten, ruft sie auf und sammelt Ergebnisse.
 */
class WorkflowOrchestrator {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    console.error(`[Orchestrator] Initialized with workspace: ${workspaceRoot}`);
  }

  // ==========================================================================
  // WORKFLOW STATE READING
  // ==========================================================================

  /**
   * Liest den aktuellen Workflow-State aus den Master-Dokumenten
   * 
   * Liest:
   * - BACKLOG.md → QG1 Status, Requirements Count
   * - ARC42-DOCUMENTATION.md → QG2 Status, Architecture Complete
   * - logs/ → Error Logs für Debugger
   * - backlog/tasks/ → Open Tasks für Developer
   * 
   * @returns WorkflowState Objekt mit allen Informationen
   */
  async getWorkflowState(): Promise<WorkflowState> {
    console.error("[Orchestrator] Reading workflow state...");

    const state: WorkflowState = {
      phase: "requirements",
      qg1Status: "pending",
      qg2Status: "pending",
      qg3Status: "pending",
      activeAgent: null,
      errorLogs: [],
      openTasks: [],
      requirementsCount: 0,
      architectureComplete: false,
      lastUpdate: new Date().toISOString(),
    };

    // 1. BACKLOG.md lesen (QG1 Status)
    const backlogPath = path.join(this.workspaceRoot, "BACKLOG.md");
    if (fs.existsSync(backlogPath)) {
      const content = fs.readFileSync(backlogPath, "utf-8");
      
      // QG1 Status prüfen
      if (content.includes("QG1: ✅ APPROVED") || content.includes("QG1: ✅")) {
        state.qg1Status = "approved";
        console.error("[Orchestrator] ✅ QG1 APPROVED");
      } else if (content.includes("QG1: ❌ REJECTED")) {
        state.qg1Status = "rejected";
      }

      // Requirements zählen
      const epicMatches = content.match(/EPIC-\d{3}/g);
      const featureMatches = content.match(/FEATURE-\d{3}/g);
      state.requirementsCount = (epicMatches?.length || 0) + (featureMatches?.length || 0);
      console.error(`[Orchestrator] Found ${state.requirementsCount} requirements items`);
    } else {
      console.error("[Orchestrator] ⚠️  BACKLOG.md not found - requirements phase");
    }

    // 2. ARC42-DOCUMENTATION.md lesen (QG2 Status)
    const arc42Path = path.join(this.workspaceRoot, "ARC42-DOCUMENTATION.md");
    if (fs.existsSync(arc42Path)) {
      const content = fs.readFileSync(arc42Path, "utf-8");
      
      // QG2 Status prüfen
      if (content.includes("QG2: ✅ APPROVED") || content.includes("QG2: ✅")) {
        state.qg2Status = "approved";
        state.architectureComplete = true;
        console.error("[Orchestrator] ✅ QG2 APPROVED");
      } else if (content.includes("QG2: ❌ REJECTED")) {
        state.qg2Status = "rejected";
      }
    }

    // 3. Error Logs prüfen (höchste Priorität!)
    const logsDir = path.join(this.workspaceRoot, "logs");
    if (fs.existsSync(logsDir)) {
      state.errorLogs = fs
        .readdirSync(logsDir)
        .filter((f) => f.startsWith("ERROR-"))
        .map((f) => path.join("logs", f));
      
      if (state.errorLogs.length > 0) {
        state.phase = "debugging";
        console.error(`[Orchestrator] 🚨 ${state.errorLogs.length} error log(s) found - DEBUGGING MODE`);
      }
    }

    // 4. Open Tasks zählen
    const tasksDir = path.join(this.workspaceRoot, "backlog", "tasks");
    if (fs.existsSync(tasksDir)) {
      const tasks = fs.readdirSync(tasksDir).filter((f) => f.startsWith("TASK-"));
      state.openTasks = [];
      
      for (const taskFile of tasks) {
        const taskPath = path.join(tasksDir, taskFile);
        const content = fs.readFileSync(taskPath, "utf-8");
        
        // Prüfe ob Task erledigt ist
        if (!content.includes("Status: ✅ Done") && !content.includes("Status: ✅")) {
          state.openTasks.push(taskFile);
        }
      }
      console.error(`[Orchestrator] Found ${state.openTasks.length} open task(s)`);
    }

    // 5. Workflow-Phase bestimmen
    if (state.errorLogs.length > 0) {
      state.phase = "debugging";
    } else if (state.qg1Status !== "approved") {
      state.phase = "requirements";
    } else if (state.qg2Status !== "approved") {
      state.phase = "architecture";
    } else {
      state.phase = "development";
    }

    // QG3 Status (wenn alle Tests passed)
    if (state.phase === "development" && state.openTasks.length === 0 && state.errorLogs.length === 0) {
      state.qg3Status = "approved";
      console.error("[Orchestrator] ✅ QG3 APPROVED - All tasks done, no errors");
    }

    console.error(`[Orchestrator] Current phase: ${state.phase}`);
    return state;
  }

  // ==========================================================================
  // AGENT RECOMMENDATION
  // ==========================================================================

  /**
   * Empfiehlt den passenden Sub-Agent basierend auf User-Request und Workflow-State
   * 
   * Decision Algorithm (5 Steps):
   * 1. Check for error logs (highest priority)
   * 2. Analyze user request keywords
   * 3. Check current workflow phase
   * 4. Apply phase-based validation (Quality Gates)
   * 5. Make final agent selection
   * 
   * @param userRequest Der User-Request String
   * @returns AgentRecommendation mit Agent, Reasoning, Context
   */
  async recommendAgent(userRequest: string): Promise<AgentRecommendation> {
    console.error(`[Orchestrator] Analyzing request: "${userRequest.substring(0, 50)}..."`);

    const state = await this.getWorkflowState();
    const keywords = userRequest.toLowerCase();

    // Keyword-Maps für jeden Agenten
    const keywordMap: Record<AgentName, string[]> = {
      "requirements-engineer": [
        "requirement", "feature", "epic", "user story", "backlog",
        "business", "stakeholder", "acceptance criteria", "gherkin",
        "what should", "need to", "want to add"
      ],
      "architect": [
        "architecture", "design", "adr", "arc42", "diagram",
        "component", "technical", "technology", "pattern", "stack",
        "how should we build", "technical approach"
      ],
      "developer": [
        "implement", "code", "build", "develop", "function",
        "class", "module", "api", "create", "write code",
        "programming", "coding"
      ],
      "debugger": [
        "error", "bug", "failed", "broken", "crash",
        "exception", "test failure", "not working", "fix"
      ]
    };

    // PRIORITY 1: Error Logs (absolut höchste Priorität!)
    if (state.errorLogs.length > 0) {
      return {
        agent: "debugger",
        reasoning: `🚨 CRITICAL: Found ${state.errorLogs.length} error log(s). Debugging takes absolute priority before any other work.`,
        contextFiles: state.errorLogs,
        optimizedPrompt: `Analyze and fix errors in: ${state.errorLogs.join(", ")}. Read each error log, identify root cause, implement fix, and re-run ALL tests.`,
        priority: "critical",
        prerequisites: [],
        estimatedDuration: "30-60 minutes"
      };
    }

    // PRIORITY 2: Phase-based enforcement (Quality Gates)
    if (state.phase === "requirements") {
      // In Requirements Phase → Nur Requirements Engineer erlaubt
      if (keywords.includes("implement") || keywords.includes("code") || keywords.includes("build")) {
        return {
          agent: "requirements-engineer",
          reasoning: "❌ Cannot implement without requirements. Must complete QG1 first. Request contains implementation keywords but we're in requirements phase.",
          contextFiles: ["BACKLOG.md"],
          optimizedPrompt: `Before implementing, we need to define requirements. User wants: "${userRequest}". Please conduct structured requirements discovery.`,
          priority: "high",
          prerequisites: ["QG1 must be approved before development"],
          estimatedDuration: "15-30 minutes"
        };
      }
      
      return {
        agent: "requirements-engineer",
        reasoning: "Currently in requirements phase (QG1 not approved). Need to define and approve requirements first.",
        contextFiles: ["BACKLOG.md"],
        optimizedPrompt: userRequest,
        priority: "high",
        prerequisites: [],
        estimatedDuration: "15-30 minutes"
      };
    }

    if (state.phase === "architecture") {
      // In Architecture Phase → Architecture oder Requirements Engineer
      if (keywords.includes("implement") || keywords.includes("code")) {
        return {
          agent: "architect",
          reasoning: "❌ Cannot implement without architecture. Must complete QG2 first. Requirements exist but architecture is not complete.",
          contextFiles: ["BACKLOG.md", "ARC42-DOCUMENTATION.md"],
          optimizedPrompt: `Before implementing, we need architecture design. User wants: "${userRequest}". Please create architecture, ADRs, and task breakdown.`,
          priority: "high",
          prerequisites: ["QG2 must be approved before development"],
          estimatedDuration: "30-60 minutes"
        };
      }

      // Check if it's an architecture or requirements request
      const archScore = this.scoreKeywords(keywords, keywordMap["architect"]);
      const reqScore = this.scoreKeywords(keywords, keywordMap["requirements-engineer"]);

      if (reqScore > archScore) {
        return {
          agent: "requirements-engineer",
          reasoning: "Request contains requirements-related keywords. Need to update requirements.",
          contextFiles: ["BACKLOG.md"],
          optimizedPrompt: userRequest,
          priority: "medium",
          prerequisites: [],
          estimatedDuration: "15-30 minutes"
        };
      }

      return {
        agent: "architect",
        reasoning: "Currently in architecture phase (QG2 not approved). Need to design architecture and create task breakdown.",
        contextFiles: ["BACKLOG.md", "ARC42-DOCUMENTATION.md"],
        optimizedPrompt: userRequest,
        priority: "high",
        prerequisites: ["QG1 must be approved"],
        estimatedDuration: "30-60 minutes"
      };
    }

    // PRIORITY 3: Development Phase - Keyword-based routing
    const scores: Record<AgentName, number> = {
      "requirements-engineer": this.scoreKeywords(keywords, keywordMap["requirements-engineer"]),
      "architect": this.scoreKeywords(keywords, keywordMap["architect"]),
      "developer": this.scoreKeywords(keywords, keywordMap["developer"]),
      "debugger": this.scoreKeywords(keywords, keywordMap["debugger"])
    };

    console.error(`[Orchestrator] Keyword scores:`, scores);

    const bestAgent = (Object.keys(scores) as AgentName[]).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    // Context-Files basierend auf Agent
    const contextFiles: string[] = ["BACKLOG.md"];
    if (bestAgent === "architect" || bestAgent === "developer") {
      contextFiles.push("ARC42-DOCUMENTATION.md");
    }
    if (bestAgent === "developer" && state.openTasks.length > 0) {
      contextFiles.push(...state.openTasks.map(t => `backlog/tasks/${t}`));
    }

    return {
      agent: bestAgent,
      reasoning: `Based on keyword analysis (score: ${scores[bestAgent]}) and current phase (${state.phase}), ${bestAgent} is the best match.`,
      contextFiles,
      optimizedPrompt: userRequest,
      priority: "medium",
      prerequisites: [],
      estimatedDuration: this.estimateDuration(bestAgent)
    };
  }

  /**
   * Hilfsfunktion: Berechnet Keyword-Score
   */
  private scoreKeywords(text: string, keywords: string[]): number {
    return keywords.filter(kw => text.includes(kw)).length;
  }

  /**
   * Hilfsfunktion: Schätzt Dauer basierend auf Agent
   */
  private estimateDuration(agent: AgentName): string {
    const durations: Record<AgentName, string> = {
      "requirements-engineer": "15-30 minutes",
      "architect": "30-60 minutes",
      "developer": "30-120 minutes",
      "debugger": "30-60 minutes"
    };
    return durations[agent];
  }

  // ==========================================================================
  // AGENT INVOCATION (KERN-FUNKTIONALITÄT!)
  // ==========================================================================

  /**
   * Ruft einen Sub-Agent auf und sammelt das Ergebnis
   * 
   * WICHTIG: Dies ist die Kern-Funktionalität des Orchestrators!
   * 
   * Da VS Code API keinen direkten programmatischen Chatmode-Aufruf erlaubt,
   * nutzen wir einen File-basierten Kommunikations-Mechanismus:
   * 
   * 1. Schreibe Aufgabe in `.mcp/queue/{agent}-{timestamp}.json`
   * 2. Agent (via VS Code Automation oder Manual) liest Queue
   * 3. Agent schreibt Ergebnis in `.mcp/results/{agent}-{timestamp}.json`
   * 4. Orchestrator liest Ergebnis und returned
   * 
   * Alternative: VS Code Extension mit direktem API-Zugriff
   * 
   * @param agent Der aufzurufende Agent
   * @param prompt Der optimierte Prompt für den Agent
   * @param contextFiles Relevante Context-Files
   * @returns AgentInvocationResult mit Output und Metadaten
   */
  async invokeAgent(
    agent: AgentName,
    prompt: string,
    contextFiles: string[]
  ): Promise<AgentInvocationResult> {
    console.error(`[Orchestrator] 🚀 Invoking agent: @${agent}`);
    console.error(`[Orchestrator] Prompt: "${prompt.substring(0, 100)}..."`);
    console.error(`[Orchestrator] Context files: ${contextFiles.join(", ")}`);

    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    // Queue & Results Directories erstellen
    const queueDir = path.join(this.workspaceRoot, ".mcp", "queue");
    const resultsDir = path.join(this.workspaceRoot, ".mcp", "results");
    fs.mkdirSync(queueDir, { recursive: true });
    fs.mkdirSync(resultsDir, { recursive: true });

    // Task-File für Agent erstellen
    const taskFile = path.join(queueDir, `${agent}-${timestamp}.json`);
    const task = {
      agent,
      prompt,
      contextFiles,
      timestamp,
      status: "pending"
    };
    fs.writeFileSync(taskFile, JSON.stringify(task, null, 2));
    console.error(`[Orchestrator] ✅ Task written to: ${taskFile}`);

    // HIER WÜRDE DER EIGENTLICHE AGENT-AUFRUF PASSIEREN
    // Da VS Code API Limitierungen bestehen, simulieren wir zunächst:
    console.error(`[Orchestrator] ⚠️  Simulated agent call (VS Code API integration pending)`);
    console.error(`[Orchestrator] 💡 Manual: Activate @${agent} in VS Code and process task`);

    // Simuliertes Ergebnis (in echter Implementation: warten auf Result-File)
    const result: AgentInvocationResult = {
      agent,
      success: true,
      output: `[Simulated] Agent @${agent} would process:\n\n${prompt}\n\nContext: ${contextFiles.join(", ")}`,
      filesCreated: [],
      filesModified: [],
      duration: Date.now() - startTime,
    };

    // In echter Implementation:
    // - Warte auf Result-File in .mcp/results/
    // - Timeout nach 5 Minuten
    // - Parse Result und return

    console.error(`[Orchestrator] ✅ Agent invocation completed in ${result.duration}ms`);
    return result;
  }

  // ==========================================================================
  // MULTI-STEP WORKFLOW EXECUTION
  // ==========================================================================

  /**
   * Führt einen Multi-Step Workflow aus
   * 
   * Beispiel: Requirements → Architecture → Development
   * 
   * @param steps Array von Agent-Namen in Ausführungs-Reihenfolge
   * @param initialPrompt Der initiale User-Request
   * @returns Array von AgentInvocationResults
   */
  async executeWorkflow(
    steps: AgentName[],
    initialPrompt: string
  ): Promise<AgentInvocationResult[]> {
    console.error(`[Orchestrator] 🔄 Executing workflow with ${steps.length} steps`);
    
    const results: AgentInvocationResult[] = [];
    let currentPrompt = initialPrompt;

    for (const agent of steps) {
      const recommendation = await this.recommendAgent(currentPrompt);
      
      const result = await this.invokeAgent(
        agent,
        recommendation.optimizedPrompt,
        recommendation.contextFiles
      );
      
      results.push(result);

      if (!result.success) {
        console.error(`[Orchestrator] ❌ Workflow stopped: Agent @${agent} failed`);
        break;
      }

      // Update prompt mit Result für nächsten Agent
      currentPrompt = result.output;
    }

    console.error(`[Orchestrator] ✅ Workflow completed: ${results.length} steps executed`);
    return results;
  }
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

/**
 * MCP Server Instanz erstellen
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

// Workspace-Root aus Environment Variable
const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
const orchestrator = new WorkflowOrchestrator(workspaceRoot);

console.error(`[MCP Server] Starting workflow-orchestrator...`);
console.error(`[MCP Server] Workspace: ${workspaceRoot}`);

// ============================================================================
// TOOL REGISTRIERUNG
// ============================================================================

/**
 * Liste alle verfügbaren Tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("[MCP Server] Listing available tools");
  
  return {
    tools: [
      {
        name: "get_workflow_state",
        description: "Get current workflow state including phase, Quality Gates status, error logs, and open tasks. Essential for understanding project context before delegating to sub-agents.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "recommend_agent",
        description: "Analyze user request and recommend appropriate sub-agent (@requirements-engineer, @architect, @developer, @debugger) with reasoning, context files, and optimized prompt. Uses 5-step decision algorithm with Quality Gate enforcement.",
        inputSchema: {
          type: "object",
          properties: {
            userRequest: {
              type: "string",
              description: "The user's request to analyze",
            },
          },
          required: ["userRequest"],
        },
      },
      {
        name: "invoke_agent",
        description: "Invoke a chatmode sub-agent programmatically with optimized prompt and context. Returns agent output, created/modified files, and execution metadata. Core orchestration functionality.",
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
              description: "The optimized prompt for the agent",
            },
            contextFiles: {
              type: "array",
              items: { type: "string" },
              description: "Relevant context files for the agent",
            },
          },
          required: ["agent", "prompt"],
        },
      },
      {
        name: "execute_workflow",
        description: "Execute a multi-step workflow by invoking multiple sub-agents in sequence (e.g., requirements → architecture → development). Automatically orchestrates handoffs and context flow.",
        inputSchema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "string",
                enum: ["requirements-engineer", "architect", "developer", "debugger"],
              },
              description: "Array of agent names in execution order",
            },
            initialPrompt: {
              type: "string",
              description: "The initial user request",
            },
          },
          required: ["steps", "initialPrompt"],
        },
      },
    ] satisfies Tool[],
  };
});

// ============================================================================
// TOOL HANDLERS
// ============================================================================

/**
 * Handle Tool-Aufrufe
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`[MCP Server] Tool called: ${name}`);

  try {
    // Tool 1: get_workflow_state
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

    // Tool 2: recommend_agent
    if (name === "recommend_agent") {
      const { userRequest } = args as { userRequest: string };
      const recommendation = await orchestrator.recommendAgent(userRequest);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(recommendation, null, 2),
          },
        ],
      };
    }

    // Tool 3: invoke_agent (KERN!)
    if (name === "invoke_agent") {
      const { agent, prompt, contextFiles } = args as {
        agent: AgentName;
        prompt: string;
        contextFiles?: string[];
      };
      const result = await orchestrator.invokeAgent(
        agent,
        prompt,
        contextFiles || []
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Tool 4: execute_workflow
    if (name === "execute_workflow") {
      const { steps, initialPrompt } = args as {
        steps: AgentName[];
        initialPrompt: string;
      };
      const results = await orchestrator.executeWorkflow(steps, initialPrompt);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    console.error(`[MCP Server] Error in tool ${name}:`, error);
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

// ============================================================================
// SERVER START
// ============================================================================

/**
 * Server starten mit stdio Transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP Server] ✅ Workflow Orchestrator MCP Server running on stdio");
  console.error("[MCP Server] 🎯 Tools available: get_workflow_state, recommend_agent, invoke_agent, execute_workflow");
}

main().catch((error) => {
  console.error("[MCP Server] Fatal error:", error);
  process.exit(1);
});
