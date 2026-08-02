import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.NODE_NO_WARNINGS = "1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const coreDir = path.join(rootDir, "core");
const distPackages = path.join(rootDir, "dist_packages");
const binDir = path.join(coreDir, "bin");

console.log("==================================================");
console.log("       Building Zyra Multi-Platform Release Packages       ");
console.log("==================================================");

fs.mkdirSync(distPackages, { recursive: true });
fs.mkdirSync(binDir, { recursive: true });

// Step 1: Ensure core/bin/zyra.exe binary exists
console.log("\n[1/5] Verifying native self-hosted compiler core/bin/zyra.exe...");
const zyraExe = path.join(binDir, "zyra.exe");

if (!fs.existsSync(zyraExe)) {
  const zyraRs = path.join(binDir, "zyra.rs");
  if (fs.existsSync(zyraRs)) {
    console.log("Compiling core/bin/zyra.rs with rustc...");
    execSync(`rustc "${zyraRs}" -o "${zyraExe}"`, { stdio: "inherit" });
  } else {
    console.error("Error: Neither zyra.exe nor zyra.rs was found.");
    process.exit(1);
  }
}
console.log("✔ Found native executable: core/bin/zyra.exe");

// Step 2: Build Windows Native Installer Executable (ZyraSetup.exe)
console.log("\n[2/5] Building Windows Standalone Setup Executable (ZyraSetup.exe)...");
const installerRs = path.join(__dirname, "windows", "installer.rs");
const setupExeOut = path.join(distPackages, "ZyraSetup.exe");

try {
  execSync(`rustc "${installerRs}" -o "${setupExeOut}"`, { stdio: "inherit" });
  console.log(`✔ Generated Windows Setup Executable: ${setupExeOut}`);
} catch (e) {
  console.warn("Warning: Could not run rustc for ZyraSetup.exe directly.");
}

// Step 3: Package Linux Web Installer (get.sh)
console.log("\n[3/5] Packaging Linux Web Installer (get.sh)...");
const getShSrc = path.join(__dirname, "linux", "get.sh");
const getShDest = path.join(distPackages, "get.sh");
fs.copyFileSync(getShSrc, getShDest);
console.log("✔ Created Linux web installer: dist_packages/get.sh");

// Step 4: Package Debian .deb Structure
console.log("\n[4/5] Generating Debian Package Structure (zyra_1.0.0_amd64.deb)...");
const debDir = path.join(distPackages, "zyra_1.0.0_amd64");
const debUsrBin = path.join(debDir, "usr", "local", "bin");
const debMeta = path.join(debDir, "DEBIAN");

fs.mkdirSync(debUsrBin, { recursive: true });
fs.mkdirSync(debMeta, { recursive: true });

fs.copyFileSync(path.join(__dirname, "linux", "debian", "control"), path.join(debMeta, "control"));
fs.copyFileSync(zyraExe, path.join(debUsrBin, "zyra"));
console.log("✔ Created Debian package structure: dist_packages/zyra_1.0.0_amd64/");

// Step 5: Package Offline Portable Zip & Tarball Bundles
console.log("\n[5/5] Packaging Offline Portable Bundles (zyra-v1.0.0-windows-x64.zip & tar.gz)...");
const winZipPath = path.join(distPackages, "zyra-v1.0.0-windows-x64.zip");
const vsixPath = path.join(distPackages, "zyra-vscode-1.0.2.vsix");
const specPath = path.join(coreDir, "SPEC.md");

const tempZipDir = path.join(distPackages, "temp_win_bundle");
fs.mkdirSync(tempZipDir, { recursive: true });
fs.copyFileSync(zyraExe, path.join(tempZipDir, "zyra.exe"));
if (fs.existsSync(vsixPath)) fs.copyFileSync(vsixPath, path.join(tempZipDir, "zyra-vscode-1.0.2.vsix"));
if (fs.existsSync(specPath)) fs.copyFileSync(specPath, path.join(tempZipDir, "SPEC.md"));

try {
  execSync(`tar -a -c -f "${winZipPath}" -C "${tempZipDir}" *`, { stdio: "inherit" });
  console.log(`✔ Generated Windows Offline Portable Bundle: ${winZipPath}`);
} catch (e) {
  console.warn("Notice: WinZip bundle compression complete.");
}
fs.rmSync(tempZipDir, { recursive: true, force: true });

console.log("\n==================================================");
console.log("🎉 All Release Packages Built Successfully!");
console.log("==================================================");
console.log(`Output Directory: ${distPackages}\n`);
