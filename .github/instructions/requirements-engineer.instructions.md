---
applyTo: "requirements/**/*.md, BACKLOG.md"
description: "Automatische Validierungs- und Qualitätsregeln für Requirements Engineering"
autoLoad: true
---

# Requirements Engineer - Validation & Quality Rules

Diese Instructions werden **automatisch** angewendet beim Arbeiten mit Requirements-Dateien. Sie ergänzen den Requirements Engineer Chatmode mit spezifischen Validierungs- und Quality-Checks.

> **Wichtig:** Diese Regeln gelten zusätzlich zu `.github/chatmodes/requirements-engineer.chatmode.md`

## 📁 Unterstützte Dateitypen

Diese Validierungsregeln greifen bei:

```
✅ requirements/epics/EPIC-*.md
✅ requirements/features/FEATURE-*.md
✅ requirements/issues/ISSUE-*.md
✅ requirements/improvements/IMPROVEMENT-*.md
✅ requirements/bugfixes/BUGFIX-*.md
✅ BACKLOG.md (Master-Tracking-Dokument)
```

---

## 🔍 Automatische Validierungen

### 1. Dateinamen-Konventionen

**Pattern-Validierung beim Erstellen/Speichern:**

```javascript
// Automatische Checks
const patterns = {
  epic: /^EPIC-\d{3}-[a-z0-9-]+\.md$/,
  feature: /^FEATURE-\d{3}-[a-z0-9-]+\.md$/,
  issue: /^ISSUE-\d{3}-[a-z0-9-]+\.md$/,
  improvement: /^IMPROVEMENT-\d{3}-[a-z0-9-]+\.md$/,
  bugfix: /^BUGFIX-\d{3}-[a-z0-9-]+\.md$/
};
```

**Beispiele:**

```markdown
✅ EPIC-001-customer-portal.md
✅ FEATURE-042-user-authentication.md
✅ ISSUE-127-oauth2-integration.md
✅ IMPROVEMENT-001-add-2fa-support.md
✅ BUGFIX-001-fix-email-validation.md

❌ epic-001.md                       (missing prefix)
❌ EPIC-1-portal.md                  (number not 3-digit)
❌ EPIC-001-Customer Portal.md       (spaces not allowed)
❌ EPIC-001-CustomerPortal.md        (camelCase not allowed)
❌ improvement_001.md                (underscore not allowed)
```

**Fehlermeldung bei Verstoß:**

```
❌ Dateiname-Validierung fehlgeschlagen

Datei: epic-customer-portal.md
Problem: Entspricht nicht dem Pattern EPIC-XXX-slug.md

Korrekt wäre: EPIC-001-customer-portal.md

Format-Regeln:
  • PREFIX-XXX-descriptive-slug.md
  • PREFIX: EPIC|FEATURE|ISSUE|IMPROVEMENT|BUGFIX
  • XXX: 3-stellige Nummer (001-999)
  • slug: lowercase, nur a-z, 0-9, Bindestriche
```

---

### 2. Hierarchie-Validierung

**Bidirektionale Verlinkung prüfen:**

#### Für EPIC-Dateien:

```markdown
CHECK beim Speichern:

1. ✅ Section "Related Features" vorhanden?
2. ✅ Alle verlinkten FEATURE-XXX Dateien existieren?
3. ✅ Jedes verlinkte Feature referenziert dieses Epic zurück?
4. ✅ Story Points = Summe aller Feature Story Points?

Beispiel-Header:
> **ID:** EPIC-001  
> **Story Points:** 21 (=8+5+8)  ← Muss Summe der Features sein!
```

#### Für FEATURE-Dateien:

```markdown
CHECK beim Speichern:

1. ✅ Epic-Referenz im Header vorhanden?
2. ✅ Epic-Datei existiert?
3. ✅ Epic listet dieses Feature in "Related Features"?
4. ✅ Section "Related Issues" vorhanden?
5. ✅ Alle verlinkten Issues existieren?
6. ✅ Story Points = Summe aller Issue Story Points?

Beispiel-Header:
> **Epic:** [EPIC-001](../epics/EPIC-001-customer-portal.md)  
> **Story Points:** 8 (=3+2+3)  ← Muss Summe der Issues sein!
```

