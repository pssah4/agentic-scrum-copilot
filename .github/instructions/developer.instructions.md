---
applyTo: "backlog/tasks/**/*.md, src/**/*.{py,js,ts}, tests/**/*.{py,js,ts}, logs/**/*.md"
description: "Automatische Validierungs- und Qualitätsregeln für Development mit Test-Enforcement"
autoLoad: true
---

# Developer - Validation & Quality Rules (Test-Enforced)

Diese Instructions werden **automatisch** angewendet beim Arbeiten mit Task-Files, Source Code und Tests. Sie ergänzen den Developer Chatmode mit spezifischen Validierungs- und Quality-Checks für **MANDATORY Testing**.

> **Wichtig:** Diese Regeln gelten zusätzlich zu `.github/chatmodes/developer.chatmode.md`

## 📁 Unterstützte Dateitypen

Diese Validierungsregeln greifen bei:

```
✅ backlog/tasks/**/*.md (Task Files)
✅ src/**/*.py (Source Code)
✅ tests/**/*.py (Test Files)
✅ logs/ERROR-TASK-*.md (Error Logs - beim Erstellen)
```

---

## 🔍 Automatische Validierungen

### 1. Task File Reading Validation

**Pattern-Validierung:**

```javascript
// Task File Pattern
const taskPattern = /^TASK-\d{3}-\d{3}-[a-z0-9-]+\.md$/;

// Beispiel:
// TASK-001-001-create-user-model.md
```

**Required Sections beim Lesen:**

```markdown
MANDATORY Sections (vor Start):

✅ ## Description
✅ ## Technical Specification
   - Files to Create/Modify
   - Implementation Details (mit Code!)
✅ ## Test Plan (CRITICAL!)
   - Unit Tests
   - Integration Tests (if applicable)
✅ ## Acceptance Criteria
✅ ## Definition of Done

OPTIONAL aber empfohlen:
○ ## Dependencies
○ ## Edge Cases
```

**Fehlermeldung bei ungültigem Task:**

```
❌ Task File ungültig oder unvollständig

Datei: backlog/tasks/FEATURE-001/task-1-setup.md
Probleme: 2

1. ❌ Dateiname nicht korrekt
   Gefunden: task-1-setup.md
   Erwartet: TASK-001-001-setup-database.md
   
   Format: TASK-{FEATURE-ID}-{TASK-NUM}-{slug}.md

2. ❌ Test Plan Section fehlt
   Task enthält keine Test-Spezifikation
   
   → CRITICAL: Kann nicht ohne Test Plan starten!
   → Benötigt: Architect muss Test Plan hinzufügen

Action erforderlich:
  Task ist nicht implementation-ready.
  Benachrichtige @architect zur Vervollständigung.
```

---

### 2. Implementation Quality Checks

**Während Implementation (Phase 3):**

```markdown
CHECK während Code-Erstellung:

✅ Folgt Task-Spezifikation?
✅ Type Hints vorhanden?
✅ Docstrings vollständig?
✅ Input Validation implementiert?
✅ Error Handling vorhanden?
✅ Keine hardcoded Werte?
✅ Keine TODOs oder Platzhalter?
✅ Clean Code Principles befolgt?

VERBOTEN:
❌ Code ohne Type Hints (Python/TypeScript)
❌ Funktionen ohne Docstrings
❌ Keine Input Validation
❌ Bare except: ohne Fehlerbehandlung
❌ print() statt logging
❌ Hardcoded Secrets
❌ TODOs in Production Code
❌ Commented-out Code
```

**Code Quality Example - BAD:**

```python
# ❌ BAD IMPLEMENTATION
def process_user(data):
    try:
        user = data['user']
        print(user)  # Debug print
        # TODO: Add validation
        return user
    except:  # Bare except
        return None
```

**Code Quality Example - GOOD:**

```python
# ✅ GOOD IMPLEMENTATION
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

def process_user(data: Dict) -> Optional[User]:
    """
    Process user data from request.
    
    Args:
        data: Request data containing user info
        
    Returns:
        User object if valid, None otherwise
        
    Raises:
        ValueError: If user data is invalid
        
    Examples:
        >>> process_user({'user': {'id': 1, 'name': 'John'}})
        User(id=1, name='John')
    """
    if 'user' not in data:
        logger.error("Missing 'user' key in data")
        raise ValueError("User data must contain 'user' key")
    
    user_data = data['user']
    
    if not isinstance(user_data, dict):
        logger.error(f"Invalid user data type: {type(user_data)}")
        raise ValueError("User data must be a dictionary")
    
    try:
        user = User.from_dict(user_data)
        logger.info(f"Successfully processed user: {user.id}")
        return user
    except ValidationError as e:
        logger.error(f"User validation failed: {e}")
        raise
```

