// check-css-classes.js
//
// Fails if the same single-class selector (e.g. `.invoice-print-area`) is
// defined as a top-level rule in more than one place. Duplicate class
// definitions silently cascade — the last stylesheet loaded wins — which makes
// styling bugs hard to trace across our stylesheets.
//
// Only top-level (brace-depth 0) `.foo { }` rules count. Nested selectors
// (`#next-steps ul .logo`), rules inside `@media`, compound/pseudo selectors,
// and Tailwind's escaped utilities (`.print\:w-full`) are ignored.
//
// Run: node scripts/check-css-classes.js   (wired to `bun run check:css-classes`)

import { readFileSync } from "node:fs";
import { globSync } from "glob";

const SOURCE_GLOB = "src/**/*.css";

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Exactly one class, nothing else: no combinator, no compound, no pseudo, no `&`.
const SINGLE_CLASS_RE = /^\.([a-zA-Z_][\w-]*)$/;

// Brace-aware scan: record the selector prelude of every rule that opens at
// depth 0. `;` and `}` reset the prelude window so at-rules (`@import …;`) and
// preceding blocks don't bleed into the next selector.
function topLevelClassRules(css) {
  const classes = [];
  let depth = 0;
  let preludeStart = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) {
        const hit = css.slice(preludeStart, i).trim().match(SINGLE_CLASS_RE);
        if (hit) classes.push(hit[1]);
      }
      depth++;
      preludeStart = i + 1;
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
      preludeStart = i + 1;
    } else if (ch === ";") {
      preludeStart = i + 1;
    }
  }
  return classes;
}

const definitions = new Map(); // class -> [files]

for (const file of globSync(SOURCE_GLOB, { nodir: true })) {
  const css = stripComments(readFileSync(file, "utf8"));
  for (const cls of topLevelClassRules(css)) {
    if (!definitions.has(cls)) definitions.set(cls, []);
    definitions.get(cls).push(file);
  }
}

const duplicates = [...definitions.entries()]
  .filter(([, files]) => files.length > 1)
  .sort(([a], [b]) => a.localeCompare(b));

if (duplicates.length > 0) {
  console.error(`✗ check:css-classes — ${duplicates.length} class(es) defined more than once:\n`);
  for (const [cls, files] of duplicates) {
    console.error(`  .${cls}  →  ${files.join(", ")}`);
  }
  console.error("\nMerge the duplicate rules; the later definition currently wins silently.");
  process.exit(1);
}

console.log(`✓ check:css-classes — ${definitions.size} top-level class rule(s), no duplicates.`);