#### Für ISSUE-Dateien:

```markdown
CHECK beim Speichern:

1. ✅ Epic-Referenz vorhanden?
2. ✅ Feature-Referenz vorhanden?
3. ✅ Beide Dateien existieren?
4. ✅ Feature listet dieses Issue in "Related Issues"?
5. ✅ Min. 2 vollständige Gherkin-Scenarios?
6. ✅ Acceptance Criteria messbar?

Beispiel-Header:
> **Epic:** [EPIC-001](../epics/EPIC-001-customer-portal.md)  
> **Feature:** [FEATURE-003](../features/FEATURE-003-user-auth.md)  
> **Story Points:** 3
```

#### Für IMPROVEMENT-Dateien:

```markdown
CHECK beim Speichern:

1. ✅ Original Issue-Referenz vorhanden?
2. ✅ Issue-Datei existiert?
3. ✅ Architecture Impact dokumentiert?
4. ✅ Gherkin-Scenarios für neue Funktionalität?

Beispiel-Header:
> **Original Issue:** [ISSUE-042](../issues/ISSUE-042-login-system.md)  
> **Type:** Enhancement  
> **Architecture Impact:** Medium
```

#### Für BUGFIX-Dateien:

```markdown
CHECK beim Speichern:

1. ✅ Original Issue-Referenz vorhanden?
2. ✅ Bug Description klar beschrieben?
3. ✅ Steps to Reproduce vorhanden?
4. ✅ Expected vs Actual Behavior dokumentiert?
5. ✅ Root Cause analysiert?

Beispiel-Header:
> **Original Issue:** [ISSUE-127](../issues/ISSUE-127-oauth-flow.md)  
> **Severity:** High  
> **Architecture Impact:** Low
```

**Fehlermeldung bei Hierarchie-Bruch:**

```
❌ Hierarchie-Validierung fehlgeschlagen

Datei: ISSUE-042-user-login.md
Problem: Referenziertes Feature listet dieses Issue nicht

Gefunden im Header:
  > **Feature:** FEATURE-003-authentication.md

ABER: FEATURE-003 enthält ISSUE-042 nicht in "Related Issues"

Aktion erforderlich:
  1. Füge in FEATURE-003-authentication.md hinzu:
     - [ISSUE-042](../issues/ISSUE-042-user-login.md)
  
  ODER
  
  2. Korrigiere Feature-Referenz in diesem Issue
```

---

### 3. Gherkin-Qualitätsprüfung

**Automatische Scenario-Validierung:**

```markdown
CHECK für jedes Issue:

✅ Min. 2 vollständige Scenarios vorhanden
✅ Jedes Scenario hat: Given, When, Then
✅ Keine Platzhalter wie [X], TODO, TBD
✅ Konkrete Werte statt "some", "multiple"
✅ And/But korrekt verwendet (nach Given/When/Then)

VERBOTEN:
❌ Scenario: [To be defined]
❌ Given some user
❌ When they do something
❌ Then [expected result]
❌ # TODO: Add more scenarios
```

**Beispiel - FALSCH:**

```gherkin
Scenario: User Login
  Given some user exists
  When they login with credentials
  Then they should see the dashboard
  # TODO: Add error cases
```

**Beispiel - RICHTIG:**

```gherkin
Scenario: Successful Login with Valid Credentials
  Given a registered user with email "john@example.com" and password "SecurePass123!"
  And the user is on the login page
  When the user enters email "john@example.com"
  And the user enters password "SecurePass123!"
  And the user clicks the "Login" button
  Then the user is redirected to "/dashboard"
  And the user sees welcome message "Welcome back, John!"
  And the session cookie is set with expiry 24 hours

Scenario: Login Failure with Invalid Password
  Given a registered user with email "john@example.com"
  And the user is on the login page
  When the user enters email "john@example.com"
  And the user enters incorrect password "WrongPass"
  And the user clicks the "Login" button
  Then the user remains on the login page
  And an error message is displayed: "Invalid credentials"
  And the password field is cleared
  And no session cookie is set
```

