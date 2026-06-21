import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceDir = path.join(root, "src");

const allowedThemeFiles = new Set([
  path.normalize(path.join(sourceDir, "theme", "tokens.ts")),
  path.normalize(path.join(sourceDir, "theme", "theme.css")),
]);

const forbiddenColorPatterns = [
  {
    name: "hexadecimal color",
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    name: "rgb/hsl color function",
    pattern: /\b(?:rgb|rgba|hsl|hsla)\s*\(/gi,
  },
];

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listSourceFiles(entryPath);
      }

      return entry.isFile() ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function lineAndColumn(content, index) {
  const beforeMatch = content.slice(0, index);
  const lines = beforeMatch.split(/\r?\n/);

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

const sourceFiles = await listSourceFiles(sourceDir);
const violations = [];

for (const file of sourceFiles) {
  const normalizedFile = path.normalize(file);

  if (allowedThemeFiles.has(normalizedFile)) {
    continue;
  }

  const content = await readFile(file, "utf8");

  for (const forbidden of forbiddenColorPatterns) {
    for (const match of content.matchAll(forbidden.pattern)) {
      const position = lineAndColumn(content, match.index ?? 0);
      const relativeFile = path.relative(root, file);

      violations.push({
        file: relativeFile,
        line: position.line,
        column: position.column,
        value: match[0],
        type: forbidden.name,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Design token check failed. Direct color values were found outside authorized theme files.");

  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line}:${violation.column} ${violation.type}: ${violation.value}`,
    );
  }

  process.exit(1);
}

console.log("Design token check passed. No direct colors found outside authorized theme files.");
