import React from 'react';
import { Technology } from '../types';
import TechnologyListItem from './TechnologyListItem';

interface TechnologyListProps {
  technologies: Technology[];
}

const TechnologyList: React.FC<TechnologyListProps> = ({ technologies }) => {
  if (technologies.length === 0) {
    return <p>No technologies configured yet.</p>;
  }
  return (
    <div>
      {technologies.map(tech => (
        <TechnologyListItem key={tech.id} technology={tech} />
      ))}
    </div>
  );
};

export default TechnologyList;