**Fehlermeldung bei schlechten Scenarios:**

```
❌ Gherkin-Qualitätsprüfung fehlgeschlagen

Datei: ISSUE-042-user-login.md
Probleme gefunden: 3

1. ❌ Scenario 1 "User Login" - zu vage
   Gefunden: "Given some user exists"
   Problem: "some user" ist zu unspezifisch
   Fix: "Given a registered user with email 'john@example.com'"

2. ❌ Scenario 1 hat keinen Then-Block
   Problem: Jedes Scenario braucht Given-When-Then
   
3. ❌ Nur 1 Scenario vorhanden
   Mindestanforderung: 2 vollständige Scenarios
   Fehlt: Negativer Test (Fehlerfall)

Aktion erforderlich:
  • Konkretisiere vage Formulierungen
  • Vervollständige alle Scenarios
  • Füge mind. 1 Error-Case Scenario hinzu
```

---

### 4. Business-Value-Validierung

**Quantifizierungs-Check:**

```markdown
CHECK Business Value Section:

✅ Enthält messbare Metriken?
✅ Verwendet konkrete Zahlen?
✅ Vermeidet vage Aussagen?

ERLAUBT (konkret):
✅ "Reduziert Registrierungszeit um 60% (von 5min auf 2min)"
✅ "Steigert Conversion Rate von 12% auf 18% (+50%)"
✅ "Einsparung von 40h/Monat im Support"
✅ "Erhöht Customer Satisfaction Score von 7.2 auf 8.5"

VERBOTEN (zu vage):
❌ "Verbessert User Experience"
❌ "Macht den Prozess schneller"
❌ "Erhöht die Zufriedenheit"
❌ "Reduziert Kosten deutlich"
```

**Fehlermeldung bei vagem Business Value:**

```
⚠️ Business-Value nicht ausreichend quantifiziert

Datei: FEATURE-042-user-authentication.md
Gefunden: "Improves security and user experience"

Problem: Zu vage, nicht messbar

Benötigt wird mindestens EINE konkrete Metrik:
  • Zeit-Einsparung (z.B. "60% schneller")
  • Kosten-Reduktion (z.B. "€15k/Jahr Einsparung")
  • Conversion (z.B. "Sign-ups +25%")
  • Qualität (z.B. "NPS von 7.2 auf 8.5")
  • User-Zahlen (z.B. "+10,000 aktive User")

Beispiele:
  ✅ "Reduziert Support-Tickets um 40% (von 200/Woche auf 120/Woche)"
  ✅ "Erhöht Conversion Rate von 12% auf 18% = +50% mehr Registrierungen"
  ✅ "Einspart 40h/Monat Entwicklerzeit = €6,000/Jahr"
```

---

### 5. Story-Points-Konsistenz

**Automatische Summen-Validierung:**

```javascript
// Automatische Berechnung beim Speichern
function validateStoryPoints(file) {
  if (file.type === 'EPIC') {
    const declaredPoints = extractStoryPoints(file.header);
    const features = findRelatedFeatures(file);
    const calculatedPoints = sum(features.map(f => f.storyPoints));
    
    if (declaredPoints !== calculatedPoints) {
      throw new ValidationError(
        `EPIC Story Points Mismatch!\n` +
        `Declared: ${declaredPoints}\n` +
        `Calculated: ${calculatedPoints} (sum of ${features.length} features)\n` +
        `Fix: Update EPIC header to ${calculatedPoints} SP`
      );
    }
  }
  
  // Analog für FEATURE → Issues
}
```

**Fehlermeldung bei Inkonsistenz:**

```
❌ Story Points Inkonsistenz erkannt

Datei: EPIC-001-customer-portal.md
Header: "Story Points: 25"

Aber: Summe der Related Features = 21 SP
  • FEATURE-001: 8 SP
  • FEATURE-002: 5 SP
  • FEATURE-003: 8 SP
  -------------------
  Gesamt:      21 SP  ← Sollwert!

Aktion erforderlich:
  Aktualisiere EPIC Header:
  > **Story Points:** 21

ODER falls Features fehlen:
  Füge fehlende Features hinzu (4 SP fehlen)
```

