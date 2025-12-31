#!/usr/bin/env bash
set -euo pipefail

RELEASE_ID="${1:?release id required}"
TARBALL="${2:?tarball path required}"
SITE_DIR="${3:?site dir required}"
SYSTEMD_SERVICE="${4:?systemd service required}"
HEALTHCHECK_URL="${5:-http://127.0.0.1:3000/}"
HEALTHCHECK_TIMEOUT_SECONDS="${6:-5}"
HEALTHCHECK_RETRIES="${7:-10}"
KEEP_RELEASES="${8:-10}"

RELEASE_DIR="$SITE_DIR/releases/$RELEASE_ID"
mkdir -p "$RELEASE_DIR"

# Unpack artefacts (contains .next/standalone, .next/static, public)
tar -xzf "$TARBALL" -C "$RELEASE_DIR"

# Flatten: put standalone content in release-root so server.js can be used directly
if [ -d "$RELEASE_DIR/.next/standalone" ]; then
  rsync -a "$RELEASE_DIR/.next/standalone/" "$RELEASE_DIR/"
  rm -rf "$RELEASE_DIR/.next/standalone"
fi

# Ensure .next exists (static stays under .next/static)
mkdir -p "$RELEASE_DIR/.next"

# Shared data dir
mkdir -p "$SITE_DIR/shared/data"
rm -rf "$RELEASE_DIR/data"
ln -sfn "$SITE_DIR/shared/data" "$RELEASE_DIR/data"

# Rollback target
PREV_TARGET=""
if [ -L "$SITE_DIR/current" ]; then
  PREV_TARGET="$(readlink -f "$SITE_DIR/current" || true)"
fi

# Atomic switch
ln -sfn "$RELEASE_DIR" "$SITE_DIR/current"

# Restart service (requires sudoers NOPASSWD for this service)
sudo systemctl restart "$SYSTEMD_SERVICE"

# Health check: wait until the app responds 2xx/3xx
set +e
ok=0
for i in $(seq 1 "$HEALTHCHECK_RETRIES"); do
  if curl -fsS --max-time "$HEALTHCHECK_TIMEOUT_SECONDS" "$HEALTHCHECK_URL" >/dev/null; then
    ok=1
    break
  fi
  sleep 5
done
set -e

if [ "$ok" -ne 1 ]; then
  echo "Health check failed for $HEALTHCHECK_URL. Rolling back."

  if [ -n "$PREV_TARGET" ] && [ -d "$PREV_TARGET" ]; then
    ln -sfn "$PREV_TARGET" "$SITE_DIR/current"
    sudo systemctl restart "$SYSTEMD_SERVICE" || true
    sudo systemctl --no-pager --full status "$SYSTEMD_SERVICE" || true
  fi

  echo "Rollback completed (if previous release existed)."
  exit 1
fi

sudo systemctl --no-pager --full status "$SYSTEMD_SERVICE" || true

# Cleanup old releases (keep last N)
if [ "$KEEP_RELEASES" -gt 0 ]; then
  mapfile -t releases < <(ls -1dt "$SITE_DIR/releases/"* 2>/dev/null || true)

  if [ "${#releases[@]}" -gt "$KEEP_RELEASES" ]; then
    for old in "${releases[@]:$KEEP_RELEASES}"; do
      # Never delete current target
      current_target="$(readlink -f "$SITE_DIR/current" || true)"
      if [ -n "$current_target" ] && [ "$(readlink -f "$old" || true)" = "$current_target" ]; then
        continue
      fi

      rm -rf "$old"
    done
  fi
fi