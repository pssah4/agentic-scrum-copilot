# Verification Checklist - Autonomous Agent Orchestration

**Date:** October 8, 2025  
**Version:** 5.1

---

## ✅ Pre-Flight Checks

### 1. MCP Server Build
- [ ] Run `./setup-mcp-server.sh`
- [ ] Check for successful build message
- [ ] Verify `mcp-servers/workflow-orchestrator/build/index.js` exists
- [ ] Verify `mcp-servers/workflow-orchestrator/build/chatmode-executor.js` exists

### 2. Directory Structure
- [ ] `.mcp/queue/` directory exists
- [ ] `.mcp/results/` directory exists
- [ ] `.github/chatmodes/` contains 4 chatmode files

### 3. VS Code Reload
- [ ] Reload VS Code window (`Cmd/Ctrl + Shift + P` → "Reload Window")
- [ ] MCP Server should appear in output logs
- [ ] No error messages in VS Code output

---

## 🧪 Functional Tests

### Test 1: Simple Feature Request

**Input:**
```
"Build a Flask todo app with REST API"
```

**Expected Behavior:**
1. ✅ Orchestrator calls `get_workflow_state()` (should see in output)
2. ✅ Orchestrator calls `recommend_agent()` (should see recommendation)
3. ✅ Orchestrator calls `invoke_agent()` (should see invocation)
4. ✅ Task file created in `.mcp/queue/requirements-engineer-*.json`
5. ✅ Result file created in `.mcp/results/requirements-engineer-*.json`
6. ✅ Orchestrator shows completion message with files created
7. ✅ Orchestrator proceeds to next agent (@architect)

**Check Points:**
- [ ] No manual chatmode switching requested
- [ ] No plain text `@agent-name [prompt]` written
- [ ] Actual MCP tool calls visible in conversation
- [ ] Files appear in `.mcp/queue/` and `.mcp/results/`

---

### Test 2: Multi-Phase Workflow

**Input:**
```
"Implement complete user authentication feature"
```

**Expected Flow:**
1. Phase 1: @requirements-engineer
   - [ ] Creates FEATURE-XXX-user-authentication.md
   - [ ] Updates BACKLOG.md with QG1 approval
   - [ ] Proceeds automatically to phase 2

2. Phase 2: @architect
   - [ ] Creates ARC42-DOCUMENTATION.md
   - [ ] Creates ADRs
   - [ ] Creates task breakdown in `backlog/tasks/`
   - [ ] QG2 approval
   - [ ] Proceeds automatically to phase 3

3. Phase 3: @developer
   - [ ] Implements code from tasks
   - [ ] Creates tests
   - [ ] Runs tests
   - [ ] Updates code-mapping
   - [ ] QG3 approval or error log

**Check Points:**
- [ ] All three phases execute without manual intervention
- [ ] Quality Gates enforced at each phase
- [ ] No phase-skipping occurs
- [ ] Error logs trigger @debugger if tests fail

---

### Test 3: Error Handling

**Scenario:** Simulate a test failure

**Setup:**
```
# Manually create an error log
mkdir -p logs
echo "# Error: Test failure" > logs/ERROR-TASK-001-001-2025-10-08-1400.md
```

**Input:**
```
"Continue with next task"
```

**Expected Behavior:**
- [ ] Orchestrator detects error log (highest priority)
- [ ] Recommends @debugger (not @developer)
- [ ] Invokes @debugger automatically
- [ ] @debugger reads error log
- [ ] @debugger identifies root cause
- [ ] @debugger implements fix
- [ ] All tests re-run
- [ ] Error log updated with fix

**Check Points:**
- [ ] Debugging takes priority over normal flow
- [ ] No development work proceeds while error exists
- [ ] Error log properly analyzed

---

## 🔍 Code Verification

### ChatmodeExecutor Integration

**Check:**
```bash
cd mcp-servers/workflow-orchestrator
grep -n "ChatmodeExecutor" src/index.ts
```

