import { Project, ProjectStatus, Technology } from '../types'; // Update import

// Remove or comment out old mockRepositories
// export const mockRepositories: Repository[] = [ ... ];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Monorepo Frontend Service',
    group: 'Customer Experience Team',
    gitUrl: 'git@github.com:example-org/cx-frontend.git',
    clonePath: '~/dev/cx-frontend',
    technology: 'Node.js (React/Vite)',
    techVersion: '18.x',
    port: 3001,
    buildCmd: 'npm run build',
    startCmd: 'npm run dev',
    environments: [
      { id: 'env-1-1', name: 'dev', isActive: true, variables: { API_URL: 'http://localhost:8080' } },
      { id: 'env-1-2', name: 'staging', variables: { API_URL: 'https://staging-api.example.com' } },
    ],
    links: [
      { id: 'link-1-1', title: 'Storybook', url: 'http://localhost:6006' },
      { id: 'link-1-2', title: 'Design Figma', url: 'https://figma.com/...' },
    ],
    logConfigs: [
      { id: 'log-1-1', title: 'View Dev Log', command: 'tail -f logs/dev.log' }
    ],
    configNotes: "Uses .env files. Main config in /config/app.config.ts",
    currentStatus: 'not_cloned',
  },
  {
    id: 'proj-2',
    name: 'Auth Microservice',
    group: 'Platform Team',
    gitUrl: 'git@github.com:example-org/auth-service.git',
    clonePath: '~/dev/auth-service',
    technology: 'Java (Spring Boot)',
    techVersion: 'JDK 17 / Maven 3.8',
    port: 8080,
    buildCmd: 'mvn clean package -DskipTests',
    startCmd: 'java -jar target/auth-service-0.0.1.jar',
    environments: [
      { id: 'env-2-1', name: 'dev', isActive: true, variables: { DB_HOST: 'localhost', DB_PORT: '5432' } },
    ],
    links: [ { id: 'link-2-1', title: 'Swagger API', url: 'http://localhost:8080/swagger-ui.html' } ],
    currentStatus: 'cloned',
  },
  {
    id: 'proj-3',
    name: 'Data Processing Pipeline',
    group: 'Data Science Team',
    gitUrl: 'git@github.com:example-org/data-pipeline.git',
    clonePath: '~/dev/data-pipeline',
    technology: 'Python',
    techVersion: '3.9',
    buildCmd: 'pip install -r requirements.txt', // Or maybe no build, just setup
    startCmd: 'python main_processor.py --config /etc/pipeline.conf',
    currentStatus: 'stopped',
    statusMessage: 'Requires specific AWS credentials setup.'
  }
];

// Keep mockTechnologies if it's for the separate "Technology Stack Management" feature from the old plan
// If that feature is being removed or merged, then mockTechnologies can be removed.
// For now, assume it's separate and keep it.
export const mockTechnologies: Technology[] = [ // Using Technology type as it is stable
  { id: 'tech-1', name: 'Node.js', version: '18.12.1', downloadUrl: 'https://nodejs.org/dist/v18.12.1/node-v18.12.1-win-x64.zip', isInstalled: false },
  { id: 'tech-2', name: 'Maven', version: '3.8.6', localPath: 'C:/Tools/maven', isInstalled: true },
  { id: 'tech-3', name: 'Git', version: '2.38.1', isInstalled: true, localPath: '/usr/bin/git' },
  { id: 'tech-4', name: 'OpenJDK 17 (Temurin)', version: '17.0.5', downloadUrl: 'https://api.adoptium.net/v3/binary/version/jdk-17.0.5+8/windows/x64/jdk/hotspot/normal/eclipse', isInstalled: false}
];
