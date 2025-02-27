import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TextField, Box } from '@mui/material';

const GroupNode = ({ data, selected }) => {
  const onResize = useCallback((event) => {
    if (!data.onResize) return;
    
    const { width, height } = event.target.getBoundingClientRect();
    data.onResize(width, height);
  }, [data]);

  return (
    <Box
      className="group-node"
      style={{
        width: data.width || 300,
        height: data.height || 200,
        border: `2px solid ${selected ? '#F57DBD' : '#ddd'}`,
        borderRadius: '8px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.8)',
      }}
      onResize={onResize}
    >
      <TextField
        value={data.label}
        onChange={(e) => data.onLabelChange(e.target.value)}
        variant="standard"
        sx={{ mb: 1 }}
      />
      {data.children}
    </Box>
  );
};

export default GroupNode;
