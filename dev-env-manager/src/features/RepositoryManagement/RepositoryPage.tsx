import React, { useState } from 'react';
import { Repository } from '../../types';
import { mockRepositories } from '../../config/mockData';
import RepositoryList from '../../components/RepositoryList';

const RepositoryPage: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>(mockRepositories);
  // Placeholder for form state
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoBranch, setNewRepoBranch] = useState('');

  const handleAddRepository = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Add Repo: ${newRepoName}, ${newRepoUrl}, ${newRepoBranch} (Not implemented)`);
    // Actual logic will be added later
  };

  return (
    <div>
      <h2>Repository Management</h2>
      <form onSubmit={handleAddRepository} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
        <h3>Add New Repository (Placeholder)</h3>
        <div>
          <label>Name: </label>
          <input type="text" value={newRepoName} onChange={e => setNewRepoName(e.target.value)} required />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Git URL: </label>
          <input type="text" value={newRepoUrl} onChange={e => setNewRepoUrl(e.target.value)} required />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Branch: </label>
          <input type="text" value={newRepoBranch} onChange={e => setNewRepoBranch(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Add Repository</button>
      </form>
      <RepositoryList repositories={repositories} />
    </div>
  );
};

export default RepositoryPage;
