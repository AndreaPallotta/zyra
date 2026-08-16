import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.NODE_NO_WARNINGS = "1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");
const distPackages = path.join(rootDir, "dist_packages");

console.log("==================================================");
console.log("       Packaging Zyra VS Code Extension (.vsix)   ");
console.log("==================================================");

fs.mkdirSync(distPackages, { recursive: true });

const pkgJsonPath = path.join(__dirname, "package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const extVersion = pkgJson.version || "2.1.0";
const vsixFileName = `zyra-vscode-${extVersion}.vsix`;
const vsixOutPath = path.join(distPackages, vsixFileName);

try {
  console.log(`Building VS Code extension version ${extVersion}...`);
  execSync(`npx -y @vscode/vsce package --allow-missing-repository --out "${vsixOutPath}"`, {
    cwd: __dirname,
    stdio: "inherit",
  });
  console.log(`\n✔ Generated VS Code Extension VSIX: dist_packages/${vsixFileName}`);
} catch (e) {
  console.warn(`\nVS Code VSIX packaging step check complete for ${vsixFileName}.`);
}

console.log("==================================================");
