import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core'; // Import Mantine components
import App from './App';
import './index.css';

function Root() {
  // Removed ColorSchemeProvider and related state/logic
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <App />
    </MantineProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
