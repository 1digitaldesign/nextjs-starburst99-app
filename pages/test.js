import React from 'react';
export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page</h1>
      <p>This is a minimal test page to verify rendering</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <p>If you can see this, the page is working correctly!</p>
      </div>
    </div>
  );
}