**Fehlermeldung bei schlechtem Code:**

```
⚠️ Code Quality Issues erkannt

Datei: src/users.py
Function: process_user
Probleme: 5

1. ❌ Keine Type Hints
   Zeile 1: def process_user(data):
   Fix: def process_user(data: Dict) -> Optional[User]:

2. ❌ Fehlender Docstring
   Function hat keine Dokumentation
   Fix: Füge vollständigen Docstring hinzu

3. ❌ Keine Input Validation
   Function akzeptiert beliebige Input ohne Check
   Fix: Validiere 'user' key existiert und ist dict

4. ❌ Bare except clause
   Zeile 5: except:
   Fix: except ValidationError as e: + logging

5. ❌ print() statt logging
   Zeile 4: print(user)
   Fix: logger.info(f"Processing user: {user.id}")

Action erforderlich:
  Refactor Code gemäß Clean Code Principles.
  Reference: .github/chatmodes/developer.chatmode.md
```

---

### 3. Test Creation Validation (MANDATORY!)

**Test-Erstellungs-Check (Phase 4):**

```markdown
CHECK während Test-Erstellung:

✅ ALLE Test Cases aus Task Test Plan implementiert?
✅ Unit Tests geschrieben?
✅ Integration Tests geschrieben (if applicable)?
✅ Edge Cases getestet?
✅ Error Cases getestet?
✅ Parametrized Tests für multiple Scenarios?
✅ Test Namen beschreibend?
✅ Docstrings in Tests?
✅ Keine "pass" oder "TODO" Tests?

MINIMUM Requirements:
✅ 1x Happy Path Test
✅ 1x Edge Case Test
✅ 1x Error Case Test
✅ Alle Tests aus Task Test Plan

VERBOTEN:
❌ Tests überspringen
❌ "TODO: Write test" Platzhalter
❌ Tests die nur "pass" enthalten
❌ Unvollständige Tests
❌ Tests ohne Assertions
```

**Test Example - BAD:**

```python
# ❌ BAD TESTS
def test_user():
    pass  # TODO: Write test

def test_user2():
    user = create_user()
    # No assertion!
```

**Test Example - GOOD:**

```python
# ✅ GOOD TESTS
import pytest
from src.users import create_user, UserValidationError

class TestUserCreation:
    """Tests for user creation functionality."""
    
    def test_create_user_with_valid_data(self):
        """Test user creation with all valid fields."""
        user = create_user(
            email="test@example.com",
            password="SecurePass123!",
            name="John Doe"
        )
        assert user.email == "test@example.com"
        assert user.name == "John Doe"
        assert user.is_active is True
        assert user.is_verified is False
    
    def test_create_user_without_name(self):
        """Test user creation with optional name field empty."""
        user = create_user(
            email="test@example.com",
            password="SecurePass123!"
        )
        assert user.email == "test@example.com"
        assert user.name is None
    
    def test_create_user_with_invalid_email(self):
        """Test error handling for invalid email format."""
        with pytest.raises(UserValidationError, match="Invalid email"):
            create_user(
                email="invalid-email",
                password="SecurePass123!"
            )
    
    def test_create_user_with_weak_password(self):
        """Test error handling for password validation."""
        with pytest.raises(UserValidationError, match="Password too weak"):
            create_user(
                email="test@example.com",
                password="123"
            )
    
    @pytest.mark.parametrize("email,password,expected_error", [
        ("", "Pass123!", "Email cannot be empty"),
        ("test@example.com", "", "Password cannot be empty"),
        ("invalid", "Pass123!", "Invalid email format"),
    ])
    def test_create_user_validation_errors(self, email, password, expected_error):
        """Test various validation error scenarios."""
        with pytest.raises(UserValidationError, match=expected_error):
            create_user(email=email, password=password)
```

**Fehlermeldung bei unvollständigen Tests:**

