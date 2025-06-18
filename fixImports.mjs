import fs from 'fs/promises';

const filePath = './src/features/survey-editor/components/AnalysisPanel.tsx';
const oldPath = './InsightsSummary';
const newPath = '@/components/survey/analysis/InsightsSummary';

const run = async () => {
  try {
    let content = await fs.readFile(filePath, 'utf-8');

    if (content.includes(oldPath)) {
      const updated = content.replaceAll(oldPath, newPath);
      await fs.writeFile(filePath, updated);
      console.log(`✅ ${oldPath} → ${newPath}`);
    } else {
      console.log('ℹ️  Nessuna sostituzione necessaria.');
    }
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
};

run();
