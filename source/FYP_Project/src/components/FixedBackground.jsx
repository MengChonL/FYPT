import React, { useMemo } from 'react';

const FixedBackground = () => {
  // 使用 useMemo 來固定背景像素點，避免重新渲染
  const backgroundPixels = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
  }, []); // 空依賴數組確保只創建一次

  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      {backgroundPixels.map((pixel) => (
        <div
          key={pixel.id}
          className="absolute bg-blue-400 rounded-full animate-pixel-twinkle"
          style={{
            width: `${pixel.size}px`,
            height: `${pixel.size}px`,
            top: `${pixel.top}%`,
            left: `${pixel.left}%`,
            animationDelay: `${pixel.delay}s`,
            animationDuration: `${pixel.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default FixedBackground;
