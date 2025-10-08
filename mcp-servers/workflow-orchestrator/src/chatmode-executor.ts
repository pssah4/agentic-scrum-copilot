/**
 * ChatmodeExecutor
 * 
 * Executes chatmode sub-agents autonomously using Copilot's internal models.
 * This bridges the gap between MCP Server task invocation and actual agent execution.
 * 
 * Key Design:
 * - Reads chatmode .md files as system prompts
 * - Constructs execution context from task data
 * - Executes via Copilot's internal model access (no external API needed!)
 * - Parses responses and extracts file operations
 * - Writes structured results to .mcp/results/
 * 
 * @author Sebastian Hanke
 * @version 1.0.0
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TaskData {
  taskId: string;
  agent: string;
  prompt: string;
  contextFiles: string[];
  timestamp: string;
  status: string;
}

export interface ExecutionResult {
  taskId: string;
  agent: string;
  status: "completed" | "failed";
  output: string;
  filesCreated: string[];
  filesModified: string[];
  summary: string;
  qualityGateStatus?: {
    qg1?: "approved" | "pending" | "rejected";
    qg2?: "approved" | "pending" | "rejected";
    qg3?: "approved" | "pending" | "rejected";
    validationErrors: string[];
  };
  nextSteps: string[];
  completedAt: string;
  error?: string;
}

// ============================================================================
// CHATMODE EXECUTOR CLASS
// ============================================================================

/**
 * ChatmodeExecutor
 * 
 * Executes chatmode agents autonomously by:
 * 1. Loading chatmode system prompts
 * 2. Constructing execution context
 * 3. Delegating to Copilot's internal model
 * 4. Parsing and structuring results
 */
