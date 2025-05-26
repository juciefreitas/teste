import React, { useEffect, useState } from 'react';
import { RepositoryPage } from './features/RepositoryManagement';
import { TechnologyPage } from './features/TechnologyManagement';
import { UpdateStatusInfo } from './electron.d'; // Import the type

function App() {
  const [version, setVersion] = useState('Loading...');
  const [toolsPath, setToolsPath] = useState('Loading tools path...');
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusInfo | null>(null); // State for update status
  const [showInstallButton, setShowInstallButton] = useState(false);

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

    // Setup listener for update status
    const removeUpdateListener = window.electronAPI.onUpdateStatus((_event, status) => {
      console.log("Update status from main:", status);
      setUpdateStatus(status);
      if (status.downloaded) {
        setShowInstallButton(true);
      } else {
        setShowInstallButton(false); // Hide if new status is not 'downloaded'
      }
    });

    return () => {
      // Cleanup listener when component unmounts
      if (removeUpdateListener) {
        removeUpdateListener();
      }
    };
  }, []);

  const handleCheckForUpdates = () => {
    setUpdateStatus({ msg: "Manual check triggered..." }); // Optimistic update
    setShowInstallButton(false);
    window.electronAPI.checkForUpdates();
  };

  const handleQuitAndInstall = () => {
    window.electronAPI.quitAndInstallUpdate();
  };

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        <h1>Dev Env Manager</h1>
        <p>App Version: <strong id="app-version">{version}</strong></p>
        <p>Tools Directory: <small><code>{toolsPath}</code></small></p>
        {/* Auto Update Section */}
        <div>
          <button onClick={handleCheckForUpdates}>Check for Updates</button>
          {showInstallButton && (
            <button onClick={handleQuitAndInstall} style={{ marginLeft: '10px', color: 'green' }}>
              Quit and Install Update
            </button>
          )}
          {updateStatus && <p style={{fontSize: '0.9em', color: updateStatus.error ? 'red' : 'inherit'}}>Update Status: {updateStatus.msg}</p>}
        </div>
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
