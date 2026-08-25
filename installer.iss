; ==========================================================
; SCRIPT DE INSTALAÇÃO - SILVA DIGITAL TECH CONTROL CENTER PRO
; ==========================================================

[Setup]
AppName=Silva Digital Tech - Control Center PRO
AppVersion=4.1
AppPublisher=Silva Digital Tech
AppPublisherURL=https://silvadigitaltech.com
DefaultDirName={autopf}\Silva Digital Tech\Control Center PRO
DefaultGroupName=Silva Digital Tech
AllowNoIcons=yes
OutputDir=C:\Users\silva\OneDrive\Desktop\silva_digital_tech\instalador_pronto
OutputBaseFilename=SilvaDigitalTech_Setup_v4.1
SetupIconFile=C:\Users\silva\OneDrive\Desktop\silva_digital_tech\icone.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl"

[Files]
; Copia o executavel atualizado do painel admin
Source: "C:\Users\silva\OneDrive\Desktop\silva_digital_tech\dist\painel_admin.exe"; DestDir: "{app}"; Flags: ignoreversion

; Copia a estrutura raiz do site (src, public, package.json, etc) direto para a pasta do app
Source: "C:\Users\silva\OneDrive\Desktop\silva_digital_tech\src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\silva\OneDrive\Desktop\silva_digital_tech\public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\silva\OneDrive\Desktop\silva_digital_tech\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\silva\OneDrive\Desktop\silva_digital_tech\astro.config.mjs"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\silva\OneDrive\Desktop\silva_digital_tech\.git\*"; DestDir: "{app}\.git"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autodesktop}\Control Center PRO"; Filename: "{app}\painel_admin.exe"; WorkingDir: "{app}"; IconFilename: "{app}\painel_admin.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Run]
Filename: "{app}\painel_admin.exe"; WorkingDir: "{app}"; Description: "{cm:LaunchProgram,Control Center PRO}"; Flags: nowait postinstall skipifsilent