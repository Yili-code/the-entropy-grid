import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// 將顏色轉換為霓虹色調
const convertToNeon = (color) => {
  if (!color) return '#00f3ff';
  // 如果已經是霓虹色，直接返回
  if (['#ff007f', '#00f3ff', '#bc13fe'].includes(color.toLowerCase())) {
    return color;
  }
  // 將其他顏色轉換為對應的霓虹色
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 根據主要顏色通道選擇霓虹色
  if (r > g && r > b) return '#ff007f'; // 偏紅 -> 霓虹粉
  if (b > r && b > g) return '#00f3ff'; // 偏藍 -> 霓虹青
  return '#bc13fe'; // 其他 -> 霓虹紫
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
        minWidth: '140px',
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
        gap: '12px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <strong style={{
          color: glowColor,
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '2px',
          textShadow: `0 0 10px ${glowColor}`,
          textTransform: 'uppercase',
        }}>
          {data.label}
        </strong>
        <div style={{
          position: 'relative',
          display: 'inline-block',
        }}>
          <input 
            type="color" 
            defaultValue={data.color}
            onChange={(evt) => data.onChange(id, evt.target.value)}
            className="nodrag"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '0',
              border: `2px solid ${glowColor}`,
              cursor: 'pointer',
              boxShadow: `0 0 15px ${glowColor}80`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              WebkitAppearance: 'none',
              appearance: 'none',
              background: 'rgba(10, 10, 10, 0.8)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = `0 0 25px ${glowColor}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = `0 0 15px ${glowColor}80`;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorSelectorNode;
