import React from 'react';

const ContextMenu = ({ onClick, position, items }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        background: 'white',
        color: 'black',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1000,
        padding: '4px 0',
      }}
    >
      {items.map((item) => {
        const itemStyle = {
          padding: '8px 16px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        };

        if (item.disabled) {
          itemStyle.color = '#aaa';
          itemStyle.cursor = 'not-allowed';
        }

        return (
          <div
            key={item.key}
            onClick={() => !item.disabled && onClick(item.key)}
            style={itemStyle}
            title={item.title || ''}
            onMouseEnter={(e) => {
              if (!item.disabled) e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              if (!item.disabled) e.currentTarget.style.backgroundColor = 'white';
            }
          }
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

export default ContextMenu;
