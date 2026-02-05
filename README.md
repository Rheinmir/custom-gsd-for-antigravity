<div align="center">

# Get Shit Done (Antigravity Edition)

**A powerful workflow engine for your Antigravity agent.**

[![Custom Fork](https://img.shields.io/badge/GSD-Antigravity_Native-blue?style=for-the-badge)](https://github.com/Rheinmir/custom-gsd-for-antigravity)

<br>

```bash
npx -y github:Rheinmir/custom-gsd-for-antigravity
```

<br>

</div>

## 🚀 Quick Start

**1. Install**
Run this command in any directory:

```bash
npx -y github:Rheinmir/custom-gsd-for-antigravity --global
```

**2. Initialize a Project**
Go to your project folder and tell the agent:

```
/gsd-new-project
```

**3. Get Help**
See all available commands:

```
/gsd-help
```

---

## Core Workflows

| Command | Description |
|---------|-------------|
| `/gsd-new-project` | Initialize a new project with research, requirements, and roadmap. |
| `/gsd-plan-phase` | Plan the next phase of work (research + implementation plan). |
| `/gsd-execute-phase` | Execute the plan and write code. |
| `/gsd-verify-work` | Verify the implementation actually works. |
| `/gsd-quick` | Run ad-hoc tasks with GSD quality guarantees. |

---

## Why Use This?

- **Structured Thinking:** Forces the agent to research -> plan -> execute -> verify.
- **Context Management:** Keeps your context window clean by using sub-agents for heavy lifting.
- **Native Integration:** Installs directly as Antigravity workflows (`.agent/workflows`).
