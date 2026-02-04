#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

// Path to the bundled install.js
const installScript = path.join(__dirname, "bin", "install.js");

console.log("🚀 Installing GSD for Antigravity (Global)...");

try {
  // Execute the installer with predetermined flags
  execSync(
    `node "${installScript}" --antigravity --global --force-statusline`,
    {
      stdio: "inherit",
    },
  );
  console.log(
    '\n✅ Setup complete! Run "gsd-help" in Antigravity to get started.',
  );
} catch (error) {
  console.error("\n❌ Installation failed:", error.message);
  process.exit(1);
}