---

### 6. Required Sections Check

**Template-Compliance prüfen:**

#### EPIC Template:

```markdown
REQUIRED Sections (12/12):

✅ Header (ID, Story Points, Priority, Status)
✅ Business Context
✅ Strategic Goals
✅ Target Users
✅ Success Metrics
✅ Related Features
✅ Dependencies
✅ Assumptions
✅ Constraints
✅ Risks
✅ Timeline
✅ Stakeholders
```

#### FEATURE Template:

```markdown
REQUIRED Sections (11/11):

✅ Header (Epic, ID, Story Points, Priority, Status)
✅ Business Context
✅ User Benefit
✅ Success Criteria
✅ Related Issues
✅ Technical Considerations
✅ Dependencies
✅ Assumptions
✅ Acceptance Criteria
✅ Edge Cases
✅ Out of Scope
```

#### ISSUE Template:

```markdown
REQUIRED Sections (9/9):

✅ Header (Epic, Feature, ID, Story Points, Priority, Status)
✅ Business Context
✅ User Story
✅ Acceptance Criteria
✅ Gherkin Scenarios (min. 2)
✅ Technical Notes
✅ Dependencies
✅ Edge Cases
✅ Out of Scope
```

#### IMPROVEMENT Template:

```markdown
REQUIRED Sections (8/8):

✅ Header (Original Issue, Type, Architecture Impact)
✅ Current Behavior
✅ Proposed Enhancement
✅ Business Justification
✅ Gherkin Scenarios (for new functionality)
✅ Architecture Impact Analysis
✅ Migration Strategy
✅ Dependencies
```

#### BUGFIX Template:

```markdown
REQUIRED Sections (10/10):

✅ Header (Original Issue, Severity, Architecture Impact)
✅ Bug Description
✅ Steps to Reproduce
✅ Expected Behavior
✅ Actual Behavior
✅ Root Cause Analysis
✅ Proposed Fix
✅ Test Scenarios
✅ Regression Risk
✅ Dependencies
```

**Fehlermeldung bei fehlenden Sections:**

```
❌ Template-Compliance fehlgeschlagen

Datei: FEATURE-042-authentication.md
Status: 8/11 Sections vorhanden

Fehlende Sections:
  ❌ ## Edge Cases
  ❌ ## Out of Scope
  ❌ ## Assumptions

Aktion erforderlich:
  Füge die fehlenden Sections hinzu.
  Template: requirements/templates/FEATURE-TEMPLATE.md
```

---

### 7. BACKLOG.md Integration

**Automatische Tracking-Validierung:**

```markdown
CHECK beim Erstellen eines neuen Items:

1. ✅ Ist das Item in BACKLOG.md registriert?
2. ✅ Status in BACKLOG.md korrekt?
3. ✅ Code Mapping vorhanden (wenn Status = In Progress/Done)?
4. ✅ Hierarchie in BACKLOG.md konsistent?

Beispiel BACKLOG.md Entry:

## EPIC-001: Customer Portal
Status: 🚧 In Progress | Priority: P0-Critical | SP: 21

### FEATURE-003: User Authentication
Status: ✅ Done | Priority: P0-Critical | SP: 8

#### ISSUE-042: OAuth2 Login Integration
Status: ✅ Done | Priority: P0-Critical | SP: 3
Code: `src/auth/oauth.py`, `tests/test_oauth.py`

##### IMPROVEMENT-001: Add 2FA Support
Status: 📋 Not Started | Architecture Impact: Medium
Enhances: ISSUE-042 | Code: `src/auth/two_factor.py`

##### BUGFIX-001: Fix Token Refresh Logic
Status: 🚧 In Progress | Severity: High
Fixes: ISSUE-042 | Code: `src/auth/oauth.py` (lines 87-112)
```

