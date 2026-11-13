/**
 * Optional one-time migration helper for old SAFARIA CSS class names.
 * Uses only Node.js built-ins; no external glob dependency is needed for
 * TypeScript validation or production builds. Run explicitly if required.
 */
import fs from "node:fs";
import path from "node:path";

const replaceMap: Record<string, string> = {
  "bg-surface-0": "bg-sf-000",
  "bg-surface-100": "bg-sf-100",
  "bg-surface-200": "bg-sf-200",
  "bg-surface-input": "bg-sf-input",
  "bg-surface-footer": "bg-sf-footer",
};

const sourceDir = path.resolve(process.cwd(), "src");
const scriptExtensions = new Set([".tsx", ".ts", ".jsx", ".js"]);

function visit(directory: string): void {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(filename);
      continue;
    }
    if (!entry.isFile() || !scriptExtensions.has(path.extname(entry.name))) continue;

    let content = fs.readFileSync(filename, "utf8");
    const previousContent = content;
    for (const [oldClass, newClass] of Object.entries(replaceMap)) {
      const escaped = oldClass.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Match whole CSS utility names only, including responsive variants.
      const pattern = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "g");
      content = content.replace(pattern, newClass);
    }

    if (content !== previousContent) {
      fs.writeFileSync(filename, content, "utf8");
      console.log(`Updated ${path.relative(process.cwd(), filename)}`);
    }
  }
}

if (fs.existsSync(sourceDir)) {
  visit(sourceDir);
} else {
  throw new Error(`Cannot find application source directory: ${sourceDir}`);
}
