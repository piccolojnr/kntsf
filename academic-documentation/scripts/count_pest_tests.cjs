/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require("fs");
const path = require("path");

const testsDir = path.resolve(__dirname, "../../tests");
let count = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!entry.name.endsWith(".php")) {
      continue;
    }

    const content = fs.readFileSync(full, "utf8");
    const matches = content.match(/\bit\s*\(/g);
    count += matches ? matches.length : 0;
  }
}

walk(testsDir);
console.log(JSON.stringify({ pestTests: count }));
