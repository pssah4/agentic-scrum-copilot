# Test Plan: Multi-Agent Orchestration with MCP Server

**Date:** 2025-10-08  
**Version:** 1.0  
**Status:** Ready for Testing

---

## ⚡ **TL;DR - Quick Start (Copy This!)**

**1. Starting Prompt to Default Copilot Agent:**
```
I want to build a simple todo app REST API with Python Flask.

Requirements:
- Create a todo item (POST /todos)
- List all todos (GET /todos)
- Mark todo as complete (PUT /todos/<id>/complete)
- Delete a todo (DELETE /todos/<id>)
- Store todos in memory (no database needed for this test)
- Each todo has: id, title, completed status

Keep it minimal - just a 10-15 minute test project to verify the orchestration system.
```

**2. Follow the agent's recommendations:**
- Activate @requirements-engineer when prompted
- Activate @architect when prompted
- Activate @developer when prompted
- Answer questions quickly (see "Quick Answer Guide" in section below)

**3. Test the result:**
```bash
python app.py

# Create a todo
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test orchestration system"}'

# List todos
curl http://localhost:5000/todos

# Mark as complete
curl -X PUT http://localhost:5000/todos/1/complete

# Delete todo
curl -X DELETE http://localhost:5000/todos/1
```

**Expected time:** 10-15 minutes total ⏱️

---

## 🎯 Test Objectives

Verify that the Default Copilot Agent correctly:
1. Uses MCP Server tools (`get_workflow_state`, `recommend_agent`, `invoke_agent`)
2. Writes tasks to `.mcp/queue/`
3. Sub-agents process tasks from queue
4. Results flow back via `.mcp/results/`
5. Quality Gates are enforced
6. Full workflow: Requirements → Architecture → Development

---

## 📋 Prerequisites

### System Requirements
- ✅ VS Code with GitHub Copilot Extension
- ✅ MCP Server built: `mcp-servers/workflow-orchestrator/build/index.js`
- ✅ `.vscode/settings.json` configured with MCP Server
- ✅ All 4 chatmodes loaded: @requirements-engineer, @architect, @developer, @debugger

### Verification Commands
```bash
# 1. Check MCP Server build
ls -lh mcp-servers/workflow-orchestrator/build/index.js

# 2. Check VS Code settings
cat .vscode/settings.json | grep workflow-orchestrator

# 3. Check chatmodes
ls -1 .github/chatmodes/*.chatmode.md

# 4. Check queue directories
ls -la .mcp/queue/ .mcp/results/
```

---

## 🎯 Quick Test Scenario (10-15 Minutes)

### **Simple Todo App REST API - Complete Workflow Test**

**Goal:** Build a minimal CRUD REST API in ~15 minutes to test full orchestration.

**Why Todo App?**
- ✅ Standard test application (familiar to all developers)
- ✅ Covers all HTTP methods (GET, POST, PUT, DELETE)
- ✅ Simple enough for 10-15 minutes
- ✅ Clear success criteria (CRUD operations work)

---

## 🚀 **RECOMMENDED STARTING PROMPT** (Copy & Paste This)

```
I want to build a simple todo app REST API with Python Flask.

Requirements:
- Create a todo item (POST /todos)
- List all todos (GET /todos)
- Mark todo as complete (PUT /todos/<id>/complete)
- Delete a todo (DELETE /todos/<id>)
- Store todos in memory (no database needed for this test)
- Each todo has: id, title, completed status

Keep it minimal - just a 10-15 minute test project to verify the orchestration system.
```

---

### **Expected Full Workflow (All Phases)**

#### **Phase 1: Requirements (2-3 minutes)**
1. Default Agent → Calls `get_workflow_state()`, `recommend_agent()`
2. Default Agent → Delegates to @requirements-engineer
3. You activate: `@requirements-engineer`
4. Answer questions briefly (Quick Answer Guide below)
5. **Output:** FEATURE-001-todo-api.md created, BACKLOG.md updated

**Quick Answer Guide for @requirements-engineer:**
When asked questions, respond with:
- **Business goal?** → "Testing the orchestration system with a standard todo app"
- **Target users?** → "Developers testing the API"
- **Success metrics?** → "All CRUD operations work correctly"
- **Authentication needed?** → "No"
- **Database needed?** → "No, in-memory storage is fine"
- **Additional features?** → "No, just basic CRUD"
- **Error handling?** → "Basic validation (empty title, invalid ID)"

