import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'; // Import Mantine components
import App from './App';
import './index.css';

function Root() {
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>('light'); // Default to light
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <App />
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
