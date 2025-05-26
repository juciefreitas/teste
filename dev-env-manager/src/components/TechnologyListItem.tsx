import React from 'react';
import { Technology } from '../types';

interface TechnologyListItemProps {
  technology: Technology;
}

const TechnologyListItem: React.FC<TechnologyListItemProps> = ({ technology }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
      <h3>{technology.name} {technology.version && `(${technology.version})`}</h3>
      <p>Status: {technology.isInstalled ? `Installed (${technology.localPath || 'Path not set'})` : 'Not Installed'}</p>
      {technology.downloadUrl && !technology.isInstalled && (
        <button onClick={() => alert('Download ' + technology.name + ' from ' + technology.downloadUrl + ' (Not implemented)')}>
          Download
        </button>
      )}
      {!technology.isInstalled && (
         <button onClick={() => alert('Set local path for ' + technology.name + ' (Not implemented)')} style={{ marginLeft: '5px' }}>
           Set Local Path
         </button>
      )}
      {technology.isInstalled && technology.localPath && (
        <button onClick={() => alert('Clear local path for ' + technology.name + ' (Not implemented)')} style={{ marginLeft: '5px' }}>
          Clear Path / Uninstall
        </button>
      )}
       <button onClick={() => alert('Edit ' + technology.name + ' (Not implemented)')} style={{ marginLeft: '5px' }}>Edit</button>
    </div>
  );
};

export default TechnologyListItem;
