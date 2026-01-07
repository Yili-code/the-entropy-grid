import React from 'react';
import { Handle, Position } from 'reactflow';

// 自定義節點組件
const ColorSelectorNode = ({ id, data }) => {
  return (
    <div style={{ 
      background: data.color || '#fff', 
      padding: '10px', 
      borderRadius: '8px', 
      border: '2px solid #777', 
      minWidth: '100px',
      position: 'relative', // 為絕對定位的子元素（刪除按鈕）提供定位上下文
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // 添加陰影效果
      transition: 'all 0.2s ease', // 添加過渡動畫
    }}>
      
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Top} id="top-source" />
      
      
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
      
      
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      
     
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      
      {data.onDelete && (
      <button
        onClick={() => data.onDelete(id)}
        className="nodrag"
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          fontSize: '12px',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', 
          transition: 'all 0.2s ease', 
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.background = '#ff7875'; 
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'; 
          e.target.style.background = '#ff4d4f'; 
        }}
      >
        ×
      </button>
      )}
      
      <div>
        <strong>{data.label}</strong>
        <input 
          type="color" 
          defaultValue={data.color}
          onChange={(evt) => data.onChange(id, evt.target.value)}
          className="nodrag" 
        />
      </div>
    </div>
  );
};

export default ColorSelectorNode;
