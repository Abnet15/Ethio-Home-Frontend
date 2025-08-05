import React, { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';

const TestConnection = () => {
  const [status, setStatus] = useState('testing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await propertyService.getProperties({ limit: 1 });
        if (result.success) {
          setStatus('success');
          setMessage('Backend connection successful!');
        } else {
          setStatus('error');
          setMessage(`Backend error: ${result.error}`);
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Backend Connection Test</h3>
      <div style={{ 
        padding: '10px', 
        margin: '10px 0',
        borderRadius: '5px',
        backgroundColor: status === 'success' ? '#dcfce7' : status === 'error' ? '#fef2f2' : '#f3f4f6',
        color: status === 'success' ? '#16a34a' : status === 'error' ? '#dc2626' : '#6b7280'
      }}>
        {status === 'testing' && 'Testing connection...'}
        {status === 'success' && message}
        {status === 'error' && message}
      </div>
    </div>
  );
};

export default TestConnection;
