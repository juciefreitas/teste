// src/types/project.ts
export type ProjectStatus = 'unknown' | 'not_cloned' | 'cloned' | 'building' | 'running' | 'stopped' | 'error';

export interface ProjectEnvironment {
  id: string;
  name: string; // e.g., 'development', 'staging', 'production'
  isActive?: boolean;
  variables?: Record<string, string>; // Environment-specific variables
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
}

export interface ProjectLogConfig {
  id: string;
  title: string;
  path?: string; // Path to a log file
  command?: string; // Command to fetch logs
}

export interface Project {
  id: string;
  name: string;
  group: string; // For grouping in the UI
  gitUrl: string;
  clonePath: string; // Suggested local path for cloning the repository
  
  technology?: string; // e.g., "Node.js", "Maven", "Python", "Docker"
  techVersion?: string; // Version of the technology
  port?: number; // Default port the project runs on

  buildCmd?: string; // e.g., "npm run build", "mvn package"
  startCmd?: string; // e.g., "npm start", "java -jar target/app.jar"
  stopCmd?: string; // Optional: command to gracefully stop, otherwise process is killed

  environments?: ProjectEnvironment[];
  links?: ProjectLink[];
  logConfigs?: ProjectLogConfig[];
  
  // Configuration details - could be path to files, or a JSON string, or specific structured object
  // For now, keeping it simple. Could expand to: configFiles?: string[], configJson?: string
  configNotes?: string; 

  currentStatus: ProjectStatus; // To reflect current state in UI
  statusMessage?: string; // Optional message, e.g., error details
}
