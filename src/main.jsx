import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/barlow-semi-condensed/500.css';
import '@fontsource/barlow-semi-condensed/600.css';
import '@fontsource/barlow-semi-condensed/700-italic.css';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
