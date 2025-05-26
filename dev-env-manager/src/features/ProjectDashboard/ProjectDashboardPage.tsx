// src/features/ProjectDashboard/ProjectDashboardPage.tsx
import React from 'react'; // Ensure React is imported
import { mockProjects } from '../../config/mockData';
import { Project } from '../../types';
import ProjectGroup from './components/ProjectGroup';
import { Container, Title, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface ProjectDashboardPageProps {
  addConsoleMessage: (text: string, type?: any, projectId?: string, processId?: string) => void;
}

const ProjectDashboardPage: React.FC<ProjectDashboardPageProps> = ({ addConsoleMessage }) => {
  const [projects, setProjects] = React.useState<Project[]>(mockProjects); 

  const handleProjectUpdate = (updatedProjectPart: Partial<Project> & { id: string }) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === updatedProjectPart.id ? { ...p, ...updatedProjectPart } : p)
    );
  };

  const groupedProjects = projects.reduce((acc, project) => { 
    const group = project.group || 'Uncategorized';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <Container fluid>
      <Group position="apart" mb="xl">
        <Title order={2}>Project Dashboard</Title>
        <Button leftIcon={<IconPlus size={14} />} onClick={() => alert('Add New Project (NI)')}>
          Add Project
        </Button>
      </Group>
      {Object.entries(groupedProjects).map(([groupName, projectList]) => (
        <ProjectGroup 
          key={groupName} 
          groupName={groupName} 
          projects={projectList} 
          onProjectUpdate={handleProjectUpdate} 
          addConsoleMessage={addConsoleMessage} 
        />
      ))}
    </Container>
  );
};
export default ProjectDashboardPage;
