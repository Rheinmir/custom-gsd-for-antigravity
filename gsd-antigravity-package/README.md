# GSD for Antigravity

**Get Shit Done (GSD)** integration for **Antigravity**.
This extension packages the GSD system for easy global installation within the Antigravity ecosystem.

## Installation from Git

If you want to install or update GSD for Antigravity directly from the source code:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/glittercowboy/get-shit-done.git
    cd get-shit-done/gsd-antigravity-package
    ```
    *(Note: If this package is in a subdirectory of the main repo, adjust path accordingly. If it is a standalone repo, just clone it.)*

2.  **Run the Installer:**
    You can install it globally with a single command:
    ```bash
    node cli.js
    ```
    This script will:
    *   Detect the Antigravity global configuration directory (`~/.gemini/antigravity`).
    *   Install workflows, skills, and agents.
    *   Configure path replacements for Antigravity compatibility.

## Usage

Once installed, open **Antigravity** in any project and run:

```bash
gsd-help
```

To start a new project:
```bash
gsd-new-project
```

## Updates

To update to the latest version, pull the latest changes from git and re-run the installer:

```bash
git pull origin main
cd gsd-antigravity-package
node cli.js
```
