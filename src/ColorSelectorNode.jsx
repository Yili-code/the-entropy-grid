import React from 'react';
import { Handle, Position } from 'reactflow';

// 這就是你的自定義節點組件
const ColorSelectorNode = ({ id, data }) => {
  return (
    <div style={{ 
      background: data.color || '#fff', 
      padding: '10px', 
      borderRadius: '8px', 
      border: '2px solid #777',
      minWidth: '100px' 
    }}>
      <Handle type="target" position={Position.Top} />
      
      <div>
        <strong>{data.label}</strong>
        <input 
          type="color" 
          defaultValue={data.color}
          onChange={(evt) => data.onChange(id, evt.target.value)}
          className="nodrag" 
        />
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ColorSelectorNode;