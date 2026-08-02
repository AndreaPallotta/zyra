; Inno Setup Script for Zyra Programming Language
; Generates standard Windows Setup Wizard (ZyraSetup.exe)

[Setup]
AppName=Zyra Programming Language
AppVersion=1.0.0
AppPublisher=Andrea Pallotta
AppPublisherURL=https://zyra-lang.dev
AppSupportURL=https://zyra-lang.dev
AppUpdatesURL=https://zyra-lang.dev
DefaultDirName={userappdata}\Programs\Zyra
DefaultGroupName=Zyra Programming Language
DisableProgramGroupPage=yes
OutputBaseFilename=ZyraSetup
OutputDir=..\..\dist_packages
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
UninstallDisplayIcon={app}\bin\zyra.exe

[Types]
Name: "full"; Description: "Full Installation (Recommended)"
Name: "compact"; Description: "Minimal Installation (Compiler CLI only)"
Name: "custom"; Description: "Custom Installation"; Flags: iscustom

[Components]
Name: "compiler"; Description: "Zyra Core Compiler & Native Executable CLI (zyra.exe)"; Types: full compact custom
Name: "vscode"; Description: "Zyra Official VS Code Extension (zyra-vscode-1.0.2.vsix)"; Types: custom; Check: IsVSCodeExtensionNeeded

[Tasks]
Name: "addpath"; Description: "Add Zyra binary directory to User PATH environment variable"; GroupDescription: "System Integration:"; Flags: checkedonce
Name: "desktopicon"; Description: "Create a Desktop shortcut for Zyra REPL"; GroupDescription: "Shortcuts:"; Flags: unchecked

[Files]
Source: "..\..\core\bin\zyra.exe"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "..\..\dist_packages\zyra-vscode-1.0.2.vsix"; DestDir: "{app}\extension"; Flags: ignoreversion; Components: vscode

[Icons]
Name: "{group}\Zyra REPL"; Filename: "{app}\bin\zyra.exe"; Parameters: "repl"
Name: "{group}\Zyra Documentation"; Filename: "https://zyra-lang.dev"
Name: "{autodesktop}\Zyra REPL"; Filename: "{app}\bin\zyra.exe"; Parameters: "repl"; Tasks: desktopicon

[Run]
Filename: "code"; Parameters: "--install-extension ""{app}\extension\zyra-vscode-1.0.2.vsix"" --force"; StatusMsg: "Installing Zyra VS Code Extension..."; Components: vscode; Flags: runhidden; Check: IsVSCodeExtensionNeeded
Filename: "{app}\bin\zyra.exe"; Parameters: "repl"; Description: "Launch Zyra REPL interactive shell"; Flags: postinstall nowait skipifsilent unchecked

[Code]
const
  WM_SETTINGCHANGE = $001A;
  SMTO_ABORTIFHUNG = $0002;

function SendMessageTimeout(
  hWnd: LongWord;
  Msg: UINT;
  wParam: LongWord;
  lParam: String;
  fuFlags: UINT;
  uTimeout: UINT;
  out lpdwResult: LongWord
): LongWord; external 'SendMessageTimeoutW@user32.dll stdcall';

procedure AddToUserPath;
var
  AppBinDir: String;
  CurrentPath: String;
  ResultPtr: LongWord;
begin
  AppBinDir := ExpandConstant('{app}\bin');
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', CurrentPath) then
  begin
    CurrentPath := '';
  end;

  if Pos(Lowercase(AppBinDir), Lowercase(CurrentPath)) = 0 then
  begin
    if (CurrentPath <> '') and (Copy(CurrentPath, Length(CurrentPath), 1) <> ';') then
    begin
      CurrentPath := CurrentPath + ';';
    end;
    CurrentPath := CurrentPath + AppBinDir;
    RegWriteStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', CurrentPath);
    SendMessageTimeout(HWND_BROADCAST, WM_SETTINGCHANGE, 0, 'Environment', SMTO_ABORTIFHUNG, 5000, ResultPtr);
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep = ssPostInstall) and WizardIsTaskSelected('addpath') then
  begin
    AddToUserPath;
  end;
end;

function IsVSCodeExtensionNeeded: Boolean;
var
  ExtDir: String;
  UserProfileDir: String;
begin
  if not (FileExists(ExpandConstant('{userappdata}\Programs\Microsoft VS Code\Code.exe')) or
          FileExists(ExpandConstant('{localappdata}\Programs\Microsoft VS Code\Code.exe')) or
          FileExists(ExpandConstant('{pf}\Microsoft VS Code\Code.exe'))) then
  begin
    Result := False;
    Exit;
  end;

  UserProfileDir := GetEnv('USERPROFILE');
  if UserProfileDir = '' then
  begin
    Result := True;
    Exit;
  end;

  ExtDir := UserProfileDir + '\.vscode\extensions';
  if DirExists(ExtDir) and (
     DirExists(ExtDir + '\zyra-vscode-1.0.2') or
     DirExists(ExtDir + '\zyra-vscode-1.0.1') or
     DirExists(ExtDir + '\zyra-vscode-1.0.0')) then
  begin
    Result := False;
  end
  else
  begin
    Result := True;
  end;
end;
