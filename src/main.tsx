
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePopupBlocker } from './utils/popupBlocker'

// Initialize popup blocker as early as possible
initializePopupBlocker();

createRoot(document.getElementById("root")!).render(<App />);
