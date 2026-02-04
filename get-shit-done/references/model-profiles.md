# Model Profiles

Model profiles control which AI model each GSD agent uses. This allows balancing quality vs token spend across different providers.

## Profile Definitions

| Agent | `quality` | `balanced` | `budget` |
|-------|-----------|------------|----------|
| gsd-planner | high-reasoning | high-reasoning | standard |
| gsd-roadmapper | high-reasoning | standard | standard |
| gsd-executor | high-reasoning | standard | standard |
| gsd-phase-researcher | high-reasoning | standard | fast |
| gsd-project-researcher | high-reasoning | standard | fast |
| gsd-research-synthesizer | standard | standard | fast |
| gsd-debugger | high-reasoning | standard | standard |
| gsd-codebase-mapper | standard | fast | fast |
| gsd-verifier | standard | standard | fast |
| gsd-plan-checker | standard | standard | fast |
| gsd-integration-checker | standard | standard | fast |

## Profile Philosophy

**quality** - Maximum reasoning power
- High Reasoning model (e.g., Opus, Gemini Ultra) for all decision-making agents
- Standard model for read-only verification
- Use when: quota available, critical architecture work

**balanced** (default) - Smart allocation
- High Reasoning model only for planning (where architecture decisions happen)
- Standard model (e.g., Sonnet, Gemini Pro) for execution and research
- Standard model for verification (needs reasoning, not just pattern matching)
- Use when: normal development, good balance of quality and cost

**budget** - Minimal High Reasoning usage
- Standard model for anything that writes code
- Fast model (e.g., Haiku, Gemini Flash) for research and verification
- Use when: conserving quota, high-volume work, less critical phases

## Resolution Logic

Orchestrators resolve model before spawning:

```
1. Read .planning/config.json
2. Get model_profile (default: "balanced")
3. Look up agent in table above
4. Pass model parameter to Task call
```

## Switching Profiles

Runtime: `/gsd:set-profile <profile>`

Per-project default: Set in `.planning/config.json`:
```json
{
  "model_profile": "balanced"
}
```

## Design Rationale

**Why High Reasoning for gsd-planner?**
Planning involves architecture decisions, goal decomposition, and task design. This is where model quality has the highest impact.

**Why Standard for gsd-executor?**
Executors follow explicit PLAN.md instructions. The plan already contains the reasoning; execution is implementation.

**Why Standard (not Fast) for verifiers in balanced?**
Verification requires goal-backward reasoning - checking if code *delivers* what the phase promised, not just pattern matching. Standard models handle this well; Fast models may miss subtle gaps.

**Why Fast for gsd-codebase-mapper?**
Read-only exploration and pattern extraction. No reasoning required, just structured output from file contents.
