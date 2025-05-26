// src/features/ProjectDashboard/components/ProjectListItem.tsx
import React, { useEffect, useState, useCallback } from 'react'; 
import { Project, ProjectStatus } from '../../../types';
import { Card, Text, Group, Button, Menu, Badge, Space, Divider, Stack, Progress, Tooltip } from '@mantine/core'; 
import { IconChevronDown, IconGitBranch, IconPlayerPlay, IconTools, IconSettings, IconFiles, IconLink, IconTerminal2, IconPlayerStop } from '@tabler/icons-react'; 

interface ProjectListItemProps {
  project: Project;
  onProjectUpdate: (updatedProject: Partial<Project> & { id: string }) => void;
  addConsoleMessage: (text: string, type?: 'stdout' | 'stderr' | 'system' | 'git', projectId?: string, processId?: string) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onProjectUpdate, addConsoleMessage }) => {
  const [gitUiFeedback, setGitUiFeedback] = useState<{message: string, progressVal?: number, error?: boolean}>({message: ''});
  const [isCloningOrPulling, setIsCloningOrPulling] = useState(false);
  const [activeProcessId, setActiveProcessId] = useState<string | undefined>(undefined); 

  const statusColor = (status: Project['currentStatus']) => { /* ... as before ... */ 
    switch (status) {
      case 'running': return 'green';
      case 'stopped': return 'red';
      case 'building': return 'blue';
      case 'error': return 'orange';
      case 'cloned': return 'cyan';
      case 'not_cloned': return 'gray';
      default: return 'dimmed'; // Changed 'gray' to 'dimmed' for unknown
    }
  };

  // Git operation status listener
  useEffect(() => {
    const removeListener = window.electronAPI.onGitOperationStatus(project.id, (_event, status) => {
       if (status.channel === 'progress') {
         setGitUiFeedback({ message: `[GIT ${status.phase}] ${status.message || ''}`, progressVal: status.progress });
       } else if (status.channel === 'result') {
         setIsCloningOrPulling(false);
         if (status.success) {
           setGitUiFeedback({ message: `GIT: Operation successful. ${status.error || status.message || ''}`, progressVal: 100 });
           addConsoleMessage(`GIT: ${project.name} - Operation successful. ${status.error || ''}`, 'git', project.id);
           onProjectUpdate({ id: project.id, currentStatus: 'cloned', clonePath: status.path || project.clonePath, statusMessage: status.error || 'Ready' });
         } else {
           setGitUiFeedback({ message: `GIT Error: ${status.error || 'Unknown error'}`, error: true });
           addConsoleMessage(`GIT Error: ${project.name} - ${status.error || 'Unknown error'}`, 'stderr', project.id);
           onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: status.error || 'Git operation failed' });
         }
       }
    });
    return removeListener; 
  }, [project.id, project.name, onProjectUpdate, addConsoleMessage, project.clonePath]); // Added project.clonePath to dependency array

  const handleGitAction = async () => {
    setGitUiFeedback({ message: 'Initiating Git operation...', progressVal: 0 });
    setIsCloningOrPulling(true);
    
    const targetName = project.name.replace(/[^a-zA-Z0-9_-]/g, '') || project.id;

    if (project.currentStatus === 'not_cloned' || !project.clonePath /* crude check */) {
        try {
          const result = await window.electronAPI.gitClone({ 
            projectId: project.id, 
            repoUrl: project.gitUrl, 
            targetDirectoryName: targetName 
          });
          if (!result.success && result.error && !result.error.includes("already exists")) {
             setGitUiFeedback({message: `Clone command failed to invoke: ${result.error}`, error: true});
             setIsCloningOrPulling(false);
             onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: result.error });
          }
        } catch (err: any) {
            setGitUiFeedback({message: `IPC Error during clone: ${err.message}`, error: true});
            setIsCloningOrPulling(false);
            onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `IPC Error: ${err.message}` });
        }
    } else {
        if (!project.clonePath) {
            setGitUiFeedback({message: "Error: Clone path not known for pull operation.", error: true});
            setIsCloningOrPulling(false);
            onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: "Clone path unknown for pull." });
            return;
        }
        try {
            const result = await window.electronAPI.gitPull({ projectId: project.id, repoPath: project.clonePath });
            if (!result.success) {
                setGitUiFeedback({message: `Pull command failed to invoke: ${result.error}`, error: true});
                setIsCloningOrPulling(false);
                onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: result.error });
            }
        } catch (err: any) {
            setGitUiFeedback({message: `IPC Error during pull: ${err.message}`, error: true});
            setIsCloningOrPulling(false);
            onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `IPC Error: ${err.message}` });
        }
    }
  };

  const parseCommand = (cmdString: string): { command: string, args: string[] } => {
    const parts = cmdString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (parts.length === 0) return { command: '', args: [] };
    const command = parts[0].replace(/"/g, '');
    const args = parts.slice(1).map(arg => arg.replace(/"/g, ''));
    return { command, args };
  };

  const handleExecuteCommand = async (commandType: 'build' | 'start') => {
    let cmdToRun: string | undefined;
    if (commandType === 'build') cmdToRun = project.buildCmd;
    else if (commandType === 'start') cmdToRun = project.startCmd;

    if (!cmdToRun) {
      addConsoleMessage(`No ${commandType} command configured for ${project.name}`, 'stderr', project.id);
      return;
    }
    if (!project.clonePath) { 
        addConsoleMessage(`Project path for ${project.name} is not set. Clone repository first.`, 'stderr', project.id);
        return;
    }
    
    const { command, args } = parseCommand(cmdToRun);
    if (!command) {
         addConsoleMessage(`Invalid ${commandType} command for ${project.name}: ${cmdToRun}`, 'stderr', project.id);
         return;
    }

    addConsoleMessage(`Executing ${commandType} for ${project.name}: ${command} ${args.join(' ')}`, 'system', project.id);
    onProjectUpdate({ id: project.id, currentStatus: commandType === 'build' ? 'building' : 'running', statusMessage: `${commandType} in progress...` });

    try {
      const result = await window.electronAPI.executeCommand({ projectId: project.id, command, args, cwd: project.clonePath });
      if (result.success && result.processId) {
        if (commandType === 'start') {
          setActiveProcessId(result.processId); 
        }
      } else {
        addConsoleMessage(`Failed to start ${commandType} process for ${project.name}: ${result.error}`, 'stderr', project.id);
        onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `Failed to start ${commandType}: ${result.error}` });
      }
    } catch (err: any) {
      addConsoleMessage(`IPC Error during ${commandType} for ${project.name}: ${err.message}`, 'stderr', project.id);
      onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: `IPC Error: ${err.message}` });
    }
  };
  
  const handleStopCommand = async () => {
    if (activeProcessId) {
        addConsoleMessage(`Stopping process ${activeProcessId} for ${project.name}`, 'system', project.id, activeProcessId);
        const success = await window.electronAPI.killProcess({ processId: activeProcessId });
        if (success) {
             onProjectUpdate({ id: project.id, currentStatus: 'stopped', statusMessage: 'Stop signal sent.'});
        } else {
             addConsoleMessage(`Failed to send stop signal to process ${activeProcessId}. It might have already exited.`, 'stderr', project.id, activeProcessId);
             onProjectUpdate({ id: project.id, currentStatus: 'error', statusMessage: 'Failed to stop process or already stopped.'});
        }
        setActiveProcessId(undefined); 
    } else {
        addConsoleMessage(`No active process to stop for ${project.name}.`, 'system', project.id);
        if(project.currentStatus === 'running') { 
            onProjectUpdate({ id: project.id, currentStatus: 'stopped', statusMessage: 'Process was likely not running or PID lost.'});
        }
    }
  };
  
  useEffect(() => {
    if (project.currentStatus !== 'running' && project.currentStatus !== 'building' && activeProcessId) {
        setActiveProcessId(undefined);
    }
  }, [project.currentStatus, activeProcessId]);


  return (
    <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
      <Group position="apart" mb="xs">
        <Stack spacing="xs">
          <Text weight={500} size="lg">{project.name}</Text>
          <Text size="sm" color="dimmed">
            Tech: {project.technology || 'N/A'} ({project.techVersion || 'N/A'}) - Port: {project.port || 'N/A'}
          </Text>
        </Stack>
        <Badge color={statusColor(project.currentStatus)} variant="light">
          {project.currentStatus}
        </Badge>
      </Group>

      {(gitUiFeedback.message && gitUiFeedback.message.startsWith('[GIT')) || (project.statusMessage && !gitUiFeedback.message.startsWith('[GIT')) ? (
        <Box my="sm">
          <Text size="xs" color={gitUiFeedback.error ? 'red' : (project.currentStatus === 'error' ? 'red' : 'blue')}>{gitUiFeedback.message.startsWith('[GIT') ? gitUiFeedback.message : project.statusMessage}</Text>
          {typeof gitUiFeedback.progressVal === 'number' && gitUiFeedback.progressVal < 100 && !gitUiFeedback.error && (
            <Progress value={gitUiFeedback.progressVal} size="sm" animate={isCloningOrPulling && gitUiFeedback.progressVal > 0 && gitUiFeedback.progressVal < 100} />
          )}
        </Box>
      ) : null}
      
      <Divider my="sm" />

      <Group spacing="xs" grow>
        <Button leftIcon={<IconGitBranch size={14} />} variant="outline" size="xs" onClick={handleGitAction} loading={isCloningOrPulling} disabled={isCloningOrPulling || project.currentStatus === 'building' || project.currentStatus === 'running'}>
          {project.currentStatus === 'not_cloned' ? 'Clone' : 'Pull'}
        </Button>

        <Tooltip label={project.buildCmd || "No build command"} disabled={!!project.buildCmd}>
          <Button leftIcon={<IconTools size={14} />} variant="outline" size="xs" onClick={() => handleExecuteCommand('build')} disabled={!project.buildCmd || project.currentStatus === 'building' || project.currentStatus === 'running' || project.currentStatus === 'not_cloned'}>
            Build
          </Button>
        </Tooltip>

        {project.currentStatus === 'running' ? (
          <Button leftIcon={<IconPlayerStop size={14} />} variant="filled" color="red" size="xs" onClick={handleStopCommand} disabled={!activeProcessId}>
            Stop
          </Button>
        ) : (
          <Tooltip label={project.startCmd || "No start command"} disabled={!!project.startCmd}>
            <Button leftIcon={<IconPlayerPlay size={14} />} variant="outline" size="xs" onClick={() => handleExecuteCommand('start')} disabled={!project.startCmd || project.currentStatus === 'building' || project.currentStatus === 'running' || project.currentStatus === 'not_cloned'}>
              Start
            </Button>
          </Tooltip>
        )}
        
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button leftIcon={<IconSettings size={14} />} variant="outline" size="xs">Config</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item disabled>View/Edit (NI)</Menu.Item>
            {project.configNotes && <Menu.Item disabled><Text truncate>Notes: {project.configNotes}</Text></Menu.Item>}
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Space h="xs"/>
      <Group spacing="xs" grow>
         <Menu shadow="md" width={200}>
          <Menu.Target><Button variant="subtle" size="xs" rightIcon={<IconChevronDown size={14} />}>Environments</Button></Menu.Target>
          <Menu.Dropdown>
            {project.environments?.map(env => <Menu.Item key={env.id} disabled>{env.name} {env.isActive ? '(Active)' : ''}</Menu.Item>) ?? <Menu.Item disabled>None</Menu.Item>}
          </Menu.Dropdown>
        </Menu>
        <Menu shadow="md" width={200}>
          <Menu.Target><Button variant="subtle" size="xs" rightIcon={<IconChevronDown size={14} />}>Links</Button></Menu.Target>
          <Menu.Dropdown>
            {project.links?.map(link => <Menu.Item key={link.id} component="a" href={link.url} target="_blank">{link.title}</Menu.Item>) ?? <Menu.Item disabled>None</Menu.Item>}
          </Menu.Dropdown>
        </Menu>
        <Menu shadow="md" width={200}>
          <Menu.Target><Button variant="subtle" size="xs" rightIcon={<IconChevronDown size={14} />}>Logs</Button></Menu.Target>
          <Menu.Dropdown>
             {project.logConfigs?.map(log => <Menu.Item key={log.id} disabled>{log.title} (NI)</Menu.Item>) ?? <Menu.Item disabled>None</Menu.Item>}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
};
export default ProjectListItem;
