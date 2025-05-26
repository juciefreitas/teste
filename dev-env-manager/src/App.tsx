// src/App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from './components/Layout/MainLayout';
import ProjectDashboardPage from './features/ProjectDashboard/ProjectDashboardPage';
import ConsoleOutput from './features/ConsoleView/ConsoleOutput';
import { UpdateStatusInfo, ProcessOutputData, ProcessTerminationData } from './electron.d';

// Define a unified console message type for App state
interface AppConsoleMessage {
  id: string;
  timestamp: Date;
  text: string;
  type: 'stdout' | 'stderr' | 'system' | 'git'; // Added 'git' type
  projectId?: string; // Optional: to associate with a project
  processId?: string; // Optional: to associate with a specific process
}

function App() {
  const [version, setVersion] = useState('Loading...');
  const [toolsPath, setToolsPath] = useState('Loading tools path...');
  const [consoleMessages, setConsoleMessages] = useState<AppConsoleMessage[]>([]);

  // Consistent way to add messages to the console
  const addConsoleMessage = useCallback((
    text: string, 
    type: AppConsoleMessage['type'] = 'system', 
    projectId?: string, 
    processId?: string
  ) => {
    setConsoleMessages(prev => [
      ...prev, 
      { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), timestamp: new Date(), text, type, projectId, processId }
    ]);
  }, []);
  
  const clearConsoleMessages = useCallback(() => {
    setConsoleMessages([
        // Optionally, keep initial system messages or add a "Console Cleared" message
        {id: Date.now().toString(), timestamp: new Date(), text: "Console cleared by user.", type: 'system'}
    ]);
  }, []);

  useEffect(() => {
    addConsoleMessage(`Dev Env Manager Initializing...`, 'system');

    const fetchData = async () => { 
        if (window.electronAPI) {
            try {
                const appVersion = await window.electronAPI.getVersion();
                setVersion(appVersion);
                addConsoleMessage(`App Version: ${appVersion}`, 'system');

                const currentToolsPath = await window.electronAPI.getToolsDirectory();
                setToolsPath(currentToolsPath);
                addConsoleMessage(`Tools Directory: ${currentToolsPath}`, 'system');
            } catch (error: any) {
                addConsoleMessage(`Error fetching initial app data: ${error.message}`, 'stderr');
            }
        }
    };
    fetchData();

    // Listener for Auto Update Status
    const removeUpdateListener = window.electronAPI.onUpdateStatus((_event, status: UpdateStatusInfo) => {
      addConsoleMessage(`Update Status: ${status.msg}`, status.error ? 'stderr' : 'system');
      if (status.downloaded) {
        addConsoleMessage('Update downloaded. Click "Quit and Install Update" in the header.', 'system');
      }
    });

    // Listener for Process Output
    const removeProcessOutputListener = window.electronAPI.onProcessOutput((_event, output: ProcessOutputData) => {
      addConsoleMessage(output.data, output.type, output.projectId, output.processId);
    });

    // Listener for Process Termination
    const removeProcessTerminationListener = window.electronAPI.onProcessTermination((_event, term: ProcessTerminationData) => {
      let message = `Process ${term.processId || ''} for project ${term.projectId} exited`;
      if(term.code !== null) message += ` with code: ${term.code}`;
      // Error might not be an Error object if it's just a message from main process
      const errorMessage = typeof term.error === 'string' ? term.error : (term.error?.message || '');
      if(errorMessage) message += ` (Error: ${errorMessage})`;
      addConsoleMessage(message, term.code === 0 ? 'system' : 'stderr', term.projectId, term.processId);
    });
    
    return () => {
      if (removeUpdateListener) removeUpdateListener();
      if (removeProcessOutputListener) removeProcessOutputListener();
      if (removeProcessTerminationListener) removeProcessTerminationListener();
    };
  }, [addConsoleMessage]); // addConsoleMessage is now a dependency

  return (
    <MainLayout 
      consoleSlot={(isExpanded, toggleExpand) => ( // consoleSlot is now a function
        <ConsoleOutput 
          messages={consoleMessages} 
          height="100%" 
          isExpanded={isExpanded}
          onToggleExpand={toggleExpand}
          onClearConsole={clearConsoleMessages} // Pass clear function
        />
      )}
    >
      <ProjectDashboardPage addConsoleMessage={addConsoleMessage} />
    </MainLayout>
  );
}
export default App;