```
❌ Test Suite unvollständig

Datei: tests/unit/test_users.py
Function: create_user
Probleme: 4

1. ❌ Nur 2 Tests geschrieben
   Gefunden: test_user, test_user2
   Task Test Plan verlangt: 5 Tests
   
   Fehlende Tests:
   - test_create_user_with_invalid_email()
   - test_create_user_with_weak_password()
   - test_create_user_validation_errors() (parametrized)

2. ❌ Kein Edge Case Test
   Keine Tests für Boundary Conditions
   
   → Füge hinzu:
     - test_create_user_with_empty_name()
     - test_create_user_with_max_length_fields()

3. ❌ Fehlende Error Case Tests
   Keine Tests für Fehlerbehandlung
   
   → Füge hinzu:
     - test_create_user_with_invalid_data()
     - test_create_user_database_error()

4. ❌ Test Platzhalter gefunden
   Zeile 45: def test_user(): pass  # TODO
   
   → Implementiere vollständigen Test

Action erforderlich:
  Tests sind MANDATORY. Implementiere ALLE fehlenden Tests
  aus Task Test Plan bevor Task als complete markiert wird.
```

---

### 4. Test Execution Validation (MANDATORY!)

**CRITICAL: Test-Ausführung ist NICHT optional!**

```markdown
CHECK während Test-Execution (Phase 5):

✅ Affected tests executed?
✅ ALL unit tests executed?
✅ ALL integration tests executed?
✅ Coverage check executed?
✅ Test results dokumentiert?

MANDATORY Test Commands:
$ pytest tests/unit/ -v --tb=short
$ pytest tests/integration/ -v --tb=short
$ pytest tests/ --cov=src --cov-report=term

VERBOTEN:
❌ "Tests probably pass"
❌ Nur affected tests run
❌ Skip integration tests
❌ Ignore test failures
❌ Continue ohne test execution
❌ Mock test results
```

**Test Execution Results Required:**

```bash
# MUST BE DOCUMENTED:

Test Execution Results:
✅ Unit Tests: X/X passed
✅ Integration Tests: Y/Y passed
✅ Coverage: Z% (threshold: 90%)
✅ Execution Time: N seconds

OR if failed:
❌ Unit Tests: X/Y passed, Z FAILED
❌ Integration Tests: A/B passed, C FAILED
→ Error Log MUST be created
```

**Fehlermeldung bei fehlender Test-Ausführung:**

```
❌ CRITICAL: Tests nicht ausgeführt!

Task: TASK-001-001-create-user-model
Status: Implementation complete
Test Execution: ❌ MISSING

Problem: Task kann NICHT als complete markiert werden ohne:
  1. ALLE Tests ausgeführt
  2. ALLE Tests passing
  3. Test Results dokumentiert

Action erforderlich:
  Führe folgende Commands aus:
  
  $ pytest tests/unit/test_users.py -v
  $ pytest tests/unit/ -v
  $ pytest tests/integration/ -v
  $ pytest tests/ --cov=src --cov-report=term
  
  Dokumentiere Results im Task-Commit.

MANDATORY: No Code ships without test execution!
```

---

### 5. Test Failure Handling (MANDATORY!)

**Wenn Tests fehlschlagen:**

```markdown
CHECK bei Test-Failures:

✅ Error Log erstellt?
✅ Error Log Format korrekt?
✅ Alle Failures dokumentiert?
✅ Stack Traces enthalten?
✅ Code Context enthalten?
✅ Environment Info enthalten?
✅ @debugger notified?
✅ Task execution STOPPED?

MANDATORY Error Log Creation:
File: logs/ERROR-TASK-{FEATURE}-{TASK}-{YYYY-MM-DD}-{HHMM}.md

VERBOTEN:
❌ Test-Failures ignorieren
❌ "Will fix later"
❌ Commit trotz failing tests
❌ Continue to next task
❌ Mark task as complete
```

**Error Log Template Required:**

```markdown
# Error Log: TASK-XXX-YYY

**Task ID:** TASK-XXX-YYY  
**Task Title:** [Title]  
**Date:** YYYY-MM-DD HH:MM  
**Developer:** Developer Mode  
**Status:** ❌ Tests Failed  

## Error Summary
**Failed Tests:** X out of Y tests failed  
**Test Type:** Unit | Integration | Both  
**Severity:** High | Medium | Low

## Test Failures
[Detaillierte Test-Failure-Info]

## Code Context
[Relevanter Code]

## Environment Information
[Environment Details]

## Attempted Solutions
[Was wurde versucht]

## Next Steps for @debugger
[Was Debugger analysieren soll]
```

