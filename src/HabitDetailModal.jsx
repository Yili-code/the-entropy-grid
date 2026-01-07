import React, { useState, useEffect } from 'react';

const HabitDetailModal = ({ isOpen, onClose, node, onSave }) => {
  const [formData, setFormData] = useState({
    habitName: '',
    notes: '',
    optimizationRecord: '',
    targetCount: 0,
    completedDays: [],
  });

  // 當節點數據改變時更新表單
  useEffect(() => {
    if (!node) return;
    
    // 使用 setTimeout 來避免同步 setState 問題
    const timer = setTimeout(() => {
      setFormData({
        habitName: node.data?.habitName || node.data?.label || '',
        notes: node.data?.notes || '',
        optimizationRecord: node.data?.optimizationRecord || '',
        targetCount: node.data?.targetCount || 0,
        completedDays: node.data?.completedDays || [],
      });
    }, 0);
    
    return () => clearTimeout(timer);
  }, [node]);

  if (!isOpen || !node) return null;

  // 計算已完成天數
  const totalCompletedDays = formData.completedDays.length;
  
  // 計算本月已完成天數
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthCompleted = formData.completedDays.filter(dateStr => {
    const date = new Date(dateStr);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  // 生成本月日曆視圖（30天）
  const daysInMonth = 30;
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCompleted = formData.completedDays.includes(dateStr);
    return { day, dateStr, isCompleted };
  });

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const neonColor = node.data?.color || '#00f3ff';
  const glowColor = ['#ff007f', '#00f3ff', '#bc13fe'].includes(neonColor.toLowerCase()) 
    ? neonColor 
    : '#00f3ff';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: `2px solid ${glowColor}`,
          padding: '24px',
          minWidth: '500px',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px ${glowColor}40`,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: `1px solid ${glowColor}40`,
          paddingBottom: '12px',
        }}>
          <h2 style={{
            color: glowColor,
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '2px',
            textShadow: `0 0 10px ${glowColor}`,
            textTransform: 'uppercase',
          }}>
            習慣詳情
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${glowColor}`,
              color: glowColor,
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 10px ${glowColor}40`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = `0 0 20px ${glowColor}`;
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = `0 0 10px ${glowColor}40`;
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>

        {/* 表單內容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 習慣名稱 */}
          <div>
            <label style={{
              display: 'block',
              color: glowColor,
              fontSize: '12px',
              marginBottom: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              習慣名稱
            </label>
            <input
              type="text"
              value={formData.habitName}
              onChange={(e) => handleInputChange('habitName', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(10, 10, 10, 0.8)',
                border: `1px solid ${glowColor}`,
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                boxShadow: `0 0 10px ${glowColor}40`,
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 15px ${glowColor}`;
                e.target.style.borderColor = glowColor;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = `0 0 10px ${glowColor}40`;
              }}
            />
          </div>

          {/* 目標次數 */}
          <div>
            <label style={{
              display: 'block',
              color: glowColor,
              fontSize: '12px',
              marginBottom: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              目標次數
            </label>
            <input
              type="number"
              value={formData.targetCount}
              onChange={(e) => handleInputChange('targetCount', parseInt(e.target.value) || 0)}
              min="0"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(10, 10, 10, 0.8)',
                border: `1px solid ${glowColor}`,
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                boxShadow: `0 0 10px ${glowColor}40`,
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 15px ${glowColor}`;
                e.target.style.borderColor = glowColor;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = `0 0 10px ${glowColor}40`;
              }}
            />
          </div>

          {/* 統計信息 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(10, 10, 10, 0.6)',
              border: `1px solid ${glowColor}40`,
            }}>
              <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>總完成天數</div>
              <div style={{ color: glowColor, fontSize: '20px', fontWeight: '600' }}>
                {totalCompletedDays}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(10, 10, 10, 0.6)',
              border: `1px solid ${glowColor}40`,
            }}>
              <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>本月完成</div>
              <div style={{ color: glowColor, fontSize: '20px', fontWeight: '600' }}>
                {thisMonthCompleted}
              </div>
            </div>
          </div>

          {/* 本月可視化圖表 */}
          <div>
            <label style={{
              display: 'block',
              color: glowColor,
              fontSize: '12px',
              marginBottom: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              本月完成情況
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '4px',
            }}>
              {monthDays.map(({ day, isCompleted }) => (
                <div
                  key={day}
                  style={{
                    aspectRatio: '1',
                    background: isCompleted 
                      ? glowColor 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${isCompleted ? glowColor : 'rgba(255, 255, 255, 0.2)'}`,
                    boxShadow: isCompleted ? `0 0 5px ${glowColor}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: isCompleted ? '#000' : '#888',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const newCompletedDays = isCompleted
                      ? formData.completedDays.filter(d => d !== dateStr)
                      : [...formData.completedDays, dateStr];
                    handleInputChange('completedDays', newCompletedDays);
                  }}
                  onMouseEnter={(e) => {
                    if (!isCompleted) {
                      e.target.style.background = glowColor + '40';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCompleted) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* 自我優化紀錄 */}
          <div>
            <label style={{
              display: 'block',
              color: glowColor,
              fontSize: '12px',
              marginBottom: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              自我優化紀錄
            </label>
            <textarea
              value={formData.optimizationRecord}
              onChange={(e) => handleInputChange('optimizationRecord', e.target.value)}
              placeholder="記錄為什麼失敗、如何改進..."
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(10, 10, 10, 0.8)',
                border: `1px solid ${glowColor}`,
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                boxShadow: `0 0 10px ${glowColor}40`,
                outline: 'none',
                resize: 'vertical',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 15px ${glowColor}`;
                e.target.style.borderColor = glowColor;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = `0 0 10px ${glowColor}40`;
              }}
            />
          </div>

          {/* 備註 */}
          <div>
            <label style={{
              display: 'block',
              color: glowColor,
              fontSize: '12px',
              marginBottom: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              備註
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="其他備註..."
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(10, 10, 10, 0.8)',
                border: `1px solid ${glowColor}`,
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                boxShadow: `0 0 10px ${glowColor}40`,
                outline: 'none',
                resize: 'vertical',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 15px ${glowColor}`;
                e.target.style.borderColor = glowColor;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = `0 0 10px ${glowColor}40`;
              }}
            />
          </div>
        </div>

        {/* 按鈕 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'rgba(10, 10, 10, 0.8)',
              border: `1px solid ${glowColor}40`,
              color: glowColor,
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = glowColor;
              e.target.style.boxShadow = `0 0 10px ${glowColor}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = `${glowColor}40`;
              e.target.style.boxShadow = 'none';
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: glowColor,
              border: `1px solid ${glowColor}`,
              color: '#000',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: `0 0 15px ${glowColor}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = `0 0 25px ${glowColor}`;
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = `0 0 15px ${glowColor}`;
              e.target.style.transform = 'scale(1)';
            }}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitDetailModal;

