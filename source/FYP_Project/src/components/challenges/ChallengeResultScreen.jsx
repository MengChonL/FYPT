import React from 'react';
import { motion } from 'framer-motion';

/**
 * 挑战结果页面组件 - 像素风格设计
 * 可用于显示成功或失败的结果
 * 
 * @param {Object} props
 * @param {boolean} props.isSuccess - 是否成功
 * @param {string} props.title - 关卡标题（如"唯一之跡，無擾無疑"）
 * @param {string} props.description - 任务描述
 * @param {string} props.successMessage - 成功时的主标题
 * @param {string} props.failureMessage - 失败时的主标题
 * @param {string} props.successExplanation - 成功说明文字
 * @param {string} props.failureExplanation - 失败说明文字
 * @param {string} props.successSubtitle - 成功时的副标题（默认："恭喜完成任務"）
 * @param {string} props.retryButtonText - 重试按钮文本（默认："重試"）
 * @param {string} props.nextLevelButtonText - 下一关按钮文本（默认："下一關"）
 * @param {Array} props.checkItems - 检查项目数组 [{label: string, value: string, isCorrect: boolean, showValue: boolean, details: ReactNode}]
 * @param {Function} props.onRetry - 重试按钮点击事件（仅失败时显示）
 * @param {Function} props.onNextLevel - 下一关按钮点击事件（成功和失败时都显示）
 * @param {Object} props.customStyles - 自定义样式
 */