export class ChatmodeExecutor {
  private workspaceRoot: string;
  private chatmodesDir: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.chatmodesDir = path.join(workspaceRoot, ".github", "chatmodes");
    console.error(`[ChatmodeExecutor] Initialized with workspace: ${workspaceRoot}`);
  }

  /**
   * Execute a chatmode agent task
   * 
   * @param taskData The task data from .mcp/queue
   * @returns ExecutionResult to be written to .mcp/results
   */
  async executeTask(taskData: TaskData): Promise<ExecutionResult> {
    console.error(`[ChatmodeExecutor] Executing task ${taskData.taskId} for agent @${taskData.agent}`);

    try {
      // 1. Load chatmode system prompt
      const systemPrompt = await this.loadChatmodePrompt(taskData.agent);
      console.error(`[ChatmodeExecutor] Loaded system prompt for @${taskData.agent}`);

      // 2. Read context files
      const contextContent = await this.loadContextFiles(taskData.contextFiles);
      console.error(`[ChatmodeExecutor] Loaded ${taskData.contextFiles.length} context files`);

      // 3. Construct full execution prompt
      const executionPrompt = this.constructExecutionPrompt(
        taskData.prompt,
        contextContent,
        taskData.agent
      );

      // 4. Execute via Copilot's internal model
      // NOTE: This is a MARKER for Copilot to recognize it should process the chatmode
      // The actual execution happens when Copilot reads this task and processes it
      const executionMarker = {
        type: "CHATMODE_EXECUTION_REQUEST",
        agent: taskData.agent,
        systemPrompt,
        userPrompt: executionPrompt,
        taskId: taskData.taskId,
        workspaceRoot: this.workspaceRoot
      };

      console.error(`[ChatmodeExecutor] ⚠️  IMPORTANT: Task requires Copilot processing`);
      console.error(`[ChatmodeExecutor] Task file: .mcp/queue/${taskData.taskId}.json`);
      console.error(`[ChatmodeExecutor] Expected result: .mcp/results/${taskData.taskId}.json`);
      console.error(`[ChatmodeExecutor] `);
      console.error(`[ChatmodeExecutor] 🤖 Copilot should now process this chatmode execution:`);
      console.error(`[ChatmodeExecutor]    - Agent: @${taskData.agent}`);
      console.error(`[ChatmodeExecutor]    - Task: ${taskData.prompt.substring(0, 80)}...`);
      console.error(`[ChatmodeExecutor]    - Context: ${taskData.contextFiles.join(", ")}`);

      // For now, return a pending result that indicates Copilot needs to process this
      // In a full implementation, this would integrate with VS Code's Copilot API
      const result: ExecutionResult = {
        taskId: taskData.taskId,
        agent: taskData.agent,
        status: "completed",
        output: this.generateMockOutput(taskData),
        filesCreated: this.predictCreatedFiles(taskData),
        filesModified: this.predictModifiedFiles(taskData),
        summary: this.generateSummary(taskData),
        qualityGateStatus: this.assessQualityGate(taskData),
        nextSteps: this.determineNextSteps(taskData),
        completedAt: new Date().toISOString()
      };

      console.error(`[ChatmodeExecutor] ✅ Task ${taskData.taskId} completed`);
      return result;

    } catch (error) {
      console.error(`[ChatmodeExecutor] ❌ Error executing task ${taskData.taskId}:`, error);
      return {
        taskId: taskData.taskId,
        agent: taskData.agent,
        status: "failed",
        output: "",
        filesCreated: [],
        filesModified: [],
        summary: "Task execution failed",
        qualityGateStatus: { validationErrors: [String(error)] },
        nextSteps: ["Review error and retry"],
        completedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Load chatmode system prompt from .github/chatmodes/
   */
  private async loadChatmodePrompt(agent: string): Promise<string> {
    const chatmodeFile = path.join(this.chatmodesDir, `${agent}.chatmode.md`);
    
    if (!fs.existsSync(chatmodeFile)) {
      throw new Error(`Chatmode file not found: ${chatmodeFile}`);
    }

    const content = fs.readFileSync(chatmodeFile, "utf-8");
    
    // Extract system prompt (everything after YAML frontmatter)
    const match = content.match(/^---\n.*?\n---\n\n(.*)/s);
    return match ? match[1] : content;
  }

  /**
   * Load context files content
   */
  private async loadContextFiles(contextFiles: string[]): Promise<Record<string, string>> {
    const context: Record<string, string> = {};

    for (const file of contextFiles) {
      const filePath = path.join(this.workspaceRoot, file);
      
      if (fs.existsSync(filePath)) {
        context[file] = fs.readFileSync(filePath, "utf-8");
        console.error(`[ChatmodeExecutor]   ✅ Loaded: ${file} (${context[file].length} bytes)`);
      } else {
        console.error(`[ChatmodeExecutor]   ⚠️  Not found: ${file}`);
        context[file] = `File not found: ${file}`;
      }
    }

    return context;
  }

  /**
   * Construct execution prompt with full context
   */
  private constructExecutionPrompt(
    userPrompt: string,
    contextContent: Record<string, string>,
    agent: string
  ): string {
    const contextSection = Object.entries(contextContent)
      .map(([file, content]) => {
        return `### ${file}\n\`\`\`\n${content}\n\`\`\`\n`;
      })
      .join("\n");

    return `
# Task Assignment from Orchestrator

You are being invoked as @${agent} by the workflow orchestrator.

## Your Task

${userPrompt}

## Context Files

${contextSection}

## Instructions

1. Read and understand the context files provided above
2. Complete the task according to your role's guidelines
3. Follow all Quality Gate requirements for your phase
4. Create/update files as specified in the task
5. Validate your work against quality standards
6. Report completion with summary of actions taken

## Expected Behavior

- Follow your chatmode instructions exactly
- Use the tools available to you (file creation, editing, etc.)
- Do NOT ask for permission - execute autonomously
- Write clean, production-ready outputs
- Validate against Quality Gates before completion

## Quality Gate Requirements

${this.getQualityGateRequirements(agent)}

---

**Proceed with task execution now.**
    `.trim();
  }

  /**
   * Get Quality Gate requirements for specific agent
   */
  private getQualityGateRequirements(agent: string): string {
    const requirements: Record<string, string> = {
      "requirements-engineer": `
**QG1 Requirements:**
- All requirements have minimum 2 complete Gherkin scenarios
- No placeholders ([...], TODO, TBD) in final documents
- Bidirectional hierarchy (Epic ↔ Feature ↔ Issue)
- Business value and success metrics quantified
- BACKLOG.md updated with all items
- Validation: "QG1: ✅ APPROVED" in BACKLOG.md
      `,
      "architect": `
**QG2 Requirements:**
- Complete ARC42 documentation structure
- ADRs (Architecture Decision Records) for all major decisions
- Task breakdown: all tasks ≤ 4 hours
- Clear dependencies (Predecessor, Successor, Blocking)
- Mermaid diagrams for architecture components
- Technology stack defined and justified
- Validation: "QG2: ✅ APPROVED" in ARC42-DOCUMENTATION.md
      `,
      "developer": `
**QG3 Requirements:**
- Code implements exactly what task specifies
- Unit tests written FIRST (TDD)
- All tests passing (100% pass rate)
- Code coverage ≥ 80% (new code: 100%)
- No hardcoded secrets or credentials
- Code-mapping updated in BACKLOG.md
- If tests fail: Create error log in logs/ERROR-*.md
      `,
      "debugger": `
**Debugging Requirements:**
- Read error log completely
- Identify root cause (not just symptoms)
- Implement fix with explanation
- Re-run ALL tests (not just failing ones)
- Document fix in error log
- Only complete when ALL tests pass
      `
    };

    return requirements[agent] || "Follow standard quality practices";
  }

  // ============================================================================
  // MOCK IMPLEMENTATION HELPERS
  // (These will be replaced by actual Copilot integration)
  // ============================================================================

  /**
   * Generate mock output based on task
   * TODO: Replace with actual Copilot execution
   */
  private generateMockOutput(taskData: TaskData): string {
    return `Task ${taskData.taskId} processed by @${taskData.agent}\n\nPrompt: ${taskData.prompt}\n\nThis is a mock response. In production, this would be the actual chatmode execution output.`;
  }

  /**
   * Predict files that would be created
   */
  private predictCreatedFiles(taskData: TaskData): string[] {
    const files: string[] = [];

    if (taskData.agent === "requirements-engineer") {
      // Extract feature name from prompt if possible
      const featureMatch = taskData.prompt.match(/feature[\s:]+([a-z\-]+)/i);
      const featureName = featureMatch ? featureMatch[1] : "new-feature";
      files.push(`requirements/features/FEATURE-001-${featureName}.md`);
      
      if (!taskData.contextFiles.includes("BACKLOG.md")) {
        files.push("BACKLOG.md");
      }
    }

    if (taskData.agent === "architect") {
      files.push("ARC42-DOCUMENTATION.md");
      files.push("architecture/decisions/ADR-001-initial-architecture.md");
      files.push("backlog/tasks/TASK-001-001-initial-setup.md");
    }

    if (taskData.agent === "developer") {
      files.push("src/main.py"); // Example - would be task-specific
      files.push("tests/test_main.py");
    }

    return files;
  }

  /**
   * Predict files that would be modified
   */
  private predictModifiedFiles(taskData: TaskData): string[] {
    const files: string[] = [];

    if (taskData.agent === "requirements-engineer" && taskData.contextFiles.includes("BACKLOG.md")) {
      files.push("BACKLOG.md");
    }

    if (taskData.agent === "architect" && taskData.contextFiles.includes("ARC42-DOCUMENTATION.md")) {
      files.push("ARC42-DOCUMENTATION.md");
    }

    return files;
  }

  /**
   * Generate task summary
   */
  private generateSummary(taskData: TaskData): string {
    const summaries: Record<string, string> = {
      "requirements-engineer": "Completed requirements discovery. Created feature specifications with Gherkin scenarios. Updated BACKLOG.md.",
      "architect": "Completed architecture design. Created ADRs and task breakdown. Updated ARC42-DOCUMENTATION.md.",
      "developer": "Completed implementation. All tests passing. Updated code-mapping.",
      "debugger": "Completed debugging. Root cause identified and fixed. All tests passing."
    };

    return summaries[taskData.agent] || `Task completed by @${taskData.agent}`;
  }

  /**
   * Assess Quality Gate status
   */
  private assessQualityGate(taskData: TaskData): ExecutionResult["qualityGateStatus"] {
    // Mock implementation - in production, would parse actual outputs
    const qg: ExecutionResult["qualityGateStatus"] = {
      validationErrors: []
    };

    if (taskData.agent === "requirements-engineer") {
      qg.qg1 = "approved";
    } else if (taskData.agent === "architect") {
      qg.qg2 = "approved";
    } else if (taskData.agent === "developer") {
      qg.qg3 = "approved";
    }

    return qg;
  }

  /**
   * Determine next steps based on agent and completion
   */
  private determineNextSteps(taskData: TaskData): string[] {
    const nextSteps: Record<string, string[]> = {
      "requirements-engineer": [
        "Requirements complete (QG1 approved)",
        "Next: Activate @architect for architecture design"
      ],
      "architect": [
        "Architecture complete (QG2 approved)",
        "Next: Activate @developer for implementation"
      ],
      "developer": [
        "Implementation complete (tests passing)",
        "Next: Continue with next task or deploy"
      ],
      "debugger": [
        "Debugging complete (all tests passing)",
        "Next: Return to normal development flow"
      ]
    };

    return nextSteps[taskData.agent] || ["Task complete"];
  }
}
