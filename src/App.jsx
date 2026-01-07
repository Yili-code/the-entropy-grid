import 'reactflow/dist/style.css';
import React, { useCallback, useEffect } from 'react';
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

const STORAGE_KEY = 'react-flow-data';

// 定義默認初始節點和邊
const defaultInitialNodes = [
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
      habitName: '範例習慣',
      isDone: false,
      color: '#ff007f'
    }, 
    position: { x: 0, y: 200 } 
  }
];
const defaultInitialEdges = [{ id: 'e0-1', source: '0', target: '1', animated: true }];

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

  // 切換完成狀態
  const onToggleDone = useCallback(
    (id, isDone) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, isDone },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 詳細按鈕點擊處理
  const onDetail = useCallback(
    (id) => {
      setNodes((nds) => {
        const node = nds.find((n) => n.id === id);
        if (node) {
          console.log('詳細信息:', node);
          // 這裡可以打開詳細信息彈窗或執行其他操作
          alert(`節點詳細信息:\n名稱: ${node.data.habitName || node.data.label}\n完成狀態: ${node.data.isDone ? '已完成' : '未完成'}`);
        }
        return nds; // 不改變節點狀態，只是讀取
      });
    },
    [setNodes]
  );

  // 從 LocalStorage 嘗試讀取並初始化（只在組件掛載時運行一次）
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialNodes = defaultInitialNodes;
    let initialEdges = defaultInitialEdges;

    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        if (savedNodes && savedNodes.length > 0) {
          initialNodes = savedNodes;
        }
        if (savedEdges && savedEdges.length > 0) {
          initialEdges = savedEdges;
        }
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }

    // 為初始節點添加回調函數
    initialNodes = initialNodes.map((node) => {
      if (node.type === 'colorPicker') {
        return {
          ...node,
          data: {
            ...node.data,
            onChange: onColorChange,
            onDelete: onDeleteNode,
            onToggleDone: onToggleDone,
            onDetail: onDetail,
          },
        };
      }
      return node;
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件掛載時運行一次

  // 當回調函數改變時，更新所有節點的回調函數
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'colorPicker') {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: onColorChange,
              onDelete: onDeleteNode,
              onToggleDone: onToggleDone,
              onDetail: onDetail,
            },
          };
        }
        return node;
      })
    );
  }, [onColorChange, onDeleteNode, onToggleDone, onDetail, setNodes]);

  // 自動保存節點和邊到本地儲存（清理函數引用）
  useEffect(() => {
    // 只在有節點或邊時才保存，避免初始化時覆蓋
    if (nodes.length === 0 && edges.length === 0) {
      return;
    }
    
    try {
      // 清理節點數據，移除函數引用以便序列化
      const cleanNodes = nodes.map((node) => {
        const { 
          onChange: _onChange, 
          onDelete: _onDelete, 
          onToggleDone: _onToggleDone,
          onDetail: _onDetail,
          ...cleanData 
        } = node.data || {};
        return {
          ...node,
          data: cleanData,
        };
      });

      const dataToSave = { 
        nodes: cleanNodes, 
        edges
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [nodes, edges]);

  // 連接兩節點時新增一條邊
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = useCallback(() => {
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
          habitName: `習慣 ${nds.length + 1}`,
          isDone: false,
          color: randomColor,
          onChange: onColorChange,
          onDelete: onDeleteNode,
          onToggleDone: onToggleDone,
          onDetail: onDetail
        },
        position: {
          x: newX,
          y: newY
        },
      };

      return nds.concat(newNode);
    });
  }, [onColorChange, onDeleteNode, onToggleDone, onDetail, setNodes]);

  // 手動存檔函數
  const handleManualSave = useCallback(() => {
      // 清理節點數據，移除函數引用以便序列化
      const cleanNodes = nodes.map((node) => {
        const { 
          onChange: _onChange, 
          onDelete: _onDelete, 
          onToggleDone: _onToggleDone,
          onDetail: _onDetail,
          ...cleanData 
        } = node.data || {};
        return {
          ...node,
          data: cleanData,
        };
      });

    const dataToSave = { 
      nodes: cleanNodes, 
      edges,
      savedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      // 顯示保存成功提示
      const saveButton = document.querySelector('.save-button');
      if (saveButton) {
        const originalText = saveButton.textContent;
        saveButton.textContent = '✓ SAVED';
        saveButton.style.color = '#10b981';
        saveButton.style.borderColor = '#10b981';
        saveButton.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.8), inset 0 0 20px rgba(16, 185, 129, 0.2)';
        
        setTimeout(() => {
          saveButton.textContent = originalText;
          saveButton.style.color = '#00f3ff';
          saveButton.style.borderColor = '#00f3ff';
          saveButton.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.1)';
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('存檔失敗！');
    }
  }, [nodes, edges]);

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
          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}>
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
            <button
              onClick={handleManualSave}
              className="cyberpunk-button save-button"
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
              💾 SAVE
            </button>
          </div>
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