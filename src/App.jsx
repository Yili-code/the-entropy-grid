import 'reactflow/dist/style.css';
import React, { useCallback } from 'react';
import ColorSelectorNode from './ColorSelectorNode';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Panel
} from 'reactflow';

const nodeTypes = {
  colorPicker: ColorSelectorNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]); 
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 更新節點顏色
  const onColorChange = useCallback(
    (id, newColor) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, color: newColor },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 刪除節點和相關邊
  const onDeleteNode = useCallback(
    (id) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, 
    [setNodes, setEdges]
  );

  React.useEffect(() => {
    // 副作用邏輯: 初始化節點和邊
    const initialNodes = [
      { 
        id: '0', 
        type: 'default',
        data: { label: 'Center' },
        position: { x: 0, y: 0 } 
      },
      { 
        id: '1',
        type: 'colorPicker',
        data: { 
          label: 'NODE_01', 
          color: '#ff007f', 
          onChange: onColorChange,
          onDelete: onDeleteNode 
        }, 
        position: { x: 0, y: 200 } 
      }
    ];
    // 更新節點和邊
    setNodes(initialNodes);
    setEdges([{ id: 'e0-1', source: '0', target: '1', animated: true }]);
  }, [onColorChange, onDeleteNode, setNodes, setEdges]);

  // 連接兩節點時新增一條邊
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = useCallback(() => {
    // 使用 useRef 或函數式更新來避免在渲染期間調用不純函數
    setNodes((nds) => {
      const newNodeId = `node_${Date.now()}`;
      const newX = Math.random() * 800 - 400;
      const newY = Math.random() * 800 - 400;

      // 隨機選擇霓虹色
      const neonColors = ['#ff007f', '#00f3ff', '#bc13fe'];
      const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];

      const newNode = {
        id: newNodeId, 
        type: 'colorPicker',
        data: {
          label: `NODE_${nds.length + 1}`,
          color: randomColor,
          onChange: onColorChange,
          onDelete: onDeleteNode
        },
        position: {
          x: newX,
          y: newY
        },
      };

      return nds.concat(newNode);
    });
  }, [onColorChange, onDeleteNode, setNodes]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* SVG 濾鏡定義用於霓虹發光效果 */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="neon-glow-pink">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="neon-glow-cyan">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="neon-glow-purple">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        connectionMode="loose"
        defaultEdgeOptions={{ 
          animated: true,
          style: { strokeWidth: 3, stroke: '#00f3ff' },
        }}
      >
        <Panel position="top-right">
          <button
            onClick={addNewNode}
            className="cyberpunk-button"
            style={{
              padding: '12px 24px',
              borderRadius: '0',
              background: 'rgba(10, 10, 10, 0.8)',
              color: '#00f3ff',
              border: '1px solid #00f3ff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              boxShadow: '0 0 10px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.8), inset 0 0 20px rgba(0, 243, 255, 0.2)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            + ADD NODE
          </button>
        </Panel>
        <Controls 
          style={{
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0',
            boxShadow: '0 0 20px rgba(0, 243, 255, 0.3), inset 0 0 20px rgba(0, 243, 255, 0.05)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
          }}
        />
        <MiniMap 
          style={{
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 243, 255, 0.3), inset 0 0 20px rgba(0, 243, 255, 0.05)',
          }}
          nodeColor={(node) => {
            if (node.type === 'colorPicker') {
              return node.data?.color || '#00f3ff';
            }
            return '#00f3ff';
          }}
        />
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color="#1a1a1a"
        />
      </ReactFlow>
    </div>
  );
}