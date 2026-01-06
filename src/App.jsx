import React, { useCallback } from 'react';
import ColorSelectorNode from './ColorSelectorNode';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge 
} from 'reactflow';

const nodeTypes = {
  colorPicker: ColorSelectorNode,
};

import 'reactflow/dist/style.css';

// 定義初始節點
const initialNodes = [
  { 
    id: '1',
    type: 'colorPicker',
    data: { label: '選個顏色吧', color: '#ff0000' } , 
    position: { x: 100, y: 100 } 
  },   
  { 
    id: '2',
    type: 'default',
    data: { label: '普通節點' },
    position: { x: 100, y: 600 } 
  },
  {
    id: '3',
    type: 'colorPicker',
    data: { label: '這裡才是自定義標題', color: '#000000' },
    position: { x: 600, y: 100 }
  },
];

// 定義初始連線
const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 當使用者手動連線時觸發
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f8f9fa' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="lines" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}