import React from 'react';

const ContextMenu = ({ onClick, position, items }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => onClick(item.key)}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            ':hover': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
