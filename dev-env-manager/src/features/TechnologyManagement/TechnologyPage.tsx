import React, { useState } from 'react';
import { Technology } from '../../types';
import { mockTechnologies } from '../../config/mockData';
import TechnologyList from '../../components/TechnologyList';

const TechnologyPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>(mockTechnologies);
  // Placeholder for form state
  const [newTechName, setNewTechName] = useState('');
  const [newTechVersion, setNewTechVersion] = useState('');
  const [newTechUrl, setNewTechUrl] = useState('');


  const handleAddTechnology = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Add Tech: ${newTechName}, ${newTechVersion}, ${newTechUrl} (Not implemented)`);
    // Actual logic will be added later
  };

  return (
    <div>
      <h2>Technology Stack Management</h2>
       <form onSubmit={handleAddTechnology} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
        <h3>Add New Technology (Placeholder)</h3>
        <div>
          <label>Name: </label>
          <input type="text" value={newTechName} onChange={e => setNewTechName(e.target.value)} required />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Version: </label>
          <input type="text" value={newTechVersion} onChange={e => setNewTechVersion(e.target.value)} />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Download URL: </label>
          <input type="text" value={newTechUrl} onChange={e => setNewTechUrl(e.target.value)} />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Add Technology</button>
      </form>
      <TechnologyList technologies={technologies} />
    </div>
  );
};

export default TechnologyPage;
