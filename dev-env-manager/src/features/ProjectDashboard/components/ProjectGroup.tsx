// src/features/ProjectDashboard/components/ProjectGroup.tsx
import React from 'react'; // Ensure React is imported
import { Project } from '../../../types';
import ProjectListItem from './ProjectListItem';
import { Accordion, Text } from '@mantine/core';

interface ProjectGroupProps {
  groupName: string;
  projects: Project[];
  onProjectUpdate: (updatedProject: Partial<Project> & { id: string }) => void;
  addConsoleMessage: (text: string, type?: any, projectId?: string, processId?: string) => void;
}

const ProjectGroup: React.FC<ProjectGroupProps> = ({ groupName, projects, onProjectUpdate, addConsoleMessage }) => {
  return (
    <Accordion defaultValue={groupName} mb="md">
      <Accordion.Item value={groupName}>
        <Accordion.Control>
          <Text weight={500} size="xl">{groupName} ({projects.length})</Text>
        </Accordion.Control>
        <Accordion.Panel>
          {projects.map(project => (
            <ProjectListItem 
              key={project.id} 
              project={project} 
              onProjectUpdate={onProjectUpdate} 
              addConsoleMessage={addConsoleMessage} 
            />
          ))}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
export default ProjectGroup;