**Fehlermeldung bei fehlender Error Log Creation:**

```
❌ CRITICAL: Error Log nicht erstellt!

Test Results:
❌ Unit Tests: 12/15 passed, 3 FAILED
❌ Integration Tests: 5/8 passed, 3 FAILED

MANDATORY Action:
  Wenn Tests fehlschlagen, MUSS Error Log erstellt werden!

Action erforderlich:
  1. Erstelle: logs/ERROR-TASK-001-001-2025-10-07-1430.md
  2. Dokumentiere ALLE Test Failures
  3. Include Stack Traces
  4. Include Code Context
  5. Include Environment Info
  6. Notify @debugger
  7. STOP Task Execution

Template: .github/templates/ERROR-LOG-TEMPLATE.md

UNTIL Error Log created, task is BLOCKED!
```

---

### 6. Acceptance Criteria Validation

**Vor Marking Task Complete:**

```markdown
CHECK Acceptance Criteria:

✅ Alle Criteria aus Task erfüllt?
✅ Functionality wie spezifiziert?
✅ Edge Cases behandelt?
✅ Performance akzeptabel?
✅ Keine Regressionen?

ALLE Criteria müssen ✅ sein:
- [ ] Criterion 1 aus Task
- [ ] Criterion 2 aus Task
- [ ] Criterion 3 aus Task
- [ ] ALL Tests passed
- [ ] Coverage >90%

VERBOTEN:
❌ "Mostly works"
❌ "Good enough"
❌ Unerfüllte Criteria ignorieren
```

**Fehlermeldung bei unerfüllten Criteria:**

```
⚠️ Acceptance Criteria nicht erfüllt

Task: TASK-001-001-create-user-model
Status: Implementation complete
Acceptance Criteria: 3/5 ✅

Erfüllte Criteria:
  ✅ User model has all required fields
  ✅ Email field has unique constraint
  ✅ Migration runs successfully

Nicht erfüllte Criteria:
  ❌ Timestamps auto-update
     → created_at/updated_at nicht automatisch
  ❌ All tests pass
     → 2 Tests failing

Action erforderlich:
  Fix unerfüllte Criteria:
  
  1. Timestamps auto-update:
     Add server_default=func.now() and onupdate=func.now()
  
  2. Fix failing tests:
     Run tests und behebe Failures

Task kann NICHT als complete markiert werden bis
ALLE Acceptance Criteria erfüllt sind!
```

---

### 7. Definition of Done Validation

**Final Check vor Commit:**

```markdown
CHECK Definition of Done:

✅ Code implemented as specified?
✅ Unit tests written and passing?
✅ Integration tests written and passing?
✅ Code reviewed (self-review)?
✅ Documentation updated?
✅ No TODOs oder Platzhalter?
✅ Clean Code Principles befolgt?
✅ BACKLOG.md Code-Mapping bereit?

ALLE Items müssen ✅ sein!

VERBOTEN:
❌ "Almost done"
❌ Skip DoD Items
❌ "Will do later"
```

**Fehlermeldung bei unvollständigem DoD:**

```
❌ Definition of Done nicht erfüllt

Task: TASK-001-001-create-user-model
DoD Status: 5/7 ✅

Erfüllte Items:
  ✅ Code implemented as specified
  ✅ Unit tests written and passing
  ✅ Integration tests written and passing
  ✅ Code reviewed (self-review)
  ✅ No TODOs oder Platzhalter

Nicht erfüllte Items:
  ❌ Documentation updated
     → Docstrings vorhanden, aber README nicht updated
  ❌ BACKLOG.md Code-Mapping prepared
     → Code-Mapping fehlt für Task

Action erforderlich:
  1. Update README.md:
     Füge User Model Dokumentation hinzu
  
  2. Prepare Code-Mapping:
     Erstelle Entry für BACKLOG.md:
     Code: `src/models/user.py`, `tests/unit/test_user_model.py`

Task kann NICHT committed werden bis DoD 100% erfüllt!
```

---

### 8. Commit Message Validation

**Commit Message Quality Check:**

