#!/bin/bash

###############################################################################
# Copilot Structure Setup Script
###############################################################################
#
# Purpose: Kopiert die GitHub Copilot Struktur (Instructions, Chatmodes, etc.)
#          aus diesem Repo in ein bestehendes VS Code Projekt.
#
# Usage:
#   ./setup-copilot-structure.sh <target-project-path>
#
# Example:
#   ./setup-copilot-structure.sh ~/projects/my-vscode-project
#
# What it does:
#   1. Validiert Quell- und Ziel-Verzeichnisse
#   2. Erstellt Backup des Ziel-Projekts
#   3. Kopiert .github/ Struktur (Instructions, Chatmodes, Docs)
#   4. Kopiert requirements/ Struktur (Templates)
#   5. Erstellt architecture/ Struktur (falls nicht vorhanden)
#   6. Zeigt Zusammenfassung und nächste Schritte
#
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO="$SCRIPT_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

###############################################################################
# Validation
###############################################################################

validate_input() {
    print_header "Phase 1: Validierung"
    
    # Check if target path is provided
    if [ $# -eq 0 ]; then
        print_error "Kein Ziel-Verzeichnis angegeben!"
        echo ""
        echo "Usage: $0 <target-project-path>"
        echo ""
        echo "Example:"
        echo "  $0 ~/projects/my-vscode-project"
        exit 1
    fi
    
    TARGET_PROJECT="$1"
    
    # Check if target exists
    if [ ! -d "$TARGET_PROJECT" ]; then
        print_error "Ziel-Verzeichnis existiert nicht: $TARGET_PROJECT"
        exit 1
    fi
    
    print_success "Ziel-Verzeichnis gefunden: $TARGET_PROJECT"
    
    # Check if source repo has required structure
    if [ ! -d "$SOURCE_REPO/.github" ]; then
        print_error "Quell-Repo hat keine .github/ Struktur!"
        exit 1
    fi
    
    print_success "Quell-Repo Struktur validiert"
    
    # Show what will be copied
    print_info "Folgende Strukturen werden kopiert:"
    echo "  - .github/copilot-instructions.md"
    echo "  - .github/chatmodes/"
    echo "  - .github/instructions/"
    echo "  - .github/ARCHITECT-INTEGRATION-SUMMARY.md"
    echo "  - .github/ARCHITECT-TEST-SCENARIOS.md"
    echo "  - .github/REQUIREMENTS-ENGINEER-INTEGRATION-SUMMARY.md"
    echo "  - .github/REQUIREMENTS-ENGINEER-TEST-SCENARIOS.md"
    echo "  - requirements/templates/"
    
    # Ask for confirmation
    echo ""
    read -p "Fortfahren? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Abgebrochen vom User"
        exit 0
    fi
}

###############################################################################
# Backup
###############################################################################

create_backup() {
    print_header "Phase 2: Backup erstellen"
    
    BACKUP_DIR="$TARGET_PROJECT/.copilot-backup-$TIMESTAMP"
    
    print_info "Erstelle Backup in: $BACKUP_DIR"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup existing .github/ if it exists
    if [ -d "$TARGET_PROJECT/.github" ]; then
        print_info "Sichere existierende .github/ Struktur..."
        cp -r "$TARGET_PROJECT/.github" "$BACKUP_DIR/"
        print_success "Backup von .github/ erstellt"
    fi
    
    # Backup existing requirements/ if it exists
    if [ -d "$TARGET_PROJECT/requirements" ]; then
        print_info "Sichere existierende requirements/ Struktur..."
        cp -r "$TARGET_PROJECT/requirements" "$BACKUP_DIR/"
        print_success "Backup von requirements/ erstellt"
    fi
    
    # Backup existing architecture/ if it exists
    if [ -d "$TARGET_PROJECT/architecture" ]; then
        print_info "Sichere existierende architecture/ Struktur..."
        cp -r "$TARGET_PROJECT/architecture" "$BACKUP_DIR/"
        print_success "Backup von architecture/ erstellt"
    fi
    
    print_success "Backup abgeschlossen: $BACKUP_DIR"
}

###############################################################################
# Copy Structure
###############################################################################

copy_github_structure() {
    print_header "Phase 3: .github/ Struktur kopieren"
    
    # Create .github directory if not exists
    mkdir -p "$TARGET_PROJECT/.github"
    
    # Copy copilot-instructions.md
    if [ -f "$SOURCE_REPO/.github/copilot-instructions.md" ]; then
        print_info "Kopiere copilot-instructions.md..."
        cp "$SOURCE_REPO/.github/copilot-instructions.md" "$TARGET_PROJECT/.github/"
        print_success "copilot-instructions.md kopiert"
    fi
    
    # Copy chatmodes/
    if [ -d "$SOURCE_REPO/.github/chatmodes" ]; then
        print_info "Kopiere chatmodes/..."
        mkdir -p "$TARGET_PROJECT/.github/chatmodes"
        cp -r "$SOURCE_REPO/.github/chatmodes/"* "$TARGET_PROJECT/.github/chatmodes/"
        print_success "chatmodes/ kopiert ($(ls -1 "$SOURCE_REPO/.github/chatmodes" | wc -l) Dateien)"
    fi
    
    # Copy instructions/
    if [ -d "$SOURCE_REPO/.github/instructions" ]; then
        print_info "Kopiere instructions/..."
        mkdir -p "$TARGET_PROJECT/.github/instructions"
        cp -r "$SOURCE_REPO/.github/instructions/"* "$TARGET_PROJECT/.github/instructions/"
        print_success "instructions/ kopiert ($(ls -1 "$SOURCE_REPO/.github/instructions" | wc -l) Dateien)"
    fi
    
    # Copy integration summaries
    for doc in \
        "ARCHITECT-INTEGRATION-SUMMARY.md" \
        "ARCHITECT-TEST-SCENARIOS.md" \
        "REQUIREMENTS-ENGINEER-INTEGRATION-SUMMARY.md" \
        "REQUIREMENTS-ENGINEER-TEST-SCENARIOS.md"
    do
        if [ -f "$SOURCE_REPO/.github/$doc" ]; then
            print_info "Kopiere $doc..."
            cp "$SOURCE_REPO/.github/$doc" "$TARGET_PROJECT/.github/"
            print_success "$doc kopiert"
        fi
    done
    
    print_success ".github/ Struktur vollständig kopiert"
}

copy_requirements_structure() {
    print_header "Phase 4: requirements/ Struktur kopieren"
    
    # Create requirements directory if not exists
    mkdir -p "$TARGET_PROJECT/requirements"
    
    # Copy templates/
    if [ -d "$SOURCE_REPO/requirements/templates" ]; then
        print_info "Kopiere requirements/templates/..."
        mkdir -p "$TARGET_PROJECT/requirements/templates"
        cp -r "$SOURCE_REPO/requirements/templates/"* "$TARGET_PROJECT/requirements/templates/"
        print_success "requirements/templates/ kopiert ($(ls -1 "$SOURCE_REPO/requirements/templates" | wc -l) Dateien)"
    fi
    
    # Create BACKLOG.md placeholder if not exists
    if [ ! -f "$TARGET_PROJECT/requirements/BACKLOG.md" ]; then
        print_info "Erstelle BACKLOG.md Placeholder..."
        cat > "$TARGET_PROJECT/requirements/BACKLOG.md" << 'EOF'
# Project Backlog

**Last Updated:** TBD  
**Phase:** Planning  
**Quality Gates:** QG1 ⚪ | QG2 ⚪ | QG3 ⚪

## Overview

Dieses Backlog wird automatisch von Requirements Engineer und Architect Modes befüllt.

## Status

- Requirements Phase: Not started
- Architecture Phase: Not started
- Implementation Phase: Not started

## Next Steps

1. Aktiviere `@requirements-engineer` für Business Intake
2. Erstelle Epics, Features, Issues
3. Warte auf QG1 Approval
4. Aktiviere `@architect` für Architecture Phase
5. Warte auf QG2 Approval
6. Start Implementation

---

*This file will be automatically updated by Copilot Agents*
EOF
        print_success "BACKLOG.md Placeholder erstellt"
    else
        print_warning "BACKLOG.md existiert bereits (nicht überschrieben)"
    fi
    
    print_success "requirements/ Struktur vollständig kopiert"
}

create_architecture_structure() {
    print_header "Phase 5: architecture/ Struktur erstellen"
    
    # Create architecture directory structure
    mkdir -p "$TARGET_PROJECT/architecture/decisions"
    mkdir -p "$TARGET_PROJECT/architecture/diagrams"
    
    print_success "architecture/decisions/ erstellt"
    print_success "architecture/diagrams/ erstellt"
    
    # Create README.md if not exists
    if [ ! -f "$TARGET_PROJECT/architecture/README.md" ]; then
        print_info "Erstelle architecture/README.md..."
        cat > "$TARGET_PROJECT/architecture/README.md" << 'EOF'
# Architecture Documentation

## Structure

```
architecture/
├── README.md                    # Diese Datei
├── arc42-architecture.md        # Vollständige arc42 Dokumentation
├── INTAKE-REPORT.md            # Architecture Intake (Phase 1)
├── ENVIRONMENT-SETUP.sh        # Automated Environment Setup
├── ENVIRONMENT-SETUP.md        # Setup Documentation
├── HANDOVER-TO-IMPLEMENTATION.md # QG2 Handover Document
├── decisions/                   # Architecture Decision Records (ADRs)
│   ├── ADR-001-*.md
│   ├── ADR-002-*.md
│   └── ...
└── diagrams/                    # Mermaid Diagrams
    ├── context-*.mmd           # C4 Level 1
    ├── container-*.mmd         # C4 Level 2
    ├── component-*.mmd         # C4 Level 3
    ├── sequence-*.mmd          # Sequence Diagrams
    └── deployment-*.mmd        # Deployment Views
```

## Usage

### Generate Architecture with @architect Mode

```
@architect Ich brauche Architecture für [Projekt/Feature]
```

Der Architect Mode führt durch 8 Phasen:
1. Architecture Intake
2. Technology Research & ADRs
3. arc42 Documentation
4. Task Decomposition
5. Environment Setup
6. BACKLOG Update
7. QG2 Validation
8. Handover to Implementation

### Manually Create ADR

Kopiere `requirements/templates/ADR-TEMPLATE.md` (falls vorhanden) oder folge diesem Pattern:

```markdown
# ADR-XXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded  
**Date:** YYYY-MM-DD  
**Decision Makers:** [Names/Roles]

## Context
[Problem statement]

## Decision Drivers
- Factor 1
- Factor 2

## Considered Options
1. Option 1
2. Option 2
3. Option 3

## Decision
[Chosen option]

## Rationale
[Why this option]

## Consequences

**Positive:**
- Benefit 1

**Negative:**
- Drawback 1

## Research Links
- [Official Docs](...)
- [Community Insights](...)
```

## Quality Standards

**ADR Requirements:**
- MIN 3 Options evaluated
- context7 + web_search Research
- Decision Matrix
- MIN 2 Research Links
- No placeholders

**arc42 Requirements:**
- 12/12 Sections complete
- MIN 5 Mermaid Diagrams
- MIN 10,000 words
- Links to ALL ADRs

**Task Requirements:**
- MAX 4h estimation (atomic)
- Complete Code Examples
- Specific File Paths
- Test Plans

**QG2 Quality Gate:**
- All ADRs validated
- arc42 complete
- Tasks atomic
- Environment setup ready

## Resources

- **Architect Chatmode:** `.github/chatmodes/architect.chatmode.md`
- **Validation Rules:** `.github/instructions/architect.instructions.md`
- **Integration Docs:** `.github/ARCHITECT-INTEGRATION-SUMMARY.md`
- **Test Scenarios:** `.github/ARCHITECT-TEST-SCENARIOS.md`

---

*Architecture wird von @architect Mode automatisch befüllt*
EOF
        print_success "architecture/README.md erstellt"
    else
        print_warning "architecture/README.md existiert bereits (nicht überschrieben)"
    fi
    
    print_success "architecture/ Struktur vollständig erstellt"
}

###############################################################################
# Verification
###############################################################################

verify_installation() {
    print_header "Phase 6: Verifikation"
    
    local errors=0
    
    # Check .github/ structure
    print_info "Prüfe .github/ Struktur..."
    
    if [ ! -f "$TARGET_PROJECT/.github/copilot-instructions.md" ]; then
        print_error "copilot-instructions.md fehlt!"
        ((errors++))
    else
        print_success "copilot-instructions.md vorhanden"
    fi
    
    if [ ! -d "$TARGET_PROJECT/.github/chatmodes" ]; then
        print_error "chatmodes/ fehlt!"
        ((errors++))
    else
        local chatmode_count=$(ls -1 "$TARGET_PROJECT/.github/chatmodes" 2>/dev/null | wc -l)
        print_success "chatmodes/ vorhanden ($chatmode_count Dateien)"
    fi
    
    if [ ! -d "$TARGET_PROJECT/.github/instructions" ]; then
        print_error "instructions/ fehlt!"
        ((errors++))
    else
        local instr_count=$(ls -1 "$TARGET_PROJECT/.github/instructions" 2>/dev/null | wc -l)
        print_success "instructions/ vorhanden ($instr_count Dateien)"
    fi
    
    # Check requirements/ structure
    print_info "Prüfe requirements/ Struktur..."
    
    if [ ! -d "$TARGET_PROJECT/requirements/templates" ]; then
        print_error "requirements/templates/ fehlt!"
        ((errors++))
    else
        local template_count=$(ls -1 "$TARGET_PROJECT/requirements/templates" 2>/dev/null | wc -l)
        print_success "requirements/templates/ vorhanden ($template_count Dateien)"
    fi
    
    if [ ! -f "$TARGET_PROJECT/requirements/BACKLOG.md" ]; then
        print_warning "requirements/BACKLOG.md fehlt (optional)"
    else
        print_success "requirements/BACKLOG.md vorhanden"
    fi
    
    # Check architecture/ structure
    print_info "Prüfe architecture/ Struktur..."
    
    if [ ! -d "$TARGET_PROJECT/architecture/decisions" ]; then
        print_error "architecture/decisions/ fehlt!"
        ((errors++))
    else
        print_success "architecture/decisions/ vorhanden"
    fi
    
    if [ ! -d "$TARGET_PROJECT/architecture/diagrams" ]; then
        print_error "architecture/diagrams/ fehlt!"
        ((errors++))
    else
        print_success "architecture/diagrams/ vorhanden"
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "Verifikation erfolgreich - Alle Strukturen vorhanden!"
        return 0
    else
        print_error "Verifikation fehlgeschlagen - $errors Fehler gefunden!"
        return 1
    fi
}

###############################################################################
# Summary
###############################################################################

show_summary() {
    print_header "Phase 7: Zusammenfassung"
    
    echo -e "${GREEN}✅ Setup erfolgreich abgeschlossen!${NC}\n"
    
    echo "Installierte Komponenten:"
    echo "  📁 .github/"
    echo "     └── copilot-instructions.md (globale Instructions)"
    echo "     └── chatmodes/ (Requirements Engineer, Architect)"
    echo "     └── instructions/ (path-specific validation)"
    echo "     └── Integration Summaries & Test Scenarios"
    echo ""
    echo "  📁 requirements/"
    echo "     └── templates/ (EPIC, FEATURE, ISSUE Templates)"
    echo "     └── BACKLOG.md (zentrale Übersicht)"
    echo ""
    echo "  📁 architecture/"
    echo "     └── decisions/ (ADRs)"
    echo "     └── diagrams/ (Mermaid)"
    echo "     └── README.md (Documentation)"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}Backup erstellt in:${NC}"
        echo "  $BACKUP_DIR"
        echo ""
    fi
    
    print_header "Nächste Schritte"
    
    echo "1️⃣  VS Code öffnen:"
    echo "     cd $TARGET_PROJECT"
    echo "     code ."
    echo ""
    
    echo "2️⃣  GitHub Copilot Reload (in VS Code):"
    echo "     Cmd/Ctrl + Shift + P"
    echo "     → 'Reload Window'"
    echo ""
    
    echo "3️⃣  Teste Requirements Engineer Mode:"
    echo "     @requirements-engineer Ich brauche Requirements für [Feature]"
    echo ""
    
    echo "4️⃣  Teste Architect Mode:"
    echo "     @architect Ich brauche Architecture für [Feature]"
    echo ""
    
    echo "5️⃣  Teste Path-Specific Validation:"
    echo "     - Editiere: requirements/EPIC-001-test.md"
    echo "     - Editiere: architecture/decisions/ADR-001-test.md"
    echo "     → Automatische Validierung sollte laufen"
    echo ""
    
    echo "📚 Dokumentation:"
    echo "     - .github/copilot-instructions.md (Quick Reference)"
    echo "     - .github/REQUIREMENTS-ENGINEER-INTEGRATION-SUMMARY.md"
    echo "     - .github/ARCHITECT-INTEGRATION-SUMMARY.md"
    echo "     - .github/REQUIREMENTS-ENGINEER-TEST-SCENARIOS.md"
    echo "     - .github/ARCHITECT-TEST-SCENARIOS.md"
    echo ""
    
    echo -e "${GREEN}🎉 Setup abgeschlossen - Viel Erfolg mit GitHub Copilot Agents!${NC}\n"
}

###############################################################################
# Error Handler
###############################################################################

error_handler() {
    print_error "Ein Fehler ist aufgetreten in Zeile $1"
    echo ""
    echo "Rollback zum Backup:"
    if [ -n "${BACKUP_DIR:-}" ] && [ -d "$BACKUP_DIR" ]; then
        echo "  1. Lösche fehlerhafte Strukturen"
        echo "  2. Stelle Backup wieder her:"
        echo "     cp -r $BACKUP_DIR/.github $TARGET_PROJECT/ 2>/dev/null || true"
        echo "     cp -r $BACKUP_DIR/requirements $TARGET_PROJECT/ 2>/dev/null || true"
        echo "     cp -r $BACKUP_DIR/architecture $TARGET_PROJECT/ 2>/dev/null || true"
    fi
    exit 1
}

trap 'error_handler $LINENO' ERR

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "GitHub Copilot Structure Setup"
    
    echo "Source: $SOURCE_REPO"
    echo "Target: ${1:-<not provided>}"
    echo ""
    
    validate_input "$@"
    create_backup
    copy_github_structure
    copy_requirements_structure
    create_architecture_structure
    verify_installation
    show_summary
}

# Run main function with all arguments
main "$@"
