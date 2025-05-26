import React from 'react';
import { Repository } from '../types';

interface RepositoryListItemProps {
  repository: Repository;
}

const RepositoryListItem: React.FC<RepositoryListItemProps> = ({ repository }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
      <h3>{repository.name}</h3>
      <p><strong>URL:</strong> {repository.gitUrl}</p>
      <p><strong>Branch:</strong> {repository.branch}</p>
      {repository.group && <p><strong>Group:</strong> {repository.group}</p>}
      {/* Placeholder buttons */}
      <button onClick={() => alert('Edit ' + repository.name)}>Edit</button>
      <button onClick={() => alert('Delete ' + repository.name)} style={{ marginLeft: '5px' }}>Delete</button>
    </div>
  );
};

export default RepositoryListItem;
