export interface Repository {
  id: string;
  name: string;
  gitUrl: string;
  branch: string;
  group?: string; // Optional group
}
