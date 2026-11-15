#!/bin/bash
# Sequential on purpose: the box has 2 CPUs.
cd "$(dirname "$0")/.."
while pgrep -f "[s]napshot_sites.py dev" >/dev/null; do sleep 10; done
python3 scripts/scrape_yc.py current --workers 2 >> /tmp/yc_current.log 2>&1
python3 scripts/scrape_yc.py pre2022 --workers 2 >> /tmp/yc_pre.log 2>&1
