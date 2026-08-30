#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    Installing Zyra Programming Language (Linux)  "
echo "=================================================="

INSTALL_DIR="$HOME/.zyra/bin"
mkdir -p "$INSTALL_DIR"

URL="https://github.com/AndreaPallotta/zyra/releases/latest/download/zyra-v2.4.0-linux-x64.tar.gz"

echo "Downloading Zyra compiler..."
if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" | tar -xz -C "$INSTALL_DIR"
elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$URL" | tar -xz -C "$INSTALL_DIR"
else
    echo "Error: curl or wget is required to install Zyra."
    exit 1
fi

chmod +x "$INSTALL_DIR/zyra"

# Add to PATH in shell profile
SHELL_PROFILE="$HOME/.bashrc"
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
fi

if ! grep -q "$INSTALL_DIR" "$SHELL_PROFILE" 2>/dev/null; then
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$SHELL_PROFILE"
fi

echo "✔ Zyra installed to $INSTALL_DIR/zyra"
echo "✔ Updated PATH in $SHELL_PROFILE"

# Prompt for VS Code Extension installation
read -p "Do you want to install the Zyra VS Code extension? [Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    if command -v code >/dev/null 2>&1; then
        echo "Installing VS Code Extension..."
        VSIX_URL="https://github.com/AndreaPallotta/zyra/releases/latest/download/zyra-vscode-1.0.1.vsix"
        TEMP_VSIX="/tmp/zyra-vscode.vsix"
        curl -fsSL "$VSIX_URL" -o "$TEMP_VSIX"
        code --install-extension "$TEMP_VSIX"
        rm -f "$TEMP_VSIX"
        echo "✔ Installed Zyra VS Code extension!"
    else
        echo "ℹ VS Code ('code') not found in PATH. You can install it later with:"
        echo "  code --install-extension zyra-vscode-1.0.0.vsix"
    fi
fi

echo "=================================================="
echo "🎉 Installation Complete! Run 'source $SHELL_PROFILE' and try 'zyra --help'."
echo "=================================================="
