import React from 'react';
import { Handle } from '@xyflow/react';

const StartNode = ({ data }) => {
  return (
    <div className='start'>
      {data.label}
      <Handle type="source" position="top" id="top" />
      <Handle type="source" position="left" id="left" />
      <Handle type="source" position="right" id="right" />
      <Handle type="source" position="bottom" id="bottom" />
    </div>
  );
};

export default StartNode;