#### **Phase 2: Architecture (3-5 minutes)**
1. Default Agent → Detects QG1 approved, recommends @architect
2. You activate: `@architect`
3. Architect creates:
   - Simple architecture (Flask + 4 REST endpoints)
   - 3-4 atomic tasks (max 4h each):
     - Task 1: Setup Flask app structure
     - Task 2: Implement GET/POST endpoints
     - Task 3: Implement PUT/DELETE endpoints
     - Task 4: Add tests
   - Updates ARC42-DOCUMENTATION.md
5. **Output:** Tasks in backlog/tasks/, architecture documented

#### **Phase 3: Development (5-7 minutes)**
1. Default Agent → Detects QG2 approved, recommends @developer
2. You activate: `@developer`
3. Developer implements:
   - app.py with Flask CRUD routes
   - Todo model (simple class)
   - Basic tests (pytest)
   - requirements.txt
4. Runs tests automatically
5. **Output:** Working code, tests passing

#### **Phase 4: Manual Testing**
```bash
# Run the app
python app.py

# Create a todo
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test the orchestration system"}'
# Expected: {"id": 1, "title": "Test the orchestration system", "completed": false}

# List all todos
curl http://localhost:5000/todos
# Expected: [{"id": 1, "title": "Test the orchestration system", "completed": false}]

# Mark as complete
curl -X PUT http://localhost:5000/todos/1/complete
# Expected: {"id": 1, "title": "Test the orchestration system", "completed": true}

# Delete todo
curl -X DELETE http://localhost:5000/todos/1
# Expected: {"message": "Todo deleted"}

# Verify deletion
curl http://localhost:5000/todos
# Expected: []
```

**Total Time:** ~10-15 minutes ✅

---

## 🧪 Detailed Test Scenarios (For Debugging)

### **Test 1: Workflow State Check (Baseline)**

**Objective:** Verify MCP Server tools are accessible

**Prompt to Default Agent:**
```
What is the current workflow state of this project?
```

**Expected Behavior:**
1. ✅ Default Agent calls `get_workflow_state()` MCP Tool
2. ✅ Shows output with QG1/QG2/QG3 status
3. ✅ No errors in console

**Expected Output:**
```markdown
## Current Workflow State

- **Phase:** requirements (no BACKLOG.md found)
- **QG1 (Requirements):** ❌ NOT STARTED
- **QG2 (Architecture):** ❌ NOT STARTED
- **QG3 (Development):** ❌ NOT STARTED
- **Error Logs:** None
- **Open Tasks:** None
- **Blocking Issues:** Requirements phase not started
```

**Verification:**
```bash
# Check MCP Server logs in VS Code
# Cmd/Ctrl + Shift + P → "Developer: Show Logs..." → "Extension Host"
# Search for "workflow-orchestrator"
```

**Success Criteria:**
- [ ] MCP Tool was called successfully
- [ ] Workflow state is displayed correctly
- [ ] No errors in Extension Host logs

---

### **Test 2: Agent Recommendation (Core Logic)**

**Objective:** Verify intelligent agent selection

**Prompt to Default Agent:**
```
I want to implement a login feature.
```

**Expected Behavior:**
1. ✅ Calls `get_workflow_state()` → phase: requirements
2. ✅ Calls `recommend_agent()` with user request
3. ✅ Returns recommendation: @requirements-engineer
4. ✅ Explains reasoning (no requirements exist yet)
5. ✅ Does NOT recommend @developer (blocked by QG2)

**Expected Output:**
```markdown
## 🎯 Task Analysis

**Your Request:** Implement a login feature

**Current Workflow State:**
- Phase: requirements
- QG1: ❌ NOT STARTED

**Recommended Sub-Agent:** @requirements-engineer

**Reasoning:** Cannot implement without requirements. Must complete QG1 first.
Feature definition, user stories, and acceptance criteria are needed before 
architecture or development can begin.
```

**Success Criteria:**
- [ ] Correct agent recommended (@requirements-engineer, not @developer)
- [ ] Quality Gate enforcement working (blocked implementation)
- [ ] Clear reasoning provided

---

### **Test 3: Task Delegation (File-Based Queue)**

**Objective:** Verify file-based communication pattern

**Prompt to Default Agent:**
```
I want to implement a user authentication feature with email/password login.
```

**Expected Behavior:**
1. ✅ Calls `get_workflow_state()`
2. ✅ Calls `recommend_agent()` → @requirements-engineer
3. ✅ Calls `invoke_agent()` with task details
4. ✅ **Creates task file:** `.mcp/queue/requirements-engineer-{timestamp}.json`
5. ✅ Tells user to activate @requirements-engineer
6. ✅ Polls `.mcp/results/` (will timeout after 5min if sub-agent not activated)

