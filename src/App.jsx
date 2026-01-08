import 'reactflow/dist/style.css';
import React, { useCallback, useEffect, useState } from 'react';
import ColorSelectorNode from './ColorSelectorNode';
import HabitDetailModal from './HabitDetailModal';
import SettingsModal from './SettingsModal';
import CustomEdge from './CustomEdge';
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

const edgeTypes = {
  default: CustomEdge,
};

const STORAGE_KEY = 'react-flow-data';
const LAST_OPEN_DATE_KEY = 'last-open-date';

// 顏色系統：從深灰色開始，每 2^n 天解鎖一個新顏色（確保顏色有明顯區別）
const COLOR_SYSTEM = [
  '#1a1a1a', // 0天：深灰色（比純黑更明顯）
  '#ff007f', // 2天：霓虹粉
  '#00f3ff', // 4天：霓虹青
  '#ffd700', // 8天：金色
  '#00ff00', // 16天：霓虹綠
  '#ff4500', // 32天：橙紅色
  '#ff1493', // 64天：深粉紅
  '#00ced1', // 128天：深青色
  '#9370db', // 256天：中紫色
  '#ff00ff', // 512天：洋紅色
];

// 計算已解鎖的顏色列表（基於完成天數）
const getUnlockedColors = (completedDaysCount) => {
  const unlockedColors = [];
  for (let i = 0; i < COLOR_SYSTEM.length; i++) {
    const milestone = Math.pow(2, i);
    if (completedDaysCount >= milestone) {
      unlockedColors.push(COLOR_SYSTEM[i]);
    }
  }
  // 如果沒有任何解鎖的顏色，至少返回深灰色
  if (unlockedColors.length === 0) {
    unlockedColors.push(COLOR_SYSTEM[0]);
  }
  return unlockedColors;
};

