import React from 'react';
import { Handle } from '@xyflow/react';

const LoopNode = ({ data }) => {
  return (
    <div className='loop-wrapper'>
      <div className='loop'>
        {data.label}
      </div>
      <Handle type="source" position="top" id="top"/>
      <Handle type="source" position="bottom" id="bottom"/>
      <Handle type="source" position="left" style={{ top: 32 }} id="left"/>
      <Handle type="source" position="right" style={{ top: 32 }} id="right"/>
    </div>
  );
};

export default LoopNode;
