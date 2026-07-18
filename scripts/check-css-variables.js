// check-css-variables.js
//
// Fails if any CSS custom property referenced via `var(--x)` in the app's own
// CSS or in tailwind.config.cjs is never defined anywhere — in our CSS or in
// the imported @blinkdotnew/ui design-token stylesheets. An undefined token
// renders as nothing (transparent color, 0 radius, …) with no error, so this
// catches typos and dropped definitions before they ship.
//
// Run: node scripts/check-css-variables.js   (wired to `bun run check:css-vars`)

import { readFileSync } from "node:fs";
import { globSync } from "glob";

// Custom properties injected at runtime by libraries — never defined in source.
const IGNORED_PREFIXES = [
  "--radix-", // Radix UI primitives
  "--tw-", // Tailwind internal state vars
  "--sonner-", // Sonner toasts
  "--swiper-",
  "--recharts-",
  "--vis-",
];

const isIgnored = (name) => IGNORED_PREFIXES.some((p) => name.startsWith(p));

// Where tokens can be *referenced*.
const REFERENCE_GLOBS = ["src/**/*.css", "tailwind.config.cjs"];

// Where tokens can be *defined*: our CSS plus the Blink UI token sheets that
// @blinkdotnew/ui/styles pulls in (radius, font-size, shadow, duration, …).
const DEFINITION_GLOBS = ["src/**/*.css", "node_modules/@blinkdotnew/ui/**/*.css"];

const DEF_RE = /(?:^|[\s;{])(--[a-zA-Z0-9-]+)\s*:/g;
const REF_RE = /var\(\s*(--[a-zA-Z0-9-]+)/g;

function collect(globs, regex) {
  const found = new Map(); // name -> first file it appeared in
  for (const file of globSync(globs, { nodir: true })) {
    const css = readFileSync(file, "utf8");
    let m;
    while ((m = regex.exec(css)) !== null) {
      if (!found.has(m[1])) found.set(m[1], file);
    }
  }
  return found;
}

const defined = collect(DEFINITION_GLOBS, DEF_RE);
const referenced = collect(REFERENCE_GLOBS, REF_RE);

const missing = [...referenced.entries()]
  .filter(([name]) => !defined.has(name) && !isIgnored(name))
  .sort(([a], [b]) => a.localeCompare(b));

if (missing.length > 0) {
  console.error(
    `✗ check:css-vars — ${missing.length} CSS variable(s) referenced but never defined:\n`,
  );
  for (const [name, file] of missing) {
    console.error(`  ${name}  (first referenced in ${file})`);
  }
  console.error("\nDefine them in src/index.css (or confirm they come from @blinkdotnew/ui).");
  process.exit(1);
}

console.log(`✓ check:css-vars — ${referenced.size} referenced variable(s), all defined.`);
