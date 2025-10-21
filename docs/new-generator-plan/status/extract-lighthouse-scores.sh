#!/bin/bash

cd /Users/dolphilia/github/libx-dev

echo "=== Lighthouse Scores Summary ==="
echo ""

for file in docs/new-generator-plan/status/lighthouse-reports/*.report.json; do
  name=$(basename "$file" .report.json)
  echo "### $name"
  cat "$file" | jq -r '"Performance: \(.categories.performance.score*100|round), Accessibility: \(.categories.accessibility.score*100|round), Best Practices: \(.categories."best-practices".score*100|round), SEO: \(.categories.seo.score*100|round)"'
  echo ""
done