**Expected Task File Content:**
```json
{
  "taskId": "requirements-engineer-2025-10-08-163000",
  "agent": "requirements-engineer",
  "prompt": "Define requirements for user authentication feature with email/password login",
  "contextFiles": ["BACKLOG.md"],
  "timestamp": "2025-10-08T16:30:00",
  "status": "pending"
}
```

**Verification:**
```bash
# Check queue directory for task file
ls -lh .mcp/queue/

# Read task file
cat .mcp/queue/requirements-engineer-*.json | jq .
```

**Success Criteria:**
- [ ] Task file created in `.mcp/queue/`
- [ ] Task file has correct JSON structure
- [ ] taskId, agent, prompt, contextFiles all present
- [ ] Default Agent is waiting for result

---

### **Test 4: Sub-Agent Task Processing**

**Objective:** Verify sub-agent reads queue and processes task

**Steps:**
1. Ensure task file exists from Test 3
2. Activate sub-agent: `@requirements-engineer`
3. Sub-agent should automatically detect task

**Expected Behavior:**
1. ✅ @requirements-engineer checks `.mcp/queue/` on activation
2. ✅ Finds `requirements-engineer-*.json` file
3. ✅ Reads and parses task
4. ✅ Asks you structured questions about the feature
5. ✅ Creates FEATURE file in `requirements/features/`
6. ✅ Updates BACKLOG.md
7. ✅ Writes result to `.mcp/results/{taskId}.json`
8. ✅ Deletes task from `.mcp/queue/`

**Expected Result File:**
```json
{
  "taskId": "requirements-engineer-2025-10-08-163000",
  "success": true,
  "output": "Created FEATURE-001-user-authentication.md with 3 Gherkin scenarios",
  "filesCreated": [
    "requirements/features/FEATURE-001-user-authentication.md"
  ],
  "filesModified": [
    "BACKLOG.md"
  ],
  "timestamp": "2025-10-08T16:35:00"
}
```

**Verification:**
```bash
# Check result file exists
ls -lh .mcp/results/

# Check task was deleted from queue
ls -lh .mcp/queue/

# Verify files were created
ls -lh requirements/features/FEATURE-*.md
cat BACKLOG.md
```

**Success Criteria:**
- [ ] Sub-agent found and processed task
- [ ] FEATURE file created with Gherkin scenarios
- [ ] BACKLOG.md updated with QG1 status
- [ ] Result file written to `.mcp/results/`
- [ ] Task file removed from `.mcp/queue/`

---

### **Test 5: Default Agent Receives Result**

**Objective:** Verify orchestration loop closes

**Steps:**
1. After Test 4 completes, Default Agent should detect result file
2. Should parse result and show outcome to user

**Expected Behavior:**
1. ✅ Default Agent polls `.mcp/results/` (every 2 seconds)
2. ✅ Finds `requirements-engineer-{taskId}.json`
3. ✅ Parses result
4. ✅ Shows success message to user
5. ✅ Checks workflow state again (QG1 should be approved now)
6. ✅ Recommends next step: @architect

**Expected Output:**
```markdown
## ✅ @requirements-engineer Completed Successfully

**Task ID:** requirements-engineer-2025-10-08-163000
**Duration:** 5 minutes
**Files Created:** 
- requirements/features/FEATURE-001-user-authentication.md
**Files Modified:**
- BACKLOG.md

**Output:** Created FEATURE-001-user-authentication.md with 3 Gherkin scenarios

---

## Next Steps

**Current Workflow State:**
- QG1: ✅ APPROVED (requirements complete)
- QG2: ❌ NOT STARTED (architecture needed)

**Recommended Next Sub-Agent:** @architect

Would you like me to delegate to @architect for technical architecture design?
```

**Success Criteria:**
- [ ] Result file was found and parsed
- [ ] Success message displayed
- [ ] Workflow progressed to next phase
- [ ] Next agent recommendation provided

---

### **Test 6: Quality Gate Enforcement**

**Objective:** Verify phase-skipping is blocked

**Prompt to Default Agent:**
```
Implement the login API code now.
```

**Expected Behavior:**
1. ✅ Calls `get_workflow_state()` → QG2 not approved
2. ✅ Calls `recommend_agent()` → Returns @architect (NOT @developer)
3. ✅ **Blocks** direct implementation
4. ✅ Explains why (architecture missing)

**Expected Output:**
```markdown
## ⚠️ Cannot Proceed with Implementation

**Your Request:** Implement login API code

**Current Workflow State:**
- QG1: ✅ APPROVED
- QG2: ❌ NOT STARTED (blocking)

**Issue:** Cannot implement without approved architecture (QG2).

**Required Steps:**
1. @architect must design technical architecture
2. Create ADRs for key decisions
3. Break down into atomic tasks
4. Validate Quality Gate 2

**Recommended Sub-Agent:** @architect

Would you like me to delegate architecture planning to @architect?
```

