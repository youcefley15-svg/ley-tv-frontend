import React, { useState } from 'react';

function RepoInput({ onSubmit }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Entrez un code repo</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: megarepo"
          style={{
            padding: '10px',
            width: '300px',
            fontSize: '16px',
            marginRight: '10px'
          }}
        />
        <button type="submit" style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Charger
        </button>
      </form>
    </div>
  );
}

export default RepoInput;