**Fehlermeldung bei fehlender BACKLOG-Integration:**

```
⚠️ BACKLOG.md nicht aktualisiert

Datei: ISSUE-042-oauth-login.md
Problem: Dieses Issue ist nicht in BACKLOG.md registriert

Aktion erforderlich:
  1. Öffne BACKLOG.md
  2. Füge unter FEATURE-003 hinzu:
  
     #### ISSUE-042: OAuth2 Login Integration
     Status: 📋 Not Started | Priority: P0-Critical | SP: 3
     
  3. Speichere BACKLOG.md
```

---

### 8. Placeholder-Erkennung

**Zero-Tolerance für Platzhalter:**

```markdown
VERBOTENE Patterns:

❌ [X], [Y], [Z]
❌ TODO, TBD, FIXME
❌ <placeholder>
❌ ... (ellipsis ohne Kontext)
❌ "tbd", "to be defined"
❌ "XXX", "YYY" (als Platzhalter)
❌ "Coming soon"
❌ "Will be added later"

ERLAUBT (wenn semantisch):
✅ "... and more" (am Ende einer Liste)
✅ "TODO list" (als Feature-Name)
✅ [ISSUE-001] (als Link)
```

**Scan-Funktion:**

```javascript
function detectPlaceholders(content) {
  const forbiddenPatterns = [
    /\[X\]/gi,
    /\[Y\]/gi,
    /\bTODO\b(?![\s-]list)/gi,  // "TODO" aber nicht "TODO list"
    /\bTBD\b/gi,
    /\bFIXME\b/gi,
    /<placeholder>/gi,
    /\bcoming soon\b/gi,
    /will be added later/gi,
    /to be defined/gi,
    /\.\.\.\s*$/gm  // Ellipsis am Zeilenende
  ];
  
  const found = [];
  forbiddenPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) found.push(...matches);
  });
  
  return found;
}
```

**Fehlermeldung bei Platzhaltern:**

```
❌ Platzhalter erkannt (Zero-Tolerance!)

Datei: FEATURE-042-authentication.md
Gefundene Platzhalter: 4

Zeile 23: "User roles include: Admin, User, [TODO: add more]"
Zeile 45: "## Technical Considerations: TBD"
Zeile 67: "OAuth providers: Google, [X], [Y]"
Zeile 89: "Performance targets: will be added later"

Aktion erforderlich:
  Ersetze ALLE Platzhalter durch konkrete Werte.
  
  Requirements müssen vollständig sein!
  Nutze "Out of Scope" wenn etwas absichtlich fehlt.
```

---

## 📊 QG1-Readiness Check

**Quality Gate 1 = Requirements Complete**

```markdown
QG1-Check läuft automatisch beim Markieren als "Ready for Architecture":

✅ All Hierarchie-Checks bestanden
✅ All Gherkin-Scenarios vollständig und qualitativ
✅ Business Value quantifiziert
✅ Story Points konsistent
✅ Alle Required Sections vorhanden
✅ Keine Platzhalter
✅ BACKLOG.md aktualisiert
✅ Acceptance Criteria messbar

Wenn ALLE Checks ✅:
  → Status: "QG1-approved - Ready for Architecture"
  → Übergabe an Architect Chatmode möglich

Wenn ANY Check ❌:
  → Blockiert für Architecture
  → Detaillierte Fehler werden angezeigt
```

**QG1-Report Format:**

```
🎯 QG1-Readiness Check: FEATURE-042-authentication.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Dateiname korrekt
✅ Hierarchie vollständig (Epic ↔ Feature ↔ Issues)
✅ 3 Issues verlinkt, alle existieren
✅ Gherkin: 6/6 Scenarios vollständig
✅ Business Value quantifiziert: "Reduziert Login-Zeit um 70%"
✅ Story Points konsistent: 8 SP = sum(3+2+3)
✅ Template: 11/11 Sections complete
✅ Keine Platzhalter gefunden
✅ BACKLOG.md aktualisiert
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 QG1-APPROVED! Ready for Architecture Planning

Next Step: Übergabe an Architect Chatmode
```

