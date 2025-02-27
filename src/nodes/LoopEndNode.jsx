import React from 'react';
import { Handle } from '@xyflow/react';

const LoopEndNode = ({ data }) => {
  return (
    <div className='loopEnd-wrapper'>
      <div className='loopEnd'>
        {data.label}
      </div>
      <Handle type="source" position="top" id='top'/>
      <Handle type="source" position="bottom" id='bottom'/>
      <Handle type="source" position="left" style={{ top: 17 }} id='left'/>
      <Handle type="source" position="right" style={{ top: 17 }} id='right'/>
    </div>
  );
};

export default LoopEndNode;
