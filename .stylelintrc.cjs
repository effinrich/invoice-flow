/**
 * Stylelint config — Tailwind + Blink UI aware.
 *
 * Keeps the structurally meaningful rules from stylelint-config-standard
 * (unknown properties/at-rules, invalid hex, duplicate selectors, empty blocks,
 * bad @import position, …) and switches off purely cosmetic notation rules so
 * the linter neither rewrites the project's hand-authored CSS on every `--fix`
 * run nor lowercases case-sensitive keywords like `optimizeLegibility`.
 */
module.exports = {
  extends: ["stylelint-config-standard"],
  rules: {
    // Tailwind + Blink directives are not "unknown".
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["tailwind", "apply", "layer", "screen", "variants", "responsive", "config"],
      },
    ],

    // Tailwind emits escaped utility classes (`.print\:w-full`); our animation
    // keyframes are referenced by name — neither should be forced to kebab-case.
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,

    // Case-sensitive keyword values (e.g. `optimizeLegibility`) and font-family
    // names must keep their authored casing — auto-lowercasing breaks them.
    "value-keyword-case": null,
    "font-family-name-quotes": null,

    // Intentional vendor prefixes (font smoothing, spin-button pseudos).
    "property-no-vendor-prefix": null,
    "value-no-vendor-prefix": null,
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: ["-webkit-inner-spin-button", "-webkit-outer-spin-button"],
      },
    ],

    // Cosmetic notation preferences — the project uses legacy rgba()/decimal
    // alpha/degree-less hue notation deliberately; don't churn it.
    "color-function-notation": null,
    "color-function-alias-notation": null,
    "alpha-value-notation": null,
    "hue-degree-notation": null,
    "media-feature-range-notation": null,
    "import-notation": null,

    // Blank-line stylistics — not worth failing a build over.
    "at-rule-empty-line-before": null,
    "rule-empty-line-before": null,
    "declaration-empty-line-before": null,
    "comment-empty-line-before": null,
    "custom-property-empty-line-before": null,

    // Design-system layers legitimately re-declare selectors across files.
    "no-descending-specificity": null,
    // Font stacks resolve through CSS variables → false positives.
    "font-family-no-missing-generic-family-keyword": null,
  },
  ignoreFiles: ["dist/**/*", "node_modules/**/*"],
};
