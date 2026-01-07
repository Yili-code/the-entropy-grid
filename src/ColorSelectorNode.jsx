import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// 將顏色轉換為霓虹色調（用於發光效果）
const convertToNeon = (color) => {
  if (!color) return '#00f3ff';
  // 如果已經是霓虹色，直接返回
  const neonColors = ['#ff007f', '#00f3ff', '#ffd700', '#00ff00', '#ff4500', '#ff1493', '#00ced1', '#9370db', '#ff00ff'];
  if (neonColors.includes(color.toLowerCase())) {
    return color;
  }
  // 深灰色使用青色發光
  if (color.toLowerCase() === '#1a1a1a') {
    return '#00f3ff';
  }
  // 將其他顏色轉換為對應的霓虹色
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 根據主要顏色通道選擇霓虹色
  if (r > g && r > b) return '#ff007f'; // 偏紅 -> 霓虹粉
  if (b > r && b > g) return '#00f3ff'; // 偏藍 -> 霓虹青
  if (g > r && g > b) return '#00ff00'; // 偏綠 -> 霓虹綠
  return '#00f3ff'; // 默認 -> 霓虹青
};

// 自定義節點組件
const ColorSelectorNode = ({ id, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // 節點首次渲染時顯示故障效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setIsGlitching(false);
      }, 300);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  
  const neonColor = convertToNeon(data.color);
  const unlockedColors = data.unlockedColors || ['#1a1a1a'];
  
  // 計算發光強度
  const glowIntensity = isHovered ? 1.5 : 1;
  const glowColor = neonColor;
  
  // 掃描線紋理背景
  const scanlineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 243, 255, 0.03) 2px,
        rgba(0, 243, 255, 0.03) 4px
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.02) 0%,
        transparent 70%
      )
    `,
    pointerEvents: 'none',
    mixBlendMode: 'overlay',
  };

  return (
    <div 
      className={isGlitching ? 'cyberpunk-node glitch' : 'cyberpunk-node'}
      style={{ 
        background: 'rgba(10, 10, 10, 0.95)',
        padding: '16px', 
        borderRadius: '0', 
        border: `2px solid ${glowColor}`,
        minWidth: '200px',
        position: 'relative',
        boxShadow: `
          0 0 ${10 * glowIntensity}px ${glowColor},
          0 0 ${20 * glowIntensity}px ${glowColor},
          inset 0 0 ${10 * glowIntensity}px ${glowColor}40
        `,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        animation: isHovered ? 'pulse-glow 2s ease-in-out infinite' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 掃描線紋理 */}
      <div style={scanlineStyle} />
      
      {/* 噪點紋理 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")
        `,
        pointerEvents: 'none',
        mixBlendMode: 'overlay',
      }} />
      
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Top} id="top-source" />
      
      
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
      
      
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      
     
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      
      {/* 左上角：已解鎖顏色列表（縱向排列） */}
      <div
        className="nodrag"
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 10,
        }}
      >
        {unlockedColors.map((color, index) => {
          const isSelected = color === data.color;
          const colorGlow = convertToNeon(color);
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (data.onColorSwitch) {
                  data.onColorSwitch(id, color);
                }
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '0',
                border: `2px solid ${isSelected ? colorGlow : 'rgba(255, 255, 255, 0.2)'}`,
                background: color,
                cursor: 'pointer',
                boxShadow: isSelected
                  ? `0 0 10px ${colorGlow}, inset 0 0 8px ${colorGlow}40`
                  : `0 0 3px ${colorGlow}20`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.2)';
                e.target.style.boxShadow = `0 0 15px ${colorGlow}, inset 0 0 10px ${colorGlow}60`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = isSelected
                  ? `0 0 10px ${colorGlow}, inset 0 0 8px ${colorGlow}40`
                  : `0 0 3px ${colorGlow}20`;
              }}
              title={color}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: colorGlow,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textShadow: `0 0 8px ${colorGlow}`,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {data.onDelete && (
      <button
        onClick={() => {
          setIsGlitching(true);
          setTimeout(() => {
            data.onDelete(id);
          }, 300);
        }}
        className="nodrag cyberpunk-delete"
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: 'rgba(10, 10, 10, 0.9)',
          color: '#ff007f',
          border: '1px solid #ff007f',
          borderRadius: '0',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(255, 0, 127, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.2)';
          e.target.style.boxShadow = '0 0 20px rgba(255, 0, 127, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 0 10px rgba(255, 0, 127, 0.5)';
        }}
      >
        ×
      </button>
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        alignItems: 'center',
      }}>
        {/* 頂部：習慣名稱 */}
        <strong style={{
          color: glowColor,
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '1px',
          textShadow: `0 0 10px ${glowColor}`,
          textTransform: 'uppercase',
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {data.habitName || data.label || 'UNNAMED'}
        </strong>
        
        {/* 中間：Checkbox */}
        <input 
          type="checkbox" 
          checked={data.isDone || false}
          onChange={(evt) => {
            if (data.onToggleDone) {
              data.onToggleDone(id, evt.target.checked);
            }
          }}
          className="nodrag"
          style={{
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            accentColor: glowColor,
            filter: `drop-shadow(0 0 8px ${glowColor})`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.3)';
            e.target.style.filter = `drop-shadow(0 0 15px ${glowColor})`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.filter = `drop-shadow(0 0 8px ${glowColor})`;
          }}
        />
        
        {/* 底部：三條橫線（可點擊查看詳情） */}
        <button
          onClick={() => {
            if (data.onDetail) {
              data.onDetail(id);
            }
          }}
          className="nodrag"
          style={{
            padding: '8px',
            borderRadius: '0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          {/* 三條橫線 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            alignItems: 'center',
          }}>
            <div style={{
              width: '20px',
              height: '2px',
              background: glowColor,
              boxShadow: `0 0 5px ${glowColor}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            <div style={{
              width: '20px',
              height: '2px',
              background: glowColor,
              boxShadow: `0 0 5px ${glowColor}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            <div style={{
              width: '20px',
              height: '2px',
              background: glowColor,
              boxShadow: `0 0 5px ${glowColor}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ColorSelectorNode;
