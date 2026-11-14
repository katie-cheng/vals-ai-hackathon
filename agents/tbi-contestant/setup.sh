#!/bin/bash
# Installs the vendored tbi package (see build.sh) into the sandbox and exposes `tbi-agent`.
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v python3 >/dev/null; then
  apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-venv
fi
python3 -m venv /opt/tbi
/opt/tbi/bin/pip install --quiet --upgrade pip
/opt/tbi/bin/pip install --quiet ./pkg
cat > /usr/local/bin/tbi-agent <<'WRAPPER'
#!/bin/bash
exec /opt/tbi/bin/tbi-agent "$@"
WRAPPER
chmod +x /usr/local/bin/tbi-agent
tbi-agent --help >/dev/null
