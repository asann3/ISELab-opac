#!/bin/bash
set -e

USER_NAME=$(whoami)
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
PNPM_PATH=$(which pnpm)

echo "user: $USER_NAME"
echo "project: $PROJECT_DIR"
echo "pnpm: $PNPM_PATH"

sed \
  -e "s|__USER__|$USER_NAME|g" \
  -e "s|__PROJECT_DIR__|$PROJECT_DIR|g" \
  -e "s|__PNPM__|$PNPM_PATH|g" \
  "$PROJECT_DIR/scripts/opac.service" \
  | sudo tee /etc/systemd/system/opac.service > /dev/null

sudo systemctl daemon-reload
sudo systemctl enable opac
sudo systemctl start opac

echo "done. status: sudo systemctl status opac"
echo "logs:         sudo journalctl -u opac -f"
