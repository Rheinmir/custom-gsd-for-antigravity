# Contributing to Custom GSD

This is a personal fork of the "Get Shit Done" system, customized for Antigravity.

---

## Philosophy

**Optimized for solo developer + Agent workflow.**

**What this means:**
- Ship features that improve personal productivity.
- No bulky enterprise processes.
- Checkpoints are for safety, not bureaucracy.

---

## Development

### Setting Up

```bash
# Clone this custom repo
git clone https://github.com/Rheinmir/custom-gsd-for-antigravity.git
cd custom-gsd-for-antigravity

# Install dependencies
npm install

# Test locally (link command)
npm link
npx -y github:Rheinmir/custom-gsd-for-antigravity
```

### Making Changes

1.  **Branch:** Create a branch for your feature (`feat/my-feature`).
2.  **Commit:** Use conventional commits (e.g., `feat: add new agent`).
3.  **Push:** Push to your fork/branch.
4.  **Install:** Test using `npx -y github:Rheinmir/custom-gsd-for-antigravity#your-branch-name`.

---

## Releases

Since this is a custom fork installed via Git:
1.  **Commit** your changes to `main`.
2.  **Push** to GitHub.
3.  Users update by running the install command again: `npx -y github:Rheinmir/custom-gsd-for-antigravity`.

---

## License

MIT License.
