#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

// Colors
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const dim = "\x1b[2m";
const reset = "\x1b[0m";

// Get version from package.json
const pkg = require("../package.json");

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes("--global") || args.includes("-g");
const hasLocal = args.includes("--local") || args.includes("-l");
const hasUninstall = args.includes("--uninstall") || args.includes("-u");
const hasHelp = args.includes("--help") || args.includes("-h");

const banner =
  "\n" +
  cyan +
  "   ██████╗ ███████╗██████╗\n" +
  "  ██╔════╝ ██╔════╝██╔══██╗\n" +
  "  ██║  ███╗███████╗██║  ██║\n" +
  "  ██║   ██║╚════██║██║  ██║\n" +
  "  ╚██████╔╝███████║██████╔╝\n" +
  "   ╚═════╝ ╚══════╝╚═════╝" +
  reset +
  "\n" +
  "\n" +
  "  Get Shit Done " +
  dim +
  "v" +
  pkg.version +
  reset +
  "\n" +
  "  Antigravity Edition\n";

console.log(banner);

if (hasHelp) {
  console.log(
    `  ${yellow}Usage:${reset} npx get-shit-done-cc [options]\n\n  ${yellow}Options:${reset}\n    ${cyan}-g, --global${reset}      Install globally (to ~/.gemini/antigravity)\n    ${cyan}-l, --local${reset}       Install locally (to .agent/)\n    ${cyan}-u, --uninstall${reset}   Uninstall GSD\n    ${cyan}-h, --help${reset}        Show this help message\n\n  ${yellow}Quick Start:${reset}\n    ${dim}# Install globally (recommended)${reset}\n    npx get-shit-done-cc --global\n`,
  );
  process.exit(0);
}

// Default to global if not specified, unless local is explicitly requested
// (In non-interactive mode, original defaulted to global)
const isGlobal = hasLocal ? false : true;

/**
 * Convert Claude Code markdown command to Antigravity Workflow format
 */
function convertClaudeToAntigravityWorkflow(
  content,
  filename,
  skillsPath = ".agent/skills/gsd",
) {
  // Extract description
  let description = "";
  let body = content;

  if (content.startsWith("---")) {
    const endIndex = content.indexOf("---", 3);
    if (endIndex !== -1) {
      const frontmatter = content.substring(3, endIndex).trim();
      body = content.substring(endIndex + 3).trim();

      const lines = frontmatter.split("\n");
      for (const line of lines) {
        if (line.trim().startsWith("description:")) {
          description = line.trim().substring(12).trim();
          break;
        }
      }
    }
  }

  // Basic Antigravity Workflow Template
  return `---
description: ${description || "GSD Workflow"}
---
# ${filename.replace(".md", "")}

1. View GSD Skills
   // turbo
   \`find_by_name ${skillsPath}\`

2. Execute GSD Logic
   ${body}
`;
}

/**
 * Remove directory recursively
 */
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
}

/**
 * Copy directory with path replacement for Antigravity
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix) {
  if (fs.existsSync(destDir)) {
    // Clean install - remove existing to prevent orphans
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      const destPath = path.join(destDir, entry.name);
      copyWithPathReplacement(srcPath, destPath, pathPrefix);
    } else if (entry.name.endsWith(".md")) {
      let content = fs.readFileSync(srcPath, "utf8");
      const claudeDirRegex = /~\/\.claude\//g;

      // Replace paths
      let skillsPathForWorkflow = ".agent/skills/gsd";

      if (destDir.includes(".gemini/antigravity")) {
        // Global install replacements
        content = content.replace(
          /~\/\.claude\/agents\//g,
          "~/.gemini/antigravity/skills/gsd/",
        );
        content = content.replace(claudeDirRegex, "~/.gemini/antigravity/");
        skillsPathForWorkflow = "~/.gemini/antigravity/skills/gsd";
      } else {
        // Local install
        content = content.replace(claudeDirRegex, ".agent/");
      }

      // Replace /gsd:command with gsd-command
      content = content.replace(/\/gsd:/g, "gsd-");

      // Convert to workflow
      content = convertClaudeToAntigravityWorkflow(
        content,
        entry.name,
        skillsPathForWorkflow,
      );

      // Rename to gsd-*.md
      const destName = "gsd-" + entry.name;
      fs.writeFileSync(path.join(destDir, destName), content);
    } else {
      // Copy other files (e.g. .js) directly
      fs.copyFileSync(srcPath, path.join(destDir, entry.name));
    }
  }
}

/**
 * Install GSD for Antigravity
 */
