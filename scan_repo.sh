#!/bin/bash

REPORT="kevin_malware_report.txt"
echo "Staircase-Financial Repo Scan - $(date)" > "$REPORT"
echo "==================================================" >> "$REPORT"

# The specific regex pattern matching the attacker's obfuscation and C2 domains
IOC_REGEX="8-585-11|global\['!'\]|String\.fromCharCode\(127\)|\?\.\?|api\.trongrid\.io|fullnode\.mainnet\.aptoslabs\.com|bsc-dataseed\.binance\.org|bsc-rpc\.publicnode\.com|TMfKQEd7TJJa5xNZJZ2Lep838vrzrs7mAP|TXfxHUet9pJVU1BgVkBAbrES4YUc1nGzcG"

echo "[*] 1. Scanning active files for malicious strings..." | tee -a "$REPORT"
grep -rnE "$IOC_REGEX" . --exclude-dir=".git" >> "$REPORT"
if [ $? -ne 0 ]; then echo " -> Clean: No live string IOCs found." | tee -a "$REPORT"; fi

echo -e "\n[*] 2. Scanning for the 5.5KB disguised WOFF2 payload..." | tee -a "$REPORT"
find . -type f -name "fa-solid-400.woff2" -size 5533c >> "$REPORT"
if [ $? -ne 0 ]; then echo " -> Clean: No malicious font files found in working directory." | tee -a "$REPORT"; fi

echo -e "\n[*] 3. Scanning all historical, reachable commits..." | tee -a "$REPORT"
git rev-list --all | xargs git grep -lE "$IOC_REGEX" >> "$REPORT" 2>/dev/null
if [ $? -ne 0 ]; then echo " -> Clean: No historical IOCs found in active branches." | tee -a "$REPORT"; fi

echo -e "\n[*] 4. Deep Scan: Hunting orphaned/unreachable commits..." | tee -a "$REPORT"
# The attacker abandoned branches, leaving malicious commits dangling in the Git database.
git fsck --unreachable 2>/dev/null | awk '/commit/ {print $3}' | xargs -I {} git grep -lE "$IOC_REGEX" {} >> "$REPORT" 2>/dev/null
if [ $? -ne 0 ]; then echo " -> Clean: No orphaned malicious commits found." | tee -a "$REPORT"; fi

echo -e "\n==================================================" >> "$REPORT"
echo "Scan complete. The results have been saved to $REPORT."