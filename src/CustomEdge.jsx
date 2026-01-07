import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const glowColor = style.stroke || '#00f3ff';

  return (
    <>
      <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: isHovered ? 4 : 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          }}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // 觸發刪除事件
                const event = new CustomEvent('deleteEdge', { detail: { edgeId: id } });
                window.dispatchEvent(event);
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '0',
                background: 'rgba(10, 10, 10, 0.9)',
                border: `1px solid #ff007f`,
                color: '#ff007f',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(255, 0, 127, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                padding: 0,
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.2)';
                e.target.style.boxShadow = '0 0 20px rgba(255, 0, 127, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 10px rgba(255, 0, 127, 0.5)';
              }}
              title="刪除連接"
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;