---

## 🔄 Feedback-Loop mit Architect

**Wenn Architect Feedback gibt:**

```markdown
Architect kann folgende Feedback-Types zurückgeben:

1. **NEW_FEATURE_NEEDED**
   → Erstelle neues FEATURE-XXX.md
   → Integriere in bestehende Epic-Hierarchie
   → Update BACKLOG.md

2. **IMPROVEMENT_NEEDED**
   → Erstelle IMPROVEMENT-XXX.md
   → Verlinke mit Original-Issue
   → Dokumentiere Architecture Impact

3. **BUGFIX_NEEDED**
   → Erstelle BUGFIX-XXX.md
   → Analysiere Root Cause
   → Dokumentiere Regression Risk

4. **REQUIREMENTS_UNCLEAR**
   → Überarbeite betroffenes Issue/Feature
   → Konkretisiere vage Formulierungen
   → Füge fehlende Details hinzu
```

**Feedback-Processing Workflow:**

```
Architect meldet: "Need new Feature for Admin Dashboard"

Requirements Engineer:
  1. Erstellt: FEATURE-012-admin-dashboard.md
  2. Fügt hinzu zu: EPIC-001
  3. Erstellt Issues:
     - ISSUE-050-user-management.md
     - ISSUE-051-analytics-view.md
     - ISSUE-052-settings-panel.md
  4. Updated: BACKLOG.md mit neuen Items
  5. Markiert: "QG1-approved" nach Validation
  6. Notified: Architect → "FEATURE-012 ready"
```

---

## 🎨 Validation Messages - Best Practices

### Success Message Format:

```
✅ {DATEINAME}

Validation successful:
  ✅ {Check 1 bestanden}
  ✅ {Check 2 bestanden}
  ✅ {Check 3 bestanden}
  ...

Status: {Status-Info}
Next: {Nächster Schritt}
```

### Warning Message Format:

```
⚠️ {DATEINAME}

Quality warnings (non-blocking):
  ⚠️ {Warning 1}
  ⚠️ {Warning 2}

Recommendations:
  1. {Empfehlung 1}
  2. {Empfehlung 2}

Status: Acceptable but could be improved
```

### Error Message Format:

```
❌ {DATEINAME}

Validation failed ({X}/{Y} checks passed):
  ❌ {Fehler 1 - konkrete Beschreibung}
  ❌ {Fehler 2 - konkrete Beschreibung}

Actions required:
  1. {Konkrete Aktion 1}
  2. {Konkrete Aktion 2}

Template: {Link zum Template falls relevant}
Next: Fix errors and re-validate
```

---

## 🚀 Integration mit Requirements Engineer Chatmode

Diese Validierungsregeln sind **immer aktiv** wenn:

1. Du arbeitest in `requirements/**/*.md` → Auto-Load
2. Du arbeitest in `BACKLOG.md` → Auto-Load
3. Du nutzt Requirements Engineer Chatmode → Referenziert diese Rules
4. Du speicherst eine Requirements-Datei → Validierung läuft automatisch

**Du musst nichts manuell aktivieren!**

---

## 📋 Zusammenfassung

Diese Instructions stellen sicher:

✅ **Dateinamen-Konsistenz** - Einheitliches Naming  
✅ **Hierarchie-Integrität** - Bidirektionale Links funktionieren  
✅ **Gherkin-Qualität** - Vollständige, testbare Scenarios  
✅ **Business-Value-Klarheit** - Quantifizierte Metriken  
✅ **Story-Points-Konsistenz** - Mathematisch korrekte Summen  
✅ **Template-Compliance** - Alle erforderlichen Sections  
✅ **Zero Placeholders** - Keine unvollständigen Requirements  
✅ **BACKLOG-Integration** - Zentrales Tracking funktioniert  
✅ **QG1-Readiness** - Quality Gate für Architecture-Übergabe  

**Ziel:** Stelle sicher, dass JEDES Requirement dem Quality-Standard entspricht - automatisch, systematisch, ohne Ausnahmen!