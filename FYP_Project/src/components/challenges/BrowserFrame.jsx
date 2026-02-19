import React from 'react';

const BrowserFrame = ({ 
  children, 
  url = 'http://example.com',
  urlColor = '#ffffff',
  showControls = true,
  tabs = null, 
  className = "", // 新增：允許外部傳入 class 來控制大小
  contentPadding = false // 新增：是否為內容區域添加 padding
}) => {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`} // 設為 flex column 且允許外部控制寬高
      style={{
        backgroundColor: '#1a1a1a', // 邊框顏色
        border: '8px solid #000000',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.6)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. 瀏覽器頂部控制列 (Address Bar) */}
      {showControls && (
        <div 
          className="flex-none flex items-center justify-between p-3 border-b-4 border-black z-20 relative"
          style={{ backgroundColor: '#2d2d2d' }}
        >
          <div className="flex items-center gap-4 w-full">
            {/* 紅黃綠按鈕 */}
            <div className="flex gap-2 flex-none">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-black/20"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-black/20"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-black/20"></div>
            </div>
            
            {/* 地址欄 (自適應寬度) */}
            <div 
              className="px-4 py-2 rounded-lg flex-1 flex items-center shadow-inner"
              style={{ 
                backgroundColor: '#1a1a1a',
                border: '2px solid #000000',
                color: urlColor,
              }}
            >
              <span className="text-gray-500 mr-2 text-xs">🔒</span>
              <span className="text-sm font-mono truncate">{url}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. 分頁列區域 (Tabs) - 設為 flex-none 防止被壓縮 */}
      {tabs && (
        <div className="flex-none bg-[#dfe1e5] border-b border-gray-300 pt-2 px-2 z-10">
          {tabs}
        </div>
      )}

      {/* 3. 內容區域 (Content) - 設為 flex-1 自動填滿剩餘高度，並允許內部滾動 */}
      <div className={`flex-1 bg-white relative overflow-y-auto overflow-x-hidden ${contentPadding ? 'p-6' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default BrowserFrame;