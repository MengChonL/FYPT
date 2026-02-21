import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const SlideConfirmButton = ({ text = 'SLIDE TO CONTINUE', onConfirm, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const sliderRef = useRef(null);
  const x = useMotionValue(0);
  const thumbWidth = 60;

  // 計算最大拖動距離
  const getMaxX = () => {
    if (!trackRef.current) return 0;
    return trackRef.current.offsetWidth - thumbWidth;
  };

  // 將 x 位置轉換為進度百分比（使用 useEffect 來更新進度）
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    const unsubscribe = x.on('change', (latest) => {
      const maxX = getMaxX();
      if (maxX <= 0) {
        setProgressValue(0);
        return;
      }
      const progress = Math.max(0, Math.min(100, (latest / maxX) * 100));
      setProgressValue(progress);
    });
    return unsubscribe;
  }, [x]);

  const handleDragStart = () => {
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    if (disabled) return;
    setIsDragging(false);
    
    const maxX = getMaxX();
    const threshold = 0.85; // 85% 才觸發確認
    const currentX = x.get();
    
    if (currentX >= maxX * threshold) {
      // 觸發確認 - 動畫到最右邊
      x.set(maxX);
      if (onConfirm) {
        setTimeout(() => {
          onConfirm();
          // 重置位置
          setTimeout(() => {
            x.set(0);
          }, 300);
        }, 200);
      }
    } else {
      // 回彈到起始位置
      x.set(0);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={trackRef}
        className="relative w-full h-14 bg-gray-700 rounded-full overflow-hidden"
      >
        {/* 背景進度條 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
          style={{
            width: `${progressValue}%`,
            transition: isDragging ? 'none' : 'width 0.3s ease-out'
          }}
        />
        
        {/* 文字 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-white font-semibold text-sm tracking-wide select-none">
            {text}
          </span>
        </div>

        {/* 滑塊 */}
        <motion.div
          ref={sliderRef}
          className="absolute left-0 top-0 h-14 w-[60px] bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing z-20 flex items-center justify-center"
          drag="x"
          dragConstraints={trackRef}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          style={{ x }}
        >
          {/* 滑塊圖標 */}
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default SlideConfirmButton;