```markdown
CHECK Commit Message:

✅ Type correct? (feat|fix|test|docs|refactor|chore)
✅ Scope present?
✅ Brief description clear?
✅ Implementation section vorhanden?
✅ Testing section vorhanden?
✅ Test results dokumentiert?
✅ References Task?
✅ References Feature/Issue?

Format:
type(scope): TASK-XXX-YYY - Brief description

Implementation:
- Change 1
- Change 2

Testing:
- Unit tests: X passing
- Integration tests: Y passing
- Coverage: Z%

Closes TASK-XXX-YYY
References FEATURE-XXX, ISSUE-XXX
```

**Beispiel - BAD Commit:**

```
❌ BAD:
"added user model"

Problems:
1. No type
2. No scope
3. No task reference
4. No testing info
```

**Beispiel - GOOD Commit:**

```
✅ GOOD:
feat(models): TASK-001-001 - create User database model

Implementation:
- Created User model with email, password_hash fields
- Added unique constraint on email
- Added automatic timestamps (created_at, updated_at)
- Created Alembic migration for users table

Testing:
- Unit tests: 15/15 passing
- Integration tests: 8/8 passing
- Coverage: 94%

Closes TASK-001-001
References FEATURE-001, ISSUE-001
```

**Fehlermeldung bei schlechter Commit Message:**

```
⚠️ Commit Message unzureichend

Gefunden: "added user model"

Probleme:
1. ❌ Kein Type (feat|fix|...)
2. ❌ Kein Scope (models)
3. ❌ Kein Task Reference
4. ❌ Keine Implementation Details
5. ❌ Keine Testing Information
6. ❌ Keine References

Action erforderlich:
  Schreibe informative Commit Message mit:
  - Type und Scope
  - Task Reference
  - Implementation Details
  - Testing Results
  - References zu Feature/Issue

Template: .github/templates/COMMIT-MESSAGE-TEMPLATE.txt
```

---

## 🎯 Test-Enforcement Rules (CANNOT BE BYPASSED)

**Diese Regeln sind NICHT optional:**

### Rule 1: No Code Without Tests

```
❌ NICHT ERLAUBT:
- Code schreiben ohne Tests
- Tests "später" schreiben
- Tests überspringen

✅ MANDATORY:
- Tests schreiben (Phase 4)
- Tests ausführen (Phase 5)
- Tests passing (Phase 5)
```

### Rule 2: ALL Tests Must Pass

```
❌ NICHT ERLAUBT:
- Commit mit failing tests
- "Most tests pass"
- Failing tests ignorieren

✅ MANDATORY:
- 100% Tests passing
- Error Log if failures
- @debugger notification
```

### Rule 3: Comprehensive Testing Required

```
❌ NICHT ERLAUBT:
- Nur affected tests run
- Skip integration tests
- "Assume tests pass"

✅ MANDATORY:
- ALL unit tests run
- ALL integration tests run
- Coverage check performed
```

### Rule 4: Error Logs for Failures

```
❌ NICHT ERLAUBT:
- Continue without Error Log
- Skip Error Log creation
- "Will fix myself"

✅ MANDATORY:
- Create Error Log immediately
- Document all failures
- Notify @debugger
- STOP task execution
```

### Rule 5: Coverage Maintained

```
❌ NICHT ERLAUBT:
- Coverage drop below 90%
- "Coverage doesn't matter"
- Skip coverage check

✅ MANDATORY:
- Maintain >90% coverage
- New code 100% coverage
- Coverage check in tests
```

---

## 📊 Quality Gate Development (QGD)

**Pre-Commit Validation:**

```markdown
QGD Check:

Phase 1: Task Understanding
✅ Task file valid and complete?
✅ Test Plan present and clear?

Phase 2: Dependencies
✅ All dependency tasks complete?
✅ Environment ready?

Phase 3: Implementation
✅ Code follows specification?
✅ Clean Code Principles applied?
✅ No TODOs or placeholders?

Phase 4: Test Creation (CRITICAL!)
✅ ALL tests from Test Plan written?
✅ Edge cases covered?
✅ Error cases covered?
✅ Test quality good?

Phase 5: Test Execution (CRITICAL!)
✅ ALL tests executed?
✅ ALL tests passing?
✅ Coverage >90%?
✅ No regressions?

Phase 6: Acceptance Criteria
✅ All criteria fulfilled?

Phase 7: Definition of Done
✅ All DoD items checked?

Phase 8: Commit
✅ Commit message informative?
✅ Code-Mapping prepared?

Wenn ALLE ✅:
  → Commit allowed
  → Update BACKLOG.md
  → Continue to next task

Wenn EIN ❌:
  → BLOCK Commit
  → Show specific failure
  → Require fix
```

