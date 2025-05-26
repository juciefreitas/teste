import React from 'react';
import { Repository } from '../types';
import RepositoryListItem from './RepositoryListItem';

interface RepositoryListProps {
  repositories: Repository[];
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  if (repositories.length === 0) {
    return <p>No repositories configured yet.</p>;
  }
  return (
    <div>
      {repositories.map(repo => (
        <RepositoryListItem key={repo.id} repository={repo} />
      ))}
    </div>
  );
};

export default RepositoryList;
