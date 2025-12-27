import React from 'react';

const Folder = ({ size = 2, color = "#5227FF", className = "" }) => {
  const sizeMap = {
    1: { width: 24, height: 20 },
    2: { width: 32, height: 26 },
    3: { width: 40, height: 32 },
    4: { width: 48, height: 38 },
    5: { width: 56, height: 44 }
  };

  const dimensions = sizeMap[size] || sizeMap[2];

  return (
    <div className={`folder-container ${className}`} style={{ position: 'relative' }}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 32 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`,
          animation: 'folderFloat 3s ease-in-out infinite'
        }}
      >
        {/* 文件夾主體 */}
        <path
          d="M2 4C2 2.89543 2.89543 2 4 2H12L14 4H28C29.1046 4 30 4.89543 30 6V22C30 23.1046 29.1046 24 28 24H4C2.89543 24 2 23.1046 2 22V4Z"
          fill={color}
          stroke="#000"
          strokeWidth="1"
        />
        
        {/* 文件夾標籤 */}
        <rect
          x="4"
          y="2"
          width="8"
          height="2"
          fill={color}
          stroke="#000"
          strokeWidth="0.5"
        />
        
        {/* 文件夾折疊線 */}
        <path
          d="M4 4L28 4"
          stroke="#000"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
      
      <style>{`
        @keyframes folderFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-2px) rotate(1deg);
          }
          50% {
            transform: translateY(-4px) rotate(0deg);
          }
          75% {
            transform: translateY(-2px) rotate(-1deg);
          }
        }
        
        .folder-container {
          display: inline-block;
          transition: transform 0.3s ease;
        }
        
        .folder-container:hover {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>
    </div>
  );
};

export default Folder;
