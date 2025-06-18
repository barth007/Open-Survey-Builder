#!/bin/bash

TARGET_FILE="src/features/survey-editor/components/AnalysisPanel.tsx"

if [[ ! -f "$TARGET_FILE" ]]; then
  echo "❌ File non trovato: $TARGET_FILE"
  exit 1
fi

sed -i '' \
  -e 's|from "./panel/AnalysisPanelHeader"|from "@/components/survey/analysis/panel/AnalysisPanelHeader"|' \
  -e 's|from "./panel/AnalysisTabs"|from "@/components/survey/analysis/panel/AnalysisTabs"|' \
  -e 's|from "./panel/TaggingTab"|from "@/components/survey/analysis/panel/TaggingTab"|' \
  -e 's|from "./panel/CollapsedAnalysisPanel"|from "@/components/survey/analysis/panel/CollapsedAnalysisPanel"|' \
  "$TARGET_FILE"

echo "✅ Import aggiornati in $TARGET_FILE"
