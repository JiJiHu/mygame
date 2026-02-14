#!/bin/bash
# OpenCode wrapper for Tom (main agent)
# Default: oh-my-opencode multi-agent collaboration mode
# Usage: ~/myopencode/games/opencode.sh "task description"
cd ~/myopencode/games
~/.opencode/bin/opencode run --agent general "$@"
