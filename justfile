# Pi monorepo tasks

# Fetch upstream, rebase local commits, build.
# On conflicts or build failures: one-shot pi fix, then full session if that fails too.
update:
    ./scripts/update.sh
