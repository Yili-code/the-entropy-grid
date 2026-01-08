import React, { useRef } from 'react';

const SettingsModal = ({ isOpen, onClose, onExportJSON, onImportJSON, onClearSiteData }) => {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const glowColor = '#00f3ff';

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearData = () => {
    if (window.confirm('確定要清除所有網站資料嗎？此操作無法復原！')) {
      onClearSiteData();
      onClose();
    }
  };

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
          maxWidth: '600px',
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
            ⚙️ Settings
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

        {/* 設定選項 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 資料管理區塊 */}
          <div>
            <h3 style={{
              color: glowColor,
              fontSize: '14px',
              marginBottom: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              borderBottom: `1px solid ${glowColor}20`,
              paddingBottom: '8px',
            }}>
              Data Management
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Export JSON 按鈕 */}
              <button
                onClick={() => {
                  onExportJSON();
                  onClose();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '0',
                  background: 'rgba(10, 10, 10, 0.8)',
                  color: '#bc13fe',
                  border: '1px solid #ffffff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  boxShadow: '0 0 10px rgba(188, 19, 254, 0.5), inset 0 0 10px rgba(188, 19, 254, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(10px)',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(188, 19, 254, 0.8), inset 0 0 20px rgba(188, 19, 254, 0.2)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 0 10px rgba(188, 19, 254, 0.5), inset 0 0 10px rgba(188, 19, 254, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                📤 Export Data
              </button>

              {/* Import JSON 按鈕 */}
              <button
                onClick={handleImportClick}
                style={{
                  padding: '12px 24px',
                  borderRadius: '0',
                  background: 'rgba(10, 10, 10, 0.8)',
                  color: '#ff007f',
                  border: '1px solid #ffffff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  boxShadow: '0 0 10px rgba(255, 0, 127, 0.5), inset 0 0 10px rgba(255, 0, 127, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(10px)',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(255, 0, 127, 0.8), inset 0 0 20px rgba(255, 0, 127, 0.2)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 0 10px rgba(255, 0, 127, 0.5), inset 0 0 10px rgba(255, 0, 127, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                📥 Import Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={onImportJSON}
                style={{ display: 'none' }}
              />

              {/* Clear Site Data 按鈕 */}
              <button
                onClick={handleClearData}
                style={{
                  padding: '12px 24px',
                  borderRadius: '0',
                  background: 'rgba(10, 10, 10, 0.8)',
                  color: '#ff4500',
                  border: '1px solid #ffffff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  boxShadow: '0 0 10px rgba(255, 69, 0, 0.5), inset 0 0 10px rgba(255, 69, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(10px)',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(255, 69, 0, 0.8), inset 0 0 20px rgba(255, 69, 0, 0.2)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 0 10px rgba(255, 69, 0, 0.5), inset 0 0 10px rgba(255, 69, 0, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                🗑️ Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* 關閉按鈕 */}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
