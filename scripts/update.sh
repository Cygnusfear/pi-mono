#!/usr/bin/env bash
set -euo pipefail

# --- helpers ---

# Try a one-shot pi fix. If that fails, open a full interactive session.
pi_fix() {
    local oneshot_prompt="$1"
    local interactive_prompt="$2"
    echo ""
    echo "==> Attempting one-shot fix with pi..."
    if pi -p "$oneshot_prompt"; then
        echo "==> One-shot fix succeeded."
    else
        echo ""
        echo "==> One-shot fix failed. Opening full pi session..."
        echo ""
        pi -p "$interactive_prompt" -i
    fi
}

# Back up dist/ so pi remains runnable if the build breaks
backup_dist() {
    if [[ -d dist ]]; then
        echo "==> Backing up dist/..."
        rm -rf dist.bak
        cp -R dist dist.bak
    fi
}

restore_dist() {
    if [[ -d dist.bak ]]; then
        echo "==> Restoring dist/ from backup..."
        rm -rf dist
        mv dist.bak dist
    fi
}

cleanup_dist_backup() {
    rm -rf dist.bak
}

# --- stash ---
echo "==> Stashing local changes..."
stash_result=$(git stash 2>&1)
has_stash=false
if [[ "$stash_result" != "No local changes to save" ]]; then
    has_stash=true
    echo "    Stashed working directory."
else
    echo "    Nothing to stash."
fi

restore_stash() {
    if $has_stash; then
        echo "==> Restoring stashed changes..."
        git stash pop || echo "    Warning: stash pop had conflicts, resolve manually."
    fi
}

# --- rebase ---
echo "==> Fetching upstream..."
git fetch upstream --no-tags --quiet

if git merge-base --is-ancestor upstream/main HEAD; then
    echo "==> Already up to date with upstream/main."
else
    echo "==> Rebasing onto upstream/main..."
    if ! git rebase upstream/main 2>&1; then
        pi_fix \
            "There is a git rebase conflict. Run 'git status' to see conflicted files, resolve ALL conflicts, 'git add' resolved files, and 'git rebase --continue'. Repeat until the rebase is fully complete. Prefer upstream's version for release/version commits. Keep our unique changes. Do NOT abort the rebase." \
            "Rebase conflict needs manual resolution. Run 'git status' to see what's wrong. Resolve conflicts, 'git add', 'git rebase --continue'. Do NOT abort."

        # Verify rebase actually completed
        if git status 2>&1 | grep -q "rebase in progress"; then
            echo "==> ERROR: Rebase still in progress. Aborting."
            git rebase --abort
            restore_stash
            exit 1
        fi
    fi
fi

# --- build ---
backup_dist
echo "==> Building..."
# Clean lockfile to avoid bun's "Duplicate package path" error on stale lockfiles
rm -f bun.lock
bun install
build_log=$(bun run build 2>&1) || {
    echo "$build_log"
    restore_dist
    pi_fix \
        "The build failed with these errors:"$'\n\n'"${build_log}"$'\n\n'"Fix the build errors. Run 'bun run build' to verify your fix works. Do NOT remove functionality -- fix the actual issue (missing deps, type errors, etc)." \
        "Build is broken. Fix it. Run 'bun run build' to verify. The previous one-shot attempt did not resolve it."

    # Final verification
    if ! bun run build; then
        echo "==> ERROR: Build still failing after pi sessions."
        restore_stash
        exit 1
    fi
}
echo "$build_log"

cleanup_dist_backup
restore_stash
echo "==> Done."
