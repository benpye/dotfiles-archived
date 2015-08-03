_vscode_linux_paths=(
    "$HOME/bin/VSCode-linux-x64/Code"
    "$HOME/bin/VSCode-linux-ia32/Code"
)
for _vscode_path in $_vscode_linux_paths; do
    if [[ -a $_vscode_path ]]; then
        vs_run() { $_vscode_path $@ >/dev/null 2>&1 &| }
        vs_run_sudo() {sudo $_vscode_path $@ >/dev/null 2>&1 &| }
        alias vss=vs_run_sudo
        alias vs=vs_run
        break
    fi
done