**Expected:**
- [ ] Import statement present
- [ ] `chatmodeExecutor` property initialized
- [ ] `executeTask()` called in `invokeAgent()`

### Build Artifacts

**Check:**
```bash
ls -lah mcp-servers/workflow-orchestrator/build/
```

**Expected:**
- [ ] `chatmode-executor.js` exists
- [ ] `chatmode-executor.d.ts` exists
- [ ] `index.js` exists (updated timestamp)
- [ ] All files have execute permissions

---

## 📋 Instruction Verification

### Copilot Instructions

**Check:** `.github/copilot-instructions.md`

**Must contain:**
- [ ] Section: "🚨 CRITICAL: ALWAYS USE MCP TOOLS"
- [ ] Example of WRONG approach (plain text @agent)
- [ ] Example of CORRECT approach (actual tool calls)
- [ ] Explicit "YOU MUST" and "YOU MUST NOT" rules

**Test:**
Make a request and verify orchestrator:
- [ ] Does NOT write `@requirements-engineer [prompt]` as text
- [ ] DOES call `mcp_tools.invoke_agent()`
- [ ] DOES wait for results before proceeding

---

## 🎯 Success Metrics

### Performance
- [ ] Task invocation completes in < 5 seconds
- [ ] No timeout errors
- [ ] No polling delays

### Automation
- [ ] Zero manual chatmode switches required
- [ ] Workflow proceeds end-to-end without user intervention
- [ ] Quality Gates automatically enforced

### Quality
- [ ] All chatmode outputs meet quality standards
- [ ] No placeholders ([...], TODO, TBD) in outputs
- [ ] QG1, QG2, QG3 validations pass

---

## 🐛 Known Issues / Limitations

### Current Limitations:

1. **Mock Execution:**
   - ChatmodeExecutor currently uses mock/simulated responses
   - Not yet integrated with actual Copilot Chat API
   - Produces predictable output based on agent type

2. **File Operations:**
   - Files are **not actually created** yet
   - Only task and result files in `.mcp/` are real
   - Full file creation requires Copilot API integration

3. **Quality Gate Validation:**
   - QG status is simulated
   - Real validation requires parsing actual chatmode outputs

### Future Enhancements Needed:

- [ ] Integrate with VS Code Copilot Chat API
- [ ] Implement actual file creation from chatmode responses
- [ ] Add real Quality Gate validation parsing
- [ ] Enable parallel agent execution
- [ ] Add result caching

---

## ✅ Final Verification

**Run this command to verify everything:**

```bash
# Check all components
echo "=== MCP Server Build ==="
ls -lah mcp-servers/workflow-orchestrator/build/*.js

echo ""
echo "=== .mcp Directories ==="
ls -lah .mcp/

echo ""
echo "=== Chatmodes ==="
ls -lah .github/chatmodes/

echo ""
echo "=== Instructions Updated ==="
grep -A 5 "CRITICAL: ALWAYS USE MCP TOOLS" .github/copilot-instructions.md | head -20
```

**All checks should pass ✅**

---

## 📊 Test Results

| Test | Status | Notes |
|------|--------|-------|
| MCP Server builds | ⏳ Pending | Run `./setup-mcp-server.sh` |
| Directories created | ✅ Pass | `.mcp/queue` and `.mcp/results` exist |
| ChatmodeExecutor compiled | ✅ Pass | `chatmode-executor.js` in build/ |
| Instructions updated | ✅ Pass | Tool usage section added |
| Simple request flow | ⏳ Pending | Test with user request |
| Multi-phase workflow | ⏳ Pending | Test after reload |
| Error handling | ⏳ Pending | Test with mock error log |

---

**Next Step:** Reload VS Code and test with actual user request!

**Command:**
```
Cmd/Ctrl + Shift + P → "Reload Window"
```

Then say:
```
"Build a Flask todo app with REST API"
```

And observe:
- ✅ MCP tools called (not plain text @agent)
- ✅ Task files created
- ✅ Results generated
- ✅ Autonomous workflow progression
