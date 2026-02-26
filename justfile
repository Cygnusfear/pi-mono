# Pi monorepo tasks

# Fetch upstream, rebase local commits, build.
# If rebase conflicts arise, drops into a pi session to resolve them.
update:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "==> Stashing local changes..."
    stash_result=$(git stash 2>&1)
    has_stash=false
    if [[ "$stash_result" != "No local changes to save" ]]; then
        has_stash=true
        echo "    Stashed working directory."
    else
        echo "    Nothing to stash."
    fi

    echo "==> Fetching upstream..."
    git fetch upstream

    local_head=$(git rev-parse HEAD)
    upstream_head=$(git rev-parse upstream/main)

    if [ "$local_head" = "$upstream_head" ] || git merge-base --is-ancestor upstream/main HEAD; then
        echo "==> Already up to date with upstream/main."
    else
        echo "==> Rebasing onto upstream/main..."
        if ! git rebase upstream/main 2>&1; then
            echo ""
            echo "==> Rebase conflict detected. Launching pi to resolve..."
            echo ""
            pi -p "There is a git rebase conflict. Run 'git status' to see the conflicted files, resolve ALL conflicts, then 'git add' the resolved files and 'git rebase --continue'. Repeat until the rebase is fully complete. Prefer upstream's version for release/version commits. Keep our unique changes. Do NOT abort the rebase."
            # Verify rebase completed
            if git rebase --show-current-patch &>/dev/null 2>&1; then
                echo "==> ERROR: Rebase still in progress after pi session. Aborting."
                git rebase --abort
                if $has_stash; then git stash pop; fi
                exit 1
            fi
        fi
    fi

    echo "==> Rebase complete. Building..."
    bun install
    bun run build

    if $has_stash; then
        echo "==> Restoring stashed changes..."
        git stash pop || echo "    Warning: stash pop had conflicts, resolve manually."
    fi

    echo "==> Done."
