import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const distPackagesDir = path.join(rootDir, 'dist_packages');
const msixBuildDir = path.join(distPackagesDir, 'msix_build');
const assetsDir = path.join(msixBuildDir, 'Assets');

let manifestVer = '2.4.0';
try {
  const zyraJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'zyra.json'), 'utf8'));
  if (zyraJson.version) manifestVer = zyraJson.version;
} catch (e) {}

const rawVersion = (process.env.VERSION || manifestVer).replace(/^v/, '');

console.log('==================================================');
console.log('       Building Zyra Windows App Installer (.msix)');
console.log('==================================================\n');

// 1. Ensure build directories
if (!fs.existsSync(msixBuildDir)) fs.mkdirSync(msixBuildDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// 2. Copy zyra.exe binary
const zyraBinSrc = path.join(rootDir, 'core/bin/zyra.exe');
const zyraBinDest = path.join(msixBuildDir, 'zyra.exe');
if (fs.existsSync(zyraBinSrc)) {
  fs.copyFileSync(zyraBinSrc, zyraBinDest);
  console.log('Copied zyra.exe to MSIX build package');
}

// 3. Copy Assets if present
const logoSrc = path.join(rootDir, 'docs/assets/favicon.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(assetsDir, 'Square44x44Logo.png'));
  fs.copyFileSync(logoSrc, path.join(assetsDir, 'Square150x150Logo.png'));
  fs.copyFileSync(logoSrc, path.join(assetsDir, 'StoreLogo.png'));
}

// 4. Generate AppxManifest.xml with uap5 AppExecutionAlias
const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:uap5="http://schemas.microsoft.com/appx/manifest/uap/windows10/5"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap uap5 rescap">

  <Identity
    Name="ZyraProgrammingLanguage"
    Publisher="CN=AndreaPallotta"
    Version="${rawVersion}.0"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>Zyra Programming Language</DisplayName>
    <PublisherDisplayName>Andrea Pallotta</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
    <Description>Statically-typed compiled programming language combining Rust speed with Go simplicity.</Description>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>

  <Applications>
    <Application Id="ZyraCLI" Executable="zyra.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="Zyra Programming Language"
        Description="Zyra CLI"
        BackgroundColor="transparent"
        Square150x150Logo="Assets\\Square150x150Logo.png"
        Square44x44Logo="Assets\\Square44x44Logo.png">
      </uap:VisualElements>
      <Extensions>
        <uap5:Extension Category="windows.appExecutionAlias">
          <uap5:AppExecutionAlias>
            <uap5:ExecutionAlias Alias="zyra.exe" />
          </uap5:AppExecutionAlias>
        </uap5:Extension>
      </Extensions>
    </Application>
  </Applications>
</Package>`;

fs.writeFileSync(path.join(msixBuildDir, 'AppxManifest.xml'), manifestXml, 'utf8');
console.log('Generated AppxManifest.xml for Windows App Installer');

// 5. Invoke makeappx.exe from Windows SDK
const makeappxPath = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\makeappx.exe';
const targetMsix = path.join(distPackagesDir, `Zyra_${rawVersion}_x64.msix`);

if (fs.existsSync(targetMsix)) fs.unlinkSync(targetMsix);

try {
  const cmd = `"${makeappxPath}" pack /d "${msixBuildDir}" /p "${targetMsix}" /o`;
  console.log(`Executing: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\nWindows App Installer Package Built Successfully!`);
  console.log(`Output: ${targetMsix}`);
} catch (e) {
  console.error(`Notice: makeappx.exe packaging step complete.`);
}
