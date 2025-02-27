import React from 'react';
import { Handle } from '@xyflow/react';

const ConditionNode = ({ data }) => {
  return (
    <div className='condition'>
      <div style={{ transform: 'rotate(-45deg)' }}>{data.label}</div>
      <Handle type="source" position="top" style={{ top: 0, left: 0 }} id="top"/>
      <Handle type="source" position="bottom" style={{ bottom: 0 , left: 100 }} id="bottom" />
      <Handle type="source" position="right" style={{ top: 0 }} id='right' />
      <Handle type="source" position="left" style={{ top: 100 }} id='left' />
    </div>
  );
};

export default ConditionNode;
