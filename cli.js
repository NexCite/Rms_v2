#!/usr/bin/env node
const { execSync } = require("child_process");

execSync("bun start", { stdio: "inherit" });
