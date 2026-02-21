import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserStatistics } from '../api';

const UserStatistics = ({ userId, language = 'chinese', onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getUserStatistics(userId);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  const formatTime = (ms) => {
    if (!ms) return '0秒';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return language === 'chinese' 
        ? `${minutes}分${remainingSeconds}秒`
        : `${minutes}m ${remainingSeconds}s`;
    }
    return language === 'chinese' ? `${seconds}秒` : `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-[#1a1b26] p-8 rounded-lg border-4 border-cyan-400">
          <p className="text-white text-xl font-mono">
            {language === 'chinese' ? '載入統計中...' : 'Loading Statistics...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-[#1a1b26] p-8 rounded-lg border-4 border-red-400">
          <p className="text-red-400 text-xl font-mono mb-4">
            {language === 'chinese' ? '載入失敗' : 'Failed to Load'}
          </p>
          <p className="text-white font-mono mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            {language === 'chinese' ? '關閉' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { overall, by_scenario } = stats;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1a1b26] rounded-lg border-4 border-cyan-400 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 40px rgba(34, 211, 238, 0.5)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-lg relative">
          <h2 className="text-3xl font-bold text-white text-center font-mono tracking-wider">
            {language === 'chinese' ? '📊 答題統計' : '📊 Statistics'}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-red-500 hover:text-red-600 font-bold cursor-pointer transition-colors"
            style={{
              background: 'none',
              border: 'none',
              padding: '0',
              lineHeight: '1',
              fontSize: '40px',
              width: '48px',
              height: '35x',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Combined Statistics Container */}
          <div className="bg-[#2d3748] p-6 rounded-lg border-2 border-cyan-400 space-y-6">
            {/* Overall Statistics */}
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">
                {language === 'chinese' ? '整體表現' : 'Overall Performance'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1b26] p-4 rounded border border-cyan-400/30">
                  <p className="text-gray-400 text-sm font-mono">
                    {language === 'chinese' ? '總嘗試次數' : 'Total Attempts'}
                  </p>
                  <p className="text-2xl font-bold text-white">{overall.total_attempts}</p>
                </div>
                <div className="bg-[#1a1b26] p-4 rounded border border-green-400/30">
                  <p className="text-gray-400 text-sm font-mono">
                    {language === 'chinese' ? '成功次數' : 'Success Count'}
                  </p>
                  <p className="text-2xl font-bold text-green-400">{overall.success_attempts}</p>
                </div>
                <div className="bg-[#1a1b26] p-4 rounded border border-red-400/30">
                  <p className="text-gray-400 text-sm font-mono">
                    {language === 'chinese' ? '失敗次數' : 'Failed Count'}
                  </p>
                  <p className="text-2xl font-bold text-red-400">{overall.failed_attempts}</p>
                </div>
                <div className="bg-[#1a1b26] p-4 rounded border border-yellow-400/30">
                  <p className="text-gray-400 text-sm font-mono">
                    {language === 'chinese' ? '成功率' : 'Success Rate'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">{overall.success_rate}%</p>
                </div>
                <div className="bg-[#1a1b26] p-4 rounded border border-purple-400/30">
                  <p className="text-gray-400 text-sm font-mono">
                    {language === 'chinese' ? '平均答題時間' : 'Avg Time'}
                  </p>
                  <p className="text-2xl font-bold text-purple-400">{formatTime(overall.avg_time_ms)}</p>
                </div>
                <div className="bg-[#1a1b26] p-4 rounded border border-blue-400/30">
                  <p className="text-gray-400 text-sm font-mono">
                    {language === 'chinese' ? '總答題時間' : 'Total Time'}
                  </p>
                  <p className="text-2xl font-bold text-blue-400">{formatTime(overall.total_time_ms)}</p>
                </div>
              </div>
            </div>

            {/* Per Scenario Statistics */}
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">
                {language === 'chinese' ? '各關卡表現' : 'Performance by Scenario'}
              </h3>
              <div className="space-y-4">
                {by_scenario.map((scenario) => (
                  <div
                    key={scenario.scenario_code}
                    className="bg-[#1a1b26] p-4 rounded border border-cyan-400/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white font-mono">
                          {language === 'chinese' ? scenario.scenario_title_zh : scenario.scenario_title_en}
                        </h4>
                        <p className="text-sm text-gray-400 font-mono">{scenario.scenario_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {language === 'chinese' ? '成功率' : 'Success Rate'}
                        </p>
                        <p className="text-xl font-bold text-yellow-400">{scenario.success_rate}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">
                          {language === 'chinese' ? '嘗試' : 'Attempts'}
                        </p>
                        <p className="text-white font-bold">{scenario.total_attempts}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">
                          {language === 'chinese' ? '成功' : 'Success'}
                        </p>
                        <p className="text-green-400 font-bold">{scenario.success_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">
                          {language === 'chinese' ? '失敗' : 'Failed'}
                        </p>
                        <p className="text-red-400 font-bold">{scenario.fail_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">
                          {language === 'chinese' ? '平均時間' : 'Avg Time'}
                        </p>
                        <p className="text-purple-400 font-bold">{formatTime(scenario.avg_time_ms)}</p>
                      </div>
                    </div>

                    {/* Error Types */}
                    {scenario.error_types && Object.keys(scenario.error_types).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-gray-400 text-sm mb-2">
                          {language === 'chinese' ? '錯誤類型統計：' : 'Error Types:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(scenario.error_types).map(([type, count]) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-red-900/30 border border-red-400/30 rounded text-red-400 text-xs font-mono"
                            >
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#2d3748] rounded-b-lg border-t-2 border-cyan-400 flex justify-center">
          <button
            onClick={onClose}
            className="bg-white text-black border-4 border-black px-12 py-3 font-black text-lg tracking-widest hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] font-mono transition-colors"
          >
            {language === 'chinese' ? '返回' : 'Return'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserStatistics;
