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

  const onColorChange = useCallback((id, newColor) => {
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
  }, [setNodes]);

  React.useEffect(() => {
    const initialNodes = [
      { 
        id: '1',
        type: 'colorPicker',
        data: { label: '選個顏色!', color: '#ff0000', onChange: onColorChange }, 
        position: { x: 100, y: 100 } 
      },
      { 
        id: '2', 
        type: 'default',
        data: { label: 'Node 2' },
        position: { x: 100, y: 300 } 
      }
    ];
    setNodes(initialNodes);
    setEdges([{ id: 'e1-2', source: '1', target: '2', animated: true }]);
  }, [onColorChange, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = () => {
    const newNodeId = `node_${Date.now()}`;

    const newNode = {
      id: newNodeId, 
      type: 'colorPicker',
      data: {
        label: `新節點 ${nodes.length + 1}`,
        color: '#ffffff',
        onChange: onColorChange
      },

      position: {
        x: Math.random() * 400,
        y: Math.random() * 400
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

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
        <Panel position="top-right">
          <button
            onClick={addNewNode}
            style={{
              padding: '10px 20px',
              borderRadius: '5px', 
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
           + 新增顏色節點
          </button>
        </Panel>
        <Controls />
        <MiniMap />
        <Background variant="lines" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}