**Success Criteria:**
- [ ] Implementation was blocked
- [ ] Clear explanation provided
- [ ] Alternative path suggested
- [ ] Quality Gate enforcement working

---

### **Test 7: Error Log Detection (Highest Priority)**

**Objective:** Verify debugging takes priority

**Setup:**
```bash
# Create a fake error log
mkdir -p logs
cat > logs/ERROR-TASK-001-001-2025-10-08-1600.md << 'EOF'
# Error Log: TASK-001-001

## Error
Tests failing for user model validation.

## Stack Trace
AssertionError: Expected email validation to fail
EOF
```

**Prompt to Default Agent:**
```
What should I work on next?
```

**Expected Behavior:**
1. ✅ Calls `get_workflow_state()` → Detects error logs
2. ✅ Calls `recommend_agent()` → Returns @debugger (CRITICAL priority)
3. ✅ Overrides normal workflow (even if user asked for feature work)
4. ✅ Explains error logs take absolute priority

**Expected Output:**
```markdown
## 🚨 CRITICAL: Error Logs Detected

**Error Logs Found:** 1 file in logs/
- ERROR-TASK-001-001-2025-10-08-1600.md

**Priority:** CRITICAL - Debugging takes absolute priority

**Recommended Sub-Agent:** @debugger

**Reasoning:** Test failures must be resolved before any other work continues.
All development is blocked until tests pass.
```

**Success Criteria:**
- [ ] Error logs detected automatically
- [ ] @debugger recommended (not normal workflow agent)
- [ ] Priority marked as CRITICAL
- [ ] Clear explanation of blocking

**Cleanup:**
```bash
rm -rf logs/
```

---

## 📊 Test Results Summary

### Test Execution Checklist

- [ ] **Test 1:** Workflow State Check → MCP Tools accessible
- [ ] **Test 2:** Agent Recommendation → Intelligent selection
- [ ] **Test 3:** Task Delegation → File-based queue working
- [ ] **Test 4:** Sub-Agent Processing → Queue monitoring working
- [ ] **Test 5:** Result Loop → Orchestration completes
- [ ] **Test 6:** Quality Gate Enforcement → Phase-skipping blocked
- [ ] **Test 7:** Error Detection → Debugging priority

### Overall Success Criteria

✅ **Pass:** All 7 tests successful
⚠️ **Partial:** 5-6 tests successful (minor issues)
❌ **Fail:** <5 tests successful (major architectural issues)

---

## 🐛 Known Limitations (Current Implementation)

1. **Manual Sub-Agent Activation Required**
   - Issue: Sub-agents must be manually activated with `@agent-name`
   - Workaround: Default Agent tells user which agent to activate
   - Future: VS Code Extension for automatic activation

2. **Polling Overhead**
   - Issue: 2-second polling interval adds latency
   - Impact: 2-10 seconds delay to detect results
   - Acceptable for current implementation

3. **5-Minute Timeout**
   - Issue: Tasks must complete within 5 minutes
   - Impact: Complex tasks may timeout
   - Workaround: Increase AGENT_TIMEOUT env variable

---

## 🔍 Debugging Tips

### MCP Server Not Starting
```bash
# Check VS Code Extension Host logs
# Cmd/Ctrl + Shift + P → "Developer: Show Logs..." → "Extension Host"

# Common issues:
# 1. Build not completed: npm run build
# 2. Node.js version: node --version (needs 18+)
# 3. Permissions: chmod +x build/index.js
```

### Tools Not Available
```bash
# Verify MCP Server is registered
cat .vscode/settings.json | grep -A 10 workflow-orchestrator

# Restart VS Code
# Cmd/Ctrl + Shift + P → "Developer: Reload Window"
```

### Queue Files Not Created
```bash
# Check directory permissions
ls -ld .mcp/queue/

# Check MCP Server logs for errors
# Should see: "[Orchestrator] ✅ Task written to queue: ..."
```

### Sub-Agent Not Finding Tasks
```bash
# Verify task file exists
ls -lh .mcp/queue/

# Check chatmode has queue monitoring section
grep -A 20 "Task Queue Integration" .github/chatmodes/requirements-engineer.chatmode.md
```

---

## 📝 Test Documentation

After running tests, document results in:
- `docs/VERSUCH-001-Multi-Agent-Orchestration-MCP.md` (Ergebnis section)
- Update Pattern Card status if needed
- Create GitHub Issues for any bugs found

---

**Ready to test!** 🚀

Start with Test 1 (simplest) and progress through Test 7 (most complex).
