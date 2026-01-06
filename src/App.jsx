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


import 'reactflow/dist/style.css';

const nodeTypes = {
  colorPicker: ColorSelectorNode,
};

// 定義初始節點
const initialNodes = [
  { 
    id: 'node-1',
    type: 'colorPicker',
    data: { label: '選個顏色吧', color: '#ff0000' } , 
    position: { x: 100, y: 100 } 
  },   
  { 
    id: 'node-2',
    type: 'default',
    data: { label: '普通節點' },
    position: { x: 100, y: 300 } 
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