function install(isGlobal) {
  const targetDir = isGlobal
    ? path.join(os.homedir(), ".gemini", "antigravity")
    : path.join(process.cwd(), ".agent");

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), "~")
    : ".agent/";

  console.log(
    `  Installing for ${cyan}Antigravity${reset} to ${cyan}${locationLabel}${reset}\n`,
  );

  // 1. Install Workflows
  const workflowsDir = path.join(targetDir, "workflows");
  const src = path.join(__dirname, "..");
  const gsdSrc = path.join(src, "commands", "gsd");

  // Path prefix for internal file refs
  const pathPrefix = isGlobal ? "~/.gemini/antigravity/" : ".agent/";

  try {
    copyWithPathReplacement(gsdSrc, workflowsDir, pathPrefix);
    console.log(`  ${green}✓${reset} Installed workflows`);
  } catch (e) {
    console.error(
      `  ${yellow}✗${reset} Failed to install workflows: ${e.message}`,
    );
    process.exit(1);
  }

  // 2. Install Skills (Agents)
  const skillsDest = path.join(targetDir, "skills", "gsd");
  const agentsSrc = path.join(src, "agents");

  try {
    if (fs.existsSync(skillsDest)) {
      fs.rmSync(skillsDest, { recursive: true });
    }
    fs.mkdirSync(skillsDest, { recursive: true });

    if (fs.existsSync(agentsSrc)) {
      const agentEntries = fs.readdirSync(agentsSrc);
      for (const entry of agentEntries) {
        if (entry.endsWith(".md")) {
          let content = fs.readFileSync(path.join(agentsSrc, entry), "utf8");
          const dirRegex = /~\/\.claude\//g;

          if (isGlobal) {
            content = content.replace(dirRegex, "~/.gemini/antigravity/");
          } else {
            content = content.replace(dirRegex, ".agent/");
          }

          fs.writeFileSync(path.join(skillsDest, entry), content);
        }
      }
    }
    console.log(`  ${green}✓${reset} Installed skills`);
  } catch (e) {
    console.error(
      `  ${yellow}✗${reset} Failed to install skills: ${e.message}`,
    );
  }

  // 3. Copy other necessary files (get-shit-done logic if needed?)
  // GSD logic seems to reside in get-shit-done/ directory in the repo?
  // Wait, looking at original code: copyWithPathReplacement(skillSrc, skillDest, ...)
  // "get-shit-done" folder contains core logic.
  const coreSrc = path.join(src, "get-shit-done");
  const coreDest = path.join(targetDir, "get-shit-done");

  if (fs.existsSync(coreSrc)) {
    // Just copy recursively, replacing paths if they are md files (unlikely in core pkg but possible)
    // Actually standard recursive copy is safer for core logic if no md transformation needed.
    // But verify if core logic has md files that need path replacement.
    // Original used copyWithPathReplacement. I'll stick to that but simplify.

    // We'll just define a simple recursive copy for core since logic is JS mostly
    // But wait, original code: copyWithPathReplacement(skillSrc, skillDest, pathPrefix, runtime)
    // Checks for .md files and replaces content there.
    // We should probably preserve that just in case documentation or prompts are in there.

    // Let's reuse copyWithPathReplacement logic but maybe without the workflow conversion for core files?
    // Original copyWithPathReplacement had:
    // } else if (entry.name.endsWith(".md")) { ... convert ... }

    // Wait, get-shit-done folder usually has js files or prompts.
    // The original code unconditionally converted .md files in copyWithPathReplacement if runtime==antigravity.
    // That converts them to workflows!
    // DO WE WANT get-shit-done internals to become workflows?
    // Original code:
    // if (runtime === "antigravity") {
    //    if (entry.name.endsWith(".md")) { ... convert to workflow ... }
    // }
    //
    // "get-shit-done" folder usually doesn't create commands. It's the logic.
    // If it has MD files, they might be prompts.
    // Converting prompts to workflows breaking them?
    // Let's look at `get-shit-done` folder content...
    // I'll skip copying get-shit-done as "workflows".
    // I will just copy it as files, but doing text replacement for paths.

    if (fs.existsSync(coreDest)) fs.rmSync(coreDest, { recursive: true });
    fs.mkdirSync(coreDest, { recursive: true });

    // Simple recursive copy with path replacement for text files
    function copyCore(s, d) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      const items = fs.readdirSync(s, { withFileTypes: true });
      for (const item of items) {
        const sp = path.join(s, item.name);
        const dp = path.join(d, item.name);
        if (item.isDirectory()) {
          copyCore(sp, dp);
        } else {
          if (
            item.name.endsWith(".js") ||
            item.name.endsWith(".md") ||
            item.name.endsWith(".json")
          ) {
            let c = fs.readFileSync(sp, "utf8");
            const claudeDirRegex = /~\/\.claude\//g;
            if (isGlobal) {
              c = c.replace(claudeDirRegex, "~/.gemini/antigravity/");
            } else {
              c = c.replace(claudeDirRegex, ".agent/");
            }
            // Replace /gsd:command with gsd-command
            c = c.replace(/\/gsd:/g, "gsd-");
            fs.writeFileSync(dp, c);
          } else {
            fs.copyFileSync(sp, dp);
          }
        }
      }
    }
    copyCore(coreSrc, coreDest);
    console.log(`  ${green}✓${reset} Installed core logic`);
  }

  // Quick Start Message
  console.log(`
  ${green}Done!${reset}
  
  ${yellow}Quick Start:${reset}
    1. Run ${cyan}/gsd-new-project${reset} to start a new project
    2. Run ${cyan}/gsd-help${reset} to see all commands
`);
}

function uninstall(isGlobal) {
  const targetDir = isGlobal
    ? path.join(os.homedir(), ".gemini", "antigravity")
    : path.join(process.cwd(), ".agent");

  console.log(`  Uninstalling GSD from ${cyan}${targetDir}${reset}...`);

  const workflowsDir = path.join(targetDir, "workflows");
  if (fs.existsSync(workflowsDir)) {
    const files = fs.readdirSync(workflowsDir);
    files.forEach((f) => {
      if (f.startsWith("gsd-") && f.endsWith(".md")) {
        fs.unlinkSync(path.join(workflowsDir, f));
      }
    });
  }

  const skillsDir = path.join(targetDir, "skills", "gsd");
  if (fs.existsSync(skillsDir)) fs.rmSync(skillsDir, { recursive: true });

  const coreDir = path.join(targetDir, "get-shit-done");
  if (fs.existsSync(coreDir)) fs.rmSync(coreDir, { recursive: true });

  console.log(`  ${green}✓${reset} Uninstalled.`);
}

// Main execution
if (hasUninstall) {
  uninstall(isGlobal);
} else {
  install(isGlobal);
}
