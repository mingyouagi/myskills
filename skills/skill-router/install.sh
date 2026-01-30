#!/bin/bash

# skill-router installation script
# Installs skill-router for Claude Code, Codex, and/or OpenCode

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROUTER_DIR="$SCRIPT_DIR"

echo "skill-router installer"
echo "======================"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm is required but not installed."
    exit 1
fi

# Install dependencies and link globally
echo "Installing dependencies..."
cd "$SKILL_ROUTER_DIR"
npm install

echo "Linking globally..."
npm link

echo ""
echo "skill-router CLI is now available globally."
echo ""

# Function to create symlink
create_symlink() {
    local target_dir="$1"
    local tool_name="$2"

    if [ -d "$target_dir" ]; then
        local link_path="$target_dir/skill-router"
        if [ -L "$link_path" ] || [ -d "$link_path" ]; then
            echo "  [skip] $tool_name: skill-router already exists"
        else
            ln -s "$SKILL_ROUTER_DIR" "$link_path"
            echo "  [done] $tool_name: created symlink"
        fi
    else
        echo "  [skip] $tool_name: directory not found ($target_dir)"
    fi
}

echo "Creating symlinks in skill directories..."
echo ""

# Claude Code
create_symlink "$HOME/.claude/skills" "Claude Code"

# Codex
create_symlink "$HOME/.codex/skills" "Codex"

# OpenCode (create skills dir if needed)
if [ -d "$HOME/.opencode" ] && [ ! -d "$HOME/.opencode/skills" ]; then
    mkdir -p "$HOME/.opencode/skills"
    echo "  [info] OpenCode: created skills directory"
fi
create_symlink "$HOME/.opencode/skills" "OpenCode"

echo ""
echo "Installation complete!"
echo ""
echo "Usage:"
echo "  skill-router search \"debug\""
echo "  skill-router list"
echo "  skill-router config"
echo ""
echo "Configuration:"
echo "  Create ~/.skill-router.json or ./.skill-router.json"
echo "  Available presets: claude-code, codex, opencode, all"
echo ""
