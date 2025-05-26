import { Repository, Technology } from '../types'; // Add Technology here

export const mockRepositories: Repository[] = [
  { id: '1', name: 'Project Alpha', gitUrl: 'git@example.com:group/alpha.git', branch: 'main', group: 'Group A' },
  { id: '2', name: 'Service Beta', gitUrl: 'git@example.com:org/beta.git', branch: 'develop' },
  { id: '3', name: 'Library Gamma', gitUrl: 'https://github.com/user/gamma.git', branch: 'main', group: 'Group A' },
];

export const mockTechnologies: Technology[] = [
  { id: 'tech-1', name: 'Node.js', version: '18.12.1', downloadUrl: 'https://nodejs.org/dist/v18.12.1/node-v18.12.1-win-x64.zip', isInstalled: false },
  { id: 'tech-2', name: 'Maven', version: '3.8.6', localPath: 'C:/Tools/maven', isInstalled: true },
  { id: 'tech-3', name: 'Git', version: '2.38.1', isInstalled: true, localPath: '/usr/bin/git' },
  { id: 'tech-4', name: 'OpenJDK 17 (Temurin)', version: '17.0.5', downloadUrl: 'https://api.adoptium.net/v3/binary/version/jdk-17.0.5+8/windows/x64/jdk/hotspot/normal/eclipse', isInstalled: false}
];
