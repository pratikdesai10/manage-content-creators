# Claude Documentation Maintenance Guide

## Overview
This project uses a hierarchical `claude.md` documentation system optimized for AI code assistants.

## Structure
- **Root `CLAUDE.md`** — lightweight navigation file with project overview, tech stack, folder structure, links to all module docs, and AI development rules
- **Module `claude.md`** — detailed documentation for each module (purpose, architecture, components, data flow, conventions)
- **Template** — `docs/claude-module-template.md` for creating new module docs

## When to Update

### Always update module `claude.md` when:
- Adding new files to a module
- Adding/changing public APIs or endpoints
- Changing data flow or architecture patterns
- Adding new dependencies
- Changing conventions or rules

### Always update root `CLAUDE.md` when:
- Adding a new module (add link to Module Documentation section)
- Changing environment variables
- Changing commands (build, test, dev)
- Changing the tech stack
- Changing cross-cutting concerns (auth flow, API format, validation)

### Always update all three layers when:
- Modifying enums (Prisma schema → frontend types → mobile enums)
- Changing API contracts (backend DTOs → frontend endpoints → mobile services)
- Changing auth flow (backend → frontend store → mobile providers)

## Creating Documentation for a New Module

1. Copy `docs/claude-module-template.md` to `<module_path>/claude.md`
2. Fill in all sections (keep concise — bullet points, not paragraphs)
3. Add a link in root `CLAUDE.md` under Module Documentation
4. Aim for 50-100 lines max per module doc

## Documentation Rules
- Use Markdown headings for structure
- Use short bullet points, not paragraphs
- Keep instructions concise and precise
- Optimize for fast AI parsing
- Include folder structure with file descriptions
- List all public APIs/exports
- Document integration points with other modules
- Keep in sync with actual code

## File Locations

```
CLAUDE.md                              ← Root (navigation + rules)
docs/claude-module-template.md         ← Template for new modules
docs/claude-docs-maintenance.md        ← This file

backend/src/auth/claude.md             ← Backend modules
backend/src/creator/claude.md
backend/src/agency/claude.md
backend/src/prisma/claude.md
backend/src/common/claude.md
backend/src/config/claude.md

frontend/src/api/claude.md             ← Frontend modules
frontend/src/components/claude.md
frontend/src/pages/claude.md
frontend/src/stores/claude.md
frontend/src/hooks/claude.md
frontend/src/types/claude.md
frontend/src/schemas/claude.md
frontend/src/lib/claude.md

mobile/lib/config/claude.md            ← Mobile modules
mobile/lib/models/claude.md
mobile/lib/providers/claude.md
mobile/lib/screens/claude.md
mobile/lib/services/claude.md
mobile/lib/widgets/claude.md
mobile/lib/utils/claude.md
```