// 根據完成天數獲取應該使用的顏色（自動選擇最新解鎖的顏色）
const getColorForMilestone = (completedDaysCount) => {
  const unlockedColors = getUnlockedColors(completedDaysCount);
  return unlockedColors[unlockedColors.length - 1]; // 返回最新解鎖的顏色
};

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
      habitName: 'Example Habit',
      isDone: false,
      notes: '',
      optimizationRecord: '',
      targetCount: 0,
      completedDays: [],
          color: '#1a1a1a', // 初始為深灰色
          unlockedColors: ['#1a1a1a'], // 初始只解鎖深灰色
    }, 
    position: { x: 0, y: 200 } 
  }
];
const defaultInitialEdges = [{ 
  id: 'e0-1', 
  source: '0', 
  target: '1', 
  type: 'default',
  animated: true 
}];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 獲取今天的日期字符串 (YYYY-MM-DD)
  const getTodayDateString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // 檢查是否跨過午夜並重置所有節點的 isDone
  const resetDailyCheckboxes = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'colorPicker') {
          return {
            ...node,
            data: {
              ...node.data,
              isDone: false,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 檢查日期差異並重置 checkbox
  const checkAndResetIfNewDay = useCallback(() => {
    const today = getTodayDateString();
    const lastOpenDate = localStorage.getItem(LAST_OPEN_DATE_KEY);

    // 如果沒有記錄或日期不同，重置所有 checkbox
    if (!lastOpenDate || lastOpenDate !== today) {
      resetDailyCheckboxes();
      localStorage.setItem(LAST_OPEN_DATE_KEY, today);
    }
  }, [getTodayDateString, resetDailyCheckboxes]);

  // 更新節點顏色（保留用於向後兼容）
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

  // 切換節點顏色（只能在已解鎖的顏色中選擇）
  const onColorSwitch = useCallback(
    (id, newColor) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const unlockedColors = node.data?.unlockedColors || ['#1a1a1a'];
            // 確保新顏色在已解鎖的顏色列表中
            if (unlockedColors.includes(newColor)) {
              return {
                ...node,
                data: { ...node.data, color: newColor },
              };
            }
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
            const today = new Date().toISOString().split('T')[0];
            const completedDays = node.data?.completedDays || [];
            let newCompletedDays;
            
            if (isDone) {
              // 如果勾選，添加今天的日期（如果還沒有）
              if (!completedDays.includes(today)) {
                newCompletedDays = [...completedDays, today];
              } else {
                newCompletedDays = completedDays;
              }
            } else {
              // 如果取消勾選，移除今天的日期
              newCompletedDays = completedDays.filter(date => date !== today);
            }
            
            // 計算新的完成天數
            const newCompletedDaysCount = newCompletedDays.length;
            
            // 計算已解鎖的顏色
            const newUnlockedColors = getUnlockedColors(newCompletedDaysCount);
            
            // 檢查是否達到新的里程碑（2^n）
            const oldCompletedDaysCount = completedDays.length;
            const oldUnlockedColors = getUnlockedColors(oldCompletedDaysCount);
            const reachedNewMilestone = newUnlockedColors.length > oldUnlockedColors.length;
            
            // 如果達到新里程碑，自動切換到最新解鎖的顏色
            let newColor = node.data?.color || '#1a1a1a';
            if (reachedNewMilestone && isDone) {
              newColor = getColorForMilestone(newCompletedDaysCount);
            }
            
            return {
              ...node,
              data: { 
                ...node.data, 
                isDone,
                completedDays: newCompletedDays,
                unlockedColors: newUnlockedColors,
                color: newColor,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 詳細按鈕點擊處理（使用函數式更新避免依賴 nodes）
  const onDetail = useCallback(
    (id) => {
      setNodes((nds) => {
        const node = nds.find((n) => n.id === id);
        if (node) {
          setSelectedNodeForEdit(node);
          setIsModalOpen(true);
        }
        return nds; // 不改變節點狀態
      });
    },
    [setNodes]
  );

  // 保存習慣詳情
  const onSaveHabitDetail = useCallback(
    (nodeId, formData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const completedDays = Array.isArray(formData.completedDays) 
              ? formData.completedDays 
              : [];
            const completedDaysCount = completedDays.length;
            const unlockedColors = getUnlockedColors(completedDaysCount);
            
            return {
              ...node,
              data: {
                ...node.data,
                habitName: formData.habitName,
                notes: formData.notes,
                optimizationRecord: formData.optimizationRecord,
                targetCount: formData.targetCount,
                completedDays: completedDays,
                unlockedColors: unlockedColors,
                // 如果完成天數有變化，更新 isDone 狀態（如果今天已完成）
                isDone: completedDays.includes(
                  new Date().toISOString().split('T')[0]
                ),
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 關閉 Modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedNodeForEdit(null);
  }, []);

  // 從 LocalStorage 嘗試讀取並初始化（只在組件掛載時運行一次）
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialNodes = defaultInitialNodes;
    let initialEdges = defaultInitialEdges;

    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        if (savedNodes && savedNodes.length > 0) {
          // 確保所有節點都有完整的數據結構
          initialNodes = savedNodes.map((node) => {
            if (node.type === 'colorPicker') {
              const completedDays = Array.isArray(node.data?.completedDays) 
                ? node.data.completedDays 
                : [];
              const completedDaysCount = completedDays.length;
              const unlockedColors = getUnlockedColors(completedDaysCount);
              const currentColor = node.data?.color || getColorForMilestone(completedDaysCount);
              
              return {
                ...node,
                data: {
                  // 保留現有數據
                  ...node.data,
                  // 確保所有新字段都有默認值
                  habitName: node.data?.habitName || node.data?.label || '',
                  isDone: node.data?.isDone ?? false,
                  notes: node.data?.notes || '',
                  optimizationRecord: node.data?.optimizationRecord || '',
                  targetCount: node.data?.targetCount ?? 0,
                  completedDays: completedDays,
                  unlockedColors: unlockedColors,
                  color: currentColor,
                },
              };
            }
            return node;
          });
        }
        if (savedEdges && savedEdges.length > 0) {
          initialEdges = savedEdges;
        }
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }

    // 檢查日期並重置 checkbox（如果需要）
    const today = getTodayDateString();
    const lastOpenDate = localStorage.getItem(LAST_OPEN_DATE_KEY);
    if (!lastOpenDate || lastOpenDate !== today) {
      // 重置所有節點的 isDone（但保留 unlockedColors）
      initialNodes = initialNodes.map((node) => {
        if (node.type === 'colorPicker') {
          return {
            ...node,
            data: {
              ...node.data,
              isDone: false,
            },
          };
        }
        return node;
      });
      localStorage.setItem(LAST_OPEN_DATE_KEY, today);
    }

    // 為初始節點添加回調函數並確保數據完整性（Function Re-binding）
    initialNodes = initialNodes.map((node) => {
      if (node.type === 'colorPicker') {
        const completedDays = Array.isArray(node.data?.completedDays) 
          ? node.data.completedDays 
          : [];
        const completedDaysCount = completedDays.length;
        const unlockedColors = node.data?.unlockedColors || getUnlockedColors(completedDaysCount);
        const currentColor = node.data?.color || getColorForMilestone(completedDaysCount);
        
        return {
          ...node,
          data: {
            // 保留所有現有數據
            ...node.data,
            // 確保所有字段都有值（防止讀取舊數據時缺少新字段）
            habitName: node.data?.habitName || node.data?.label || '',
            isDone: node.data?.isDone ?? false,
            notes: node.data?.notes || '',
            optimizationRecord: node.data?.optimizationRecord || '',
            targetCount: node.data?.targetCount ?? 0,
            completedDays: completedDays,
            unlockedColors: unlockedColors,
            color: currentColor,
            // 重新綁定所有回調函數（Function Re-binding）
            onChange: onColorChange,
            onDelete: onDeleteNode,
            onToggleDone: onToggleDone,
            onDetail: onDetail,
            onColorSwitch: onColorSwitch,
          },
        };
      }
      return node;
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
    isInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件掛載時運行一次

  // 每分鐘檢查一次是否跨過午夜
  useEffect(() => {
    // 立即檢查一次
    checkAndResetIfNewDay();

    // 設置每分鐘檢查一次的定時器
    const intervalId = setInterval(() => {
      checkAndResetIfNewDay();
    }, 60000); // 60000 毫秒 = 1 分鐘

    // 清理定時器
    return () => {
      clearInterval(intervalId);
    };
  }, [checkAndResetIfNewDay]);

  // 當回調函數改變時，更新所有節點的回調函數
  // 使用 useRef 來追蹤是否已經初始化，避免無限循環
  const isInitializedRef = React.useRef(false);
  const prevCallbacksRef = React.useRef({});
  
  useEffect(() => {
    // 檢查回調函數是否真的改變了
    const callbacksChanged = 
      prevCallbacksRef.current.onChange !== onColorChange ||
      prevCallbacksRef.current.onDelete !== onDeleteNode ||
      prevCallbacksRef.current.onToggleDone !== onToggleDone ||
      prevCallbacksRef.current.onDetail !== onDetail ||
      prevCallbacksRef.current.onColorSwitch !== onColorSwitch;
    
    // 只在初始化完成後且回調函數改變時才更新
    if (!isInitializedRef.current || !callbacksChanged) {
      prevCallbacksRef.current = {
        onChange: onColorChange,
        onDelete: onDeleteNode,
        onToggleDone: onToggleDone,
        onDetail: onDetail,
        onColorSwitch: onColorSwitch,
      };
      return;
    }
    
    setNodes((nds) => {
      if (nds.length === 0) return nds;
      
      return nds.map((node) => {
        if (node.type === 'colorPicker') {
          const completedDays = Array.isArray(node.data?.completedDays) 
            ? node.data.completedDays 
            : [];
          const completedDaysCount = completedDays.length;
          const unlockedColors = node.data?.unlockedColors || getUnlockedColors(completedDaysCount);
          
          return {
            ...node,
            data: {
              // 保留所有現有數據
              ...node.data,
              // 確保所有字段都有值
              habitName: node.data?.habitName || node.data?.label || '',
              isDone: node.data?.isDone ?? false,
              notes: node.data?.notes || '',
              optimizationRecord: node.data?.optimizationRecord || '',
              targetCount: node.data?.targetCount ?? 0,
              completedDays: completedDays,
              unlockedColors: unlockedColors,
              // 重新綁定所有回調函數（Function Re-binding）
              onChange: onColorChange,
              onDelete: onDeleteNode,
              onToggleDone: onToggleDone,
              onDetail: onDetail,
              onColorSwitch: onColorSwitch,
            },
          };
        }
        return node;
      });
    });
    
    prevCallbacksRef.current = {
      onChange: onColorChange,
      onDelete: onDeleteNode,
      onToggleDone: onToggleDone,
      onDetail: onDetail,
      onColorSwitch: onColorSwitch,
    };
  }, [onColorChange, onDeleteNode, onToggleDone, onDetail, onColorSwitch, setNodes]);

  // 自動保存節點和邊到本地儲存（清理函數引用）
  useEffect(() => {
    // 只在有節點或邊時才保存，避免初始化時覆蓋
    if (nodes.length === 0 && edges.length === 0) {
      return;
    }
    
    try {
      // 清理節點數據，移除函數引用以便序列化
      // 確保所有數據字段都被正確保存
      const cleanNodes = nodes.map((node) => {
        const { 
          onChange: _onChange, 
          onDelete: _onDelete, 
          onToggleDone: _onToggleDone,
          onDetail: _onDetail,
          onColorSwitch: _onColorSwitch,
          ...cleanData 
        } = node.data || {};
        
        const completedDays = Array.isArray(cleanData.completedDays) 
          ? cleanData.completedDays 
          : [];
        const completedDaysCount = completedDays.length;
        const unlockedColors = Array.isArray(cleanData.unlockedColors) 
          ? cleanData.unlockedColors 
          : getUnlockedColors(completedDaysCount);
        
        // 確保所有必要字段都存在（防止序列化時丟失）
        return {
          ...node,
          data: {
            // 保留所有數據字段
            ...cleanData,
            // 明確確保關鍵字段存在
            habitName: cleanData.habitName || cleanData.label || '',
            isDone: cleanData.isDone ?? false,
            notes: cleanData.notes || '',
            optimizationRecord: cleanData.optimizationRecord || '',
            targetCount: cleanData.targetCount ?? 0,
            completedDays: completedDays,
            unlockedColors: unlockedColors,
            color: cleanData.color || getColorForMilestone(completedDaysCount),
          },
        };
      });

      const dataToSave = { 
        nodes: cleanNodes, 
        edges
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      // 同時更新最後開啟日期
      localStorage.setItem(LAST_OPEN_DATE_KEY, getTodayDateString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [nodes, edges, getTodayDateString]);

  // 連接兩節點時新增一條邊
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 刪除邊的處理函數
  const onDeleteEdge = useCallback(
    (edgeId) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  // 監聽刪除邊的自定義事件
  useEffect(() => {
    const handleDeleteEdge = (event) => {
      const { edgeId } = event.detail;
      onDeleteEdge(edgeId);
    };

    window.addEventListener('deleteEdge', handleDeleteEdge);
    return () => {
      window.removeEventListener('deleteEdge', handleDeleteEdge);
    };
  }, [onDeleteEdge]);

  const addNewNode = useCallback(() => {
    setNodes((nds) => {
      const newNodeId = `node_${Date.now()}`;
      const newX = Math.random() * 800 - 400;
      const newY = Math.random() * 800 - 400;

      // 新節點初始為深灰色，只解鎖深灰色
      const initialUnlockedColors = ['#1a1a1a'];

      const newNode = {
        id: newNodeId, 
        type: 'colorPicker',
        data: {
          label: `NODE_${nds.length + 1}`,
          habitName: `習慣 ${nds.length + 1}`,
          isDone: false,
          notes: '',
          optimizationRecord: '',
          targetCount: 0,
          completedDays: [],
          color: '#1a1a1a', // 初始為深灰色
          unlockedColors: initialUnlockedColors,
          onChange: onColorChange,
          onDelete: onDeleteNode,
          onToggleDone: onToggleDone,
          onDetail: onDetail,
          onColorSwitch: onColorSwitch,
        },
        position: {
          x: newX,
          y: newY
        },
      };

      return nds.concat(newNode);
    });
  }, [onColorChange, onDeleteNode, onToggleDone, onDetail, onColorSwitch, setNodes]);

  // 手動存檔函數
  const handleManualSave = useCallback(() => {
      // 清理節點數據，移除函數引用以便序列化
      // 確保所有數據字段都被正確保存
      const cleanNodes = nodes.map((node) => {
        const { 
          onChange: _onChange, 
          onDelete: _onDelete, 
          onToggleDone: _onToggleDone,
          onDetail: _onDetail,
          onColorSwitch: _onColorSwitch,
          ...cleanData 
        } = node.data || {};
        
        const completedDays = Array.isArray(cleanData.completedDays) 
          ? cleanData.completedDays 
          : [];
        const completedDaysCount = completedDays.length;
        const unlockedColors = Array.isArray(cleanData.unlockedColors) 
          ? cleanData.unlockedColors 
          : getUnlockedColors(completedDaysCount);
        
        // 確保所有必要字段都存在（防止序列化時丟失）
        return {
          ...node,
          data: {
            // 保留所有數據字段
            ...cleanData,
            // 明確確保關鍵字段存在
            habitName: cleanData.habitName || cleanData.label || '',
            isDone: cleanData.isDone ?? false,
            notes: cleanData.notes || '',
            optimizationRecord: cleanData.optimizationRecord || '',
            targetCount: cleanData.targetCount ?? 0,
            completedDays: completedDays,
            unlockedColors: unlockedColors,
            color: cleanData.color || getColorForMilestone(completedDaysCount),
          },
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

  // 匯出 JSON 函數
  const handleExportJSON = useCallback(() => {
    try {
      // 清理節點數據，移除函數引用以便序列化
      const cleanNodes = nodes.map((node) => {
        const { 
          onChange: _onChange, 
          onDelete: _onDelete, 
          onToggleDone: _onToggleDone,
          onDetail: _onDetail,
          onColorSwitch: _onColorSwitch,
          ...cleanData 
        } = node.data || {};
        
        const completedDays = Array.isArray(cleanData.completedDays) 
          ? cleanData.completedDays 
          : [];
        const completedDaysCount = completedDays.length;
        const unlockedColors = Array.isArray(cleanData.unlockedColors) 
          ? cleanData.unlockedColors 
          : getUnlockedColors(completedDaysCount);
        
        return {
          ...node,
          data: {
            ...cleanData,
            habitName: cleanData.habitName || cleanData.label || '',
            isDone: cleanData.isDone ?? false,
            notes: cleanData.notes || '',
            optimizationRecord: cleanData.optimizationRecord || '',
            targetCount: cleanData.targetCount ?? 0,
            completedDays: completedDays,
            unlockedColors: unlockedColors,
            color: cleanData.color || getColorForMilestone(completedDaysCount),
          },
        };
      });

      const dataToExport = { 
        nodes: cleanNodes, 
        edges,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `entropy-grid-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('匯出失敗！');
    }
  }, [nodes, edges]);

  // 導入 JSON 函數
  const handleImportJSON = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.nodes || !Array.isArray(importedData.nodes)) {
          alert('無效的 JSON 文件格式！');
          return;
        }

        // 確認導入
        if (!window.confirm('導入數據將覆蓋現有數據，確定要繼續嗎？')) {
          event.target.value = ''; // 重置文件輸入
          return;
        }

        // 處理導入的節點數據
        const importedNodes = importedData.nodes.map((node) => {
          if (node.type === 'colorPicker') {
            const completedDays = Array.isArray(node.data?.completedDays) 
              ? node.data.completedDays 
              : [];
            const completedDaysCount = completedDays.length;
            const unlockedColors = Array.isArray(node.data?.unlockedColors) 
              ? node.data.unlockedColors 
              : getUnlockedColors(completedDaysCount);
            const currentColor = node.data?.color || getColorForMilestone(completedDaysCount);
            
            return {
              ...node,
              data: {
                ...node.data,
                habitName: node.data?.habitName || node.data?.label || '',
                isDone: node.data?.isDone ?? false,
                notes: node.data?.notes || '',
                optimizationRecord: node.data?.optimizationRecord || '',
                targetCount: node.data?.targetCount ?? 0,
                completedDays: completedDays,
                unlockedColors: unlockedColors,
                color: currentColor,
                // 重新綁定回調函數
                onChange: onColorChange,
                onDelete: onDeleteNode,
                onToggleDone: onToggleDone,
                onDetail: onDetail,
                onColorSwitch: onColorSwitch,
              },
            };
          }
          return node;
        });

        const importedEdges = Array.isArray(importedData.edges) ? importedData.edges : [];

        // 更新節點和邊
        setNodes(importedNodes);
        setEdges(importedEdges);

        // 同時保存到 LocalStorage
        const cleanNodes = importedNodes.map((node) => {
          const { 
            onChange: _onChange, 
            onDelete: _onDelete, 
            onToggleDone: _onToggleDone,
            onDetail: _onDetail,
            onColorSwitch: _onColorSwitch,
            ...cleanData 
          } = node.data || {};
          
          return {
            ...node,
            data: cleanData,
          };
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          nodes: cleanNodes, 
          edges: importedEdges 
        }));

        alert('導入成功！');
        // 導入成功後關閉設定 modal
        setIsSettingsModalOpen(false);
      } catch (error) {
        console.error('Failed to import:', error);
        alert('導入失敗！請檢查 JSON 文件格式是否正確。');
      }
    };

    reader.onerror = () => {
      alert('讀取文件失敗！');
    };

    reader.readAsText(file);
    event.target.value = ''; // 重置文件輸入，允許重新選擇同一文件
  }, [onColorChange, onDeleteNode, onToggleDone, onDetail, onColorSwitch, setNodes, setEdges]);

  // 清除網站資料函數
  const handleClearSiteData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_OPEN_DATE_KEY);
      // 重置為默認節點和邊
      setNodes(defaultInitialNodes.map((node) => {
        if (node.type === 'colorPicker') {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: onColorChange,
              onDelete: onDeleteNode,
              onToggleDone: onToggleDone,
              onDetail: onDetail,
              onColorSwitch: onColorSwitch,
            },
          };
        }
        return node;
      }));
      setEdges(defaultInitialEdges);
      alert('網站資料已清除！');
    } catch (error) {
      console.error('Failed to clear site data:', error);
      alert('清除失敗！');
    }
  }, [onColorChange, onDeleteNode, onToggleDone, onDetail, onColorSwitch, setNodes, setEdges]);

  // 關閉設定 Modal
  const handleCloseSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

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
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        connectionMode="loose"
        defaultEdgeOptions={{ 
          type: 'default',
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
              ADD NODE
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
              SAVE
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
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
              SETTINGS
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

      {/* 習慣詳情 Modal */}
      <HabitDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        node={selectedNodeForEdit}
        onSave={onSaveHabitDetail}
      />

      {/* 設定 Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onClearSiteData={handleClearSiteData}
      />
    </div>
  );
}