import React, { useEffect, useState } from 'react';
import { RepositoryPage } from './features/RepositoryManagement';
import { TechnologyPage } from './features/TechnologyManagement';

function App() {
  const [version, setVersion] = useState('Loading...');
  const [toolsPath, setToolsPath] = useState('Loading tools path...'); // New state

  useEffect(() => {
    const fetchData = async () => {
      if (window.electronAPI) {
        try {
          const appVersion = await window.electronAPI.getVersion();
          setVersion(appVersion);

          const currentToolsPath = await window.electronAPI.getToolsDirectory(); // Fetch tools path
          setToolsPath(currentToolsPath);

        } catch (error) {
          console.error('Failed to fetch data:', error);
          setVersion('Error fetching version');
          setToolsPath('Error fetching tools path');
        }
      } else {
        console.warn('electronAPI not found. Are you running in Electron?');
        setVersion('N/A (not in Electron?)');
        setToolsPath('N/A (not in Electron?)');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        <h1>Dev Env Manager</h1>
        <p>App Version: <strong id="app-version">{version}</strong></p>
        <p>Tools Directory: <small><code>{toolsPath}</code></small></p> {/* Display tools path */}
        <p>
          <small>
            Chrome: <span id="chrome-version"></span> |
            Node: <span id="node-version"></span> |
            Electron: <span id="electron-version"></span>
          </small>
        </p>
      </div>
      <div style={{ padding: '20px' }}>
        <RepositoryPage />
        <hr style={{ margin: '20px 0' }} />
        <TechnologyPage />
      </div>
    </div>
  );
}

export default App;
