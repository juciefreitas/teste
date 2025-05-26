export interface Technology {
  id: string;
  name: string;
  version?: string; // Optional version
  downloadUrl?: string; // Optional direct download URL
  localPath?: string; // Optional path to local installation
  isInstalled?: boolean; // Status
}
