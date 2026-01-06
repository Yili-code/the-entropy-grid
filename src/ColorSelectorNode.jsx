import React from 'react';
import { Handle, Position } from 'reactflow';

// 這就是你的自定義節點組件
const ColorSelectorNode = ({ data }) => {
  return (
    <div style={{ 
      background: '#fff', 
      padding: '10px', 
      borderRadius: '8px', 
      border: '2px solid #777',
      minWidth: '100px' 
    }}>
      {/* Target 代表別人的線連進來 */}
      <Handle type="target" position={Position.Top} />
      
      <div>
        <p style={{ fontSize: '12px', margin: 0 }}>自定義標題</p>
        <strong>{data.label}</strong>
        <input type="color" defaultValue={data.color} style={{ display: 'block' }} />
      </div>

      {/* Source 代表從這個點連出去 */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ColorSelectorNode;