const ChallengeResultScreen = ({
  isSuccess = false,
  title = "",
  description = "",
  successMessage = "挑戰成功！",
  failureMessage = "挑戰失敗！",
  successExplanation = "恭喜！你成功完成了挑戰。",
  failureExplanation = "請檢查以下項目：",
  successSubtitle = "恭喜完成任務",
  retryButtonText = "重試",
  nextLevelButtonText = "下一關",
  checkItems = [],
  onRetry = null,
  onNextLevel = null,
  customStyles = {}
}) => {
  const themeColor = isSuccess ? '#22c55e' : '#ef4444';
  const themeBgColor = isSuccess ? 'green' : 'red';
  const themeColorRgb = isSuccess ? '34, 197, 94' : '239, 68, 68';

  // 像素化的勾图标组件
  const PixelCheckmark = ({ size = 24, color = "#22c55e" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="12" width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
      <rect x={size > 24 ? "6" : "5"} y={size > 24 ? "15" : "14"} width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
      <rect x={size > 24 ? "9" : "7"} y={size > 24 ? "18" : "16"} width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
      <rect x={size > 24 ? "12" : "9"} y={size > 24 ? "15" : "14"} width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
      <rect x={size > 24 ? "15" : "11"} y="12" width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
      <rect x={size > 24 ? "18" : "13"} y={size > 24 ? "9" : "10"} width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
      <rect x={size > 24 ? "21" : "15"} y={size > 24 ? "6" : "8"} width={size > 24 ? "3" : "2"} height={size > 24 ? "3" : "2"} fill={color}/>
    </svg>
  );

  // 像素化的X图标组件
  const PixelCross = ({ size = 24, color = "#ef4444" }) => {
    const scale = size / 24;
    const pixelSize = size > 24 ? 3 : 2;
    
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 左上到右下的对角线 */}
        <rect x="6" y="6" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="9" y="9" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="12" y="12" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="15" y="15" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="18" y="18" width={pixelSize} height={pixelSize} fill={color}/>
        
        {/* 右上到左下的对角线 */}
        <rect x="18" y="6" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="15" y="9" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="9" y="15" width={pixelSize} height={pixelSize} fill={color}/>
        <rect x="6" y="18" width={pixelSize} height={pixelSize} fill={color}/>
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        backgroundColor: '#111827', // 統一背景色 (gray-900)
      }}
    >
      <div 
        className="relative w-full h-full pixel-font text-white" 
        style={{ 
          width: '100vw',
          height: '100vh',
          backgroundColor: '#111827', // 統一背景色 (gray-900)
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
          overflowY: 'auto',
          overflowX: 'hidden',
          ...customStyles.container,
        }}
      >
        {/* 装饰性圆圈和线条 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <filter id={isSuccess ? "glowGreen" : "glow"}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {isSuccess ? (
            // 成功时的绿色圆圈装饰
            <>
              <circle cx="20%" cy="35%" r="80" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="5,5" filter="url(#glowGreen)" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80%" cy="55%" r="100" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="5,5" filter="url(#glowGreen)" opacity="0.5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="90%" cy="15%" r="40" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.2"/>
              <circle cx="10%" cy="85%" r="50" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.2"/>
              <circle cx="85%" cy="88%" r="50" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.15"/>
              <path d="M 10% 30% Q 50% 20%, 90% 25%" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.3" filter="url(#glowGreen)"/>
              <path d="M 15% 70% Q 50% 75%, 85% 68%" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.3" filter="url(#glowGreen)"/>
            </>
          ) : (
            // 失败时的红色圆圈标注和跑马灯效果
            <>
              {/* 跑马灯装饰圆圈 - 与成功界面类似的动画效果 */}
              <circle cx="20%" cy="35%" r="80" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" filter="url(#glow)" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80%" cy="55%" r="100" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" filter="url(#glow)" opacity="0.5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="90%" cy="15%" r="40" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.2"/>
              <circle cx="10%" cy="85%" r="50" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.2"/>
              <circle cx="85%" cy="88%" r="50" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.15"/>
              <path d="M 10% 30% Q 50% 20%, 90% 25%" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.3" filter="url(#glow)">
                <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite"/>
              </path>
              <path d="M 15% 70% Q 50% 75%, 85% 68%" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.3" filter="url(#glow)">
                <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2.5s" repeatCount="indefinite"/>
              </path>
              {/* 原有的错误项目标注 */}
              {checkItems.map((item, index) => {
                if (item.isCorrect) return null;
                const yPosition = 30 + (index * 17);
                const radiusY = 10 - (index * 0.5);
                return (
                  <g key={index}>
                    <ellipse 
                      cx="20%" 
                      cy={`${yPosition}%`} 
                      rx="15%" 
                      ry={`${radiusY}%`} 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="3" 
                      strokeDasharray="5,5" 
                      filter="url(#glow)" 
                      opacity="0.8"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                    </ellipse>
                    <path 
                      d={`M 35% ${yPosition}% Q 50% ${yPosition - 3}%, 70% ${yPosition}%`} 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="2" 
                      filter="url(#glow)" 
                      opacity="0.8"
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* 内容区域 */}
        <div className="relative" style={{ zIndex: 2, paddingTop: '80px' }}>
          {/* 关卡信息顶部 */}
          {title && (
            <div className="text-white py-8 px-12" style={{ backgroundColor: '#111827', borderBottom: '2px solid #374151' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold ${isSuccess ? 'text-green-400' : 'text-blue-400'}`}>
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xl text-gray-300 mt-3">{description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success/Failure Banner */}
          <div 
            className={`text-white py-12 px-12 flex items-center justify-center gap-6 border-b-4`}
            style={{
              backgroundColor: isSuccess ? '#16a34a' : '#dc2626',
              borderBottomColor: isSuccess ? '#15803d' : '#991b1b'
            }}
          >
            <div className="w-16 h-16 flex items-center justify-center">
              {isSuccess ? (
                <PixelCheckmark size={60} color="white" />
              ) : (
                <PixelCross size={60} color="white" />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                {isSuccess ? successMessage : failureMessage}
              </h2>
              <p className="text-xl md:text-2xl opacity-90">
                {isSuccess ? successSubtitle : failureExplanation}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div 
            className="p-12 space-y-10 flex flex-col items-center justify-center" 
            style={{ 
              minHeight: isSuccess ? '50vh' : '65vh', 
              width: '100%', 
              maxWidth: '1400px', 
              margin: '0 auto',
              padding: '3rem 3rem',
              paddingBottom: isSuccess ? '1rem' : '3rem'
            }}
          >
            {isSuccess ? (
              // 成功页面内容
              <>
                {/* 大的成功图标 */}
                <div className="mb-12">
                  <svg width="240" height="240" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="12" width="3" height="3" fill="#22c55e"/>
                    <rect x="5" y="15" width="3" height="3" fill="#22c55e"/>
                    <rect x="8" y="18" width="4" height="4" fill="#22c55e"/>
                    <rect x="12" y="14" width="4" height="4" fill="#22c55e"/>
                    <rect x="16" y="10" width="3" height="3" fill="#22c55e"/>
                    <rect x="19" y="7" width="3" height="3" fill="#22c55e"/>
                    <rect x="22" y="4" width="2" height="2" fill="#22c55e"/>
                  </svg>
                </div>

                {/* 成功信息卡片 */}
                {successExplanation && (
                  <div 
                    className="w-full bg-green-900/30 border-2 border-green-500 p-12 rounded-lg" 
                    style={{ 
                      boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
                      maxWidth: '1400px',
                      width: '90%'
                    }}
                  >
                    <h3 className="text-5xl font-bold text-green-300 mb-8 text-center">
                      {successMessage}
                    </h3>
                    <p className="text-2xl text-gray-200 leading-relaxed text-center">
                      {successExplanation}
                    </p>
                  </div>
                )}

                {/* 成功详情列表 */}
                {checkItems.length > 0 && (
                  <div className="w-full space-y-6 mt-12" style={{ maxWidth: '1400px', width: '90%', position: 'relative', zIndex: 10 }}>
                    {checkItems.map((item, index) => (
                      <div 
                        key={index}
                        className={`p-8 bg-green-900/30 border-2 border-green-500 rounded-lg ${
                          item.details ? 'flex flex-col' : 'flex items-center justify-between'
                        }`}
                        style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)', position: 'relative', zIndex: 10, overflow: 'visible' }}
                      >
                        <div className={`flex items-center gap-4 ${item.details ? 'mb-4' : ''}`}>
                          <PixelCheckmark size={36} color="#22c55e" />
                          <span className="text-green-300 font-bold text-2xl">{item.label}</span>
                        </div>
                        {item.showValue && item.value && (
                          <span className="text-gray-300 text-xl">{item.value}</span>
                        )}
                        {item.details && (
                          <div className="mt-4 w-full relative z-20" style={{ minHeight: '400px', overflow: 'visible', position: 'relative' }}>
                            {item.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // 失败页面内容
              <>
                {checkItems.length > 0 && (
                  <div className="w-full space-y-6" style={{ maxWidth: '1400px', width: '90%' }}>
                    {checkItems.map((item, index) => (
                      <div 
                        key={index}
                        className={`flex items-start justify-between p-8 border-2 ${
                          item.isCorrect 
                            ? 'bg-green-900/30 border-green-500' 
                            : 'bg-red-900/30 border-red-500'
                        }`}
                        style={{ 
                          boxShadow: item.isCorrect 
                            ? '0 0 15px rgba(34, 197, 94, 0.3)' 
                            : '0 0 15px rgba(239, 68, 68, 0.3)' 
                        }}
                      >
                        <div className="flex-1">
                          <h3 className={`font-bold text-2xl mb-4 ${
                            item.isCorrect ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {item.label}
                          </h3>
                          {item.details && (
                            <div className="text-xl text-gray-300">
                              {item.details}
                            </div>
                          )}
                          {item.showValue && item.value && (
                            <div className="text-xl text-gray-300 mt-2">
                              {item.value}
                            </div>
                          )}
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center ml-6">
                          {item.isCorrect ? (
                            <PixelCheckmark size={48} color="#22c55e" />
                          ) : (
                            <PixelCross size={48} color="#ef4444" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Button - 下一关按钮（成功和失败时都显示） */}
          {onNextLevel && (
            <div className="px-8 pb-12 pt-16 flex justify-center">
              <button 
                onClick={onNextLevel}
                className="px-16 py-6 text-white font-bold text-2xl rounded-lg border-3 transition-all transform hover:scale-110 active:scale-95"
                style={{ 
                  backgroundColor: isSuccess ? '#22c55e' : '#ef4444',
                  borderColor: isSuccess ? '#86efac' : '#fca5a5',
                  borderWidth: '4px',
                  boxShadow: isSuccess 
                    ? '0 0 25px rgba(34, 197, 94, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)'
                    : '0 0 25px rgba(239, 68, 68, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isSuccess ? '#16a34a' : '#dc2626';
                  e.currentTarget.style.boxShadow = isSuccess
                    ? '0 0 35px rgba(34, 197, 94, 1), inset 0 -3px 0 rgba(0,0,0,0.3)'
                    : '0 0 35px rgba(239, 68, 68, 1), inset 0 -3px 0 rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSuccess ? '#22c55e' : '#ef4444';
                  e.currentTarget.style.boxShadow = isSuccess
                    ? '0 0 25px rgba(34, 197, 94, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)'
                    : '0 0 25px rgba(239, 68, 68, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)';
                }}
              >
                {nextLevelButtonText}
              </button>
            </div>
          )}
          
          {/* 重试按钮 - 仅失败时显示（如果没有下一关按钮） */}
          {!isSuccess && onRetry && !onNextLevel && (
            <div className="px-8 pb-12 pt-16 flex justify-center">
              <button 
                onClick={onRetry}
                className="px-16 py-6 text-white font-bold text-2xl rounded-lg border-3 transition-all transform hover:scale-110 active:scale-95"
                style={{ 
                  backgroundColor: '#ef4444',
                  borderColor: '#fca5a5',
                  borderWidth: '4px',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 35px rgba(239, 68, 68, 1), inset 0 -3px 0 rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.8), inset 0 -3px 0 rgba(0,0,0,0.3)';
                }}
              >
                {retryButtonText}
              </button>
            </div>
          )}
          
          {/* 底部額外空間確保滾動時按鈕可見 */}
          <div style={{ height: '100px', minHeight: '100px' }}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeResultScreen;