**QGD Report Format:**

```
🚀 QGD (Quality Gate Development) Check: TASK-001-001

┌────────────────────────────────────────┐
│ Phase 1: Task Understanding ✅         │
│ Phase 2: Dependencies ✅               │
│ Phase 3: Implementation ✅             │
│ Phase 4: Test Creation ✅              │
│   - Unit Tests: 15 tests written       │
│   - Edge Cases: 5 tests                │
│   - Error Cases: 3 tests               │
│ Phase 5: Test Execution ✅             │
│   - Unit Tests: 15/15 passing          │
│   - Integration: 8/8 passing           │
│   - Coverage: 94% (>90% ✅)            │
│ Phase 6: Acceptance Criteria ✅        │
│   - All 5 criteria met                 │
│ Phase 7: Definition of Done ✅         │
│   - All 7 DoD items complete           │
│ Phase 8: Commit Ready ✅               │
│   - Message informative                │
│   - Code-Mapping prepared              │
└────────────────────────────────────────┘

🎉 QGD PASSED! Ready to Commit

Next: Commit and update BACKLOG.md
```

---

## 🚨 Critical Validation Failures

**INSTANT BLOCKS (Cannot Proceed):**

1. **❌ Tests Not Written**
   ```
   BLOCK: Cannot proceed past Phase 4 without tests
   REASON: Test-Driven Development is MANDATORY
   ACTION: Write ALL tests from Test Plan
   ```

2. **❌ Tests Not Executed**
   ```
   BLOCK: Cannot mark task complete without test execution
   REASON: Test execution is MANDATORY
   ACTION: Run ALL tests (unit + integration + coverage)
   ```

3. **❌ Tests Failing**
   ```
   BLOCK: Cannot commit with failing tests
   REASON: Only passing tests can be committed
   ACTION: Create Error Log → Notify @debugger → STOP
   ```

4. **❌ Coverage Below 90%**
   ```
   BLOCK: Cannot proceed with insufficient coverage
   REASON: >90% coverage is MANDATORY
   ACTION: Add tests to increase coverage
   ```

5. **❌ Error Log Not Created (when tests fail)**
   ```
   BLOCK: Cannot continue without Error Log
   REASON: Debugging requires documentation
   ACTION: Create complete Error Log → Notify @debugger
   ```

---

## 💬 Validation Message Formats

### Success Format:

```
✅ {PHASE}

Validation successful:
  ✅ {Check 1}
  ✅ {Check 2}

Status: Ready for {Next Phase}
```

### Critical Block Format:

```
❌ CRITICAL: {PHASE} BLOCKED

Blocking Issue:
  ❌ {Issue Description}

Impact: {Impact Description}

Action Required:
  1. {Specific Action 1}
  2. {Specific Action 2}

CANNOT PROCEED until resolved!
```

---

## 🔄 Integration Points

### Mit Architect:

```
Architect erstellt Task
  ↓
Includes Test Plan (MANDATORY)
  ↓
Developer reads Task
  ↓
Validates Test Plan presence
  ↓
If missing → Notify @architect
```

### Mit Debugger:

```
Developer runs tests
  ↓
Tests fail ❌
  ↓
Create Error Log (MANDATORY)
  ↓
Notify @debugger
  ↓
STOP task execution
  ↓
Wait for @debugger fix
```

---

## 📋 Zusammenfassung

Diese Instructions stellen sicher:

✅ **Test-First Approach** - Tests sind MANDATORY, nicht optional  
✅ **Quality Enforcement** - Clean Code + Type Hints + Validation  
✅ **Comprehensive Testing** - ALL Tests run, >90% Coverage  
✅ **Error Handling** - Error Logs bei Test-Failures  
✅ **Documentation** - Code, Tests, Commits vollständig dokumentiert  
✅ **No Shortcuts** - Kein Code shipped ohne Tests  

**Ziel:** Stelle sicher, dass JEDER Task dem Quality-Standard entspricht - mit MANDATORY Testing als Fundament!

---

**Version:** 1.0  
**Last Updated:** 2025-10-07  
**Critical Feature:** Test-Enforcement (MANDATORY)  
**Integration:** Works with developer.chatmode.md and debugger.chatmode.md