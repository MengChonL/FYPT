import { useState, useEffect } from 'react';
import { checkHealth, getUsers, getScenarios, getAllReports } from '../api';

// 關卡名稱映射
const SCENARIO_NAMES = {
  'phase1-1': { zh: '下載錢包', en: 'Download Wallet' },
  'phase1-2': { zh: '創建錢包', en: 'Create Wallet' },
  'phase1-3': { zh: '首次入金', en: 'First Deposit' },
  'phase1-4': { zh: '錢包轉帳', en: 'Wallet Transfer' },
  'phase1-5': { zh: '中心化平台判別', en: 'CEX Check' },
  'phase1-6': { zh: '去中心化平台判別', en: 'DEX Check' },
  'phase2-1': { zh: '判別惡意授權', en: 'Malicious Auth' },
  'phase2-2': { zh: '判斷授權內容', en: 'Judge Auth' },
  'phase2-3': { zh: '混合詐騙實戰', en: 'Hybrid Scam' },
};

const Dashboard = ({ language }) => {
  const isZh = language === 'zh';
  const [stats, setStats] = useState({
    health: null,
    users: 0,
    scenarios: 0,
    reports: 0,
    reportsData: [],
    usersData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [healthRes, usersRes, scenariosRes, reportsRes] = await Promise.all([
          checkHealth(),
          getUsers(),
          getScenarios(),
          getAllReports()
        ]);

        setStats({
          health: healthRes.data,
          users: usersRes.data?.length || 0,
          scenarios: scenariosRes.data?.length || 0,
          reports: reportsRes.data?.length || 0,
          reportsData: reportsRes.data || [],
          usersData: usersRes.data || [],
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2>{isZh ? '載入中...' : 'Loading...'}</h2>
        <p>{isZh ? '請確認 Backend API 正在運行於 http://localhost:3001' : 'Please confirm Backend API is running at http://localhost:3001'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <h2 style={{ color: '#f87171' }}>{isZh ? '錯誤' : 'Error'}</h2>
        <p>{error}</p>
        <p>{isZh ? '請確認：' : 'Please check:'}</p>
        <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
          <li>{isZh ? 'Backend API 正在運行（http://localhost:3001）' : 'Backend API is running (http://localhost:3001)'}</li>
          <li>{isZh ? 'Supabase 憑證正確' : 'Supabase credentials are correct'}</li>
          <li>{isZh ? '資料庫表格已建立' : 'Database tables are created'}</li>
        </ul>
      </div>
    );
  }

  // Compute chart data from reports
  const computeChartData = () => {
    const reports = stats.reportsData;
    if (!reports.length) return null;

    // Average success rate
    const avgSuccess = (reports.reduce((s, r) => s + (r.overall_success_rate || 0), 0) / reports.length).toFixed(1);

    // Reports with AI analysis
    const withAI = reports.filter(r => r.ai_analysis_result && !r.ai_analysis_result.ai_error).length;

    // Average completion time (ms → min)
    const avgTimeMs = reports.reduce((s, r) => s + (r.total_time_ms || 0), 0) / reports.length;
    const avgTimeMin = (avgTimeMs / 60000).toFixed(1);

    // Scenario pass rate chart data
    const scenarioMap = {};
    reports.forEach(r => {
      const ps = Array.isArray(r.performance_summary) ? r.performance_summary : Object.values(r.performance_summary || {});
      ps.forEach(p => {
        const code = p.scenario_code;
        if (!code) return;
        if (!scenarioMap[code]) scenarioMap[code] = { total: 0, success: 0 };
        scenarioMap[code].total++;
        if (p.final_success) scenarioMap[code].success++;
      });
    });

    const scenarioBars = Object.entries(scenarioMap).map(([code, v]) => ({
      code,
      label: SCENARIO_NAMES[code] ? (isZh ? SCENARIO_NAMES[code].zh : SCENARIO_NAMES[code].en) : code,
      rate: v.total > 0 ? Math.round((v.success / v.total) * 100) : 0,
    })).sort((a, b) => {
      // Sort by phase order
      const order = Object.keys(SCENARIO_NAMES);
      return order.indexOf(a.code) - order.indexOf(b.code);
    });

    // Success rate distribution (buckets: 0-20, 20-40, 40-60, 60-80, 80-100)
    const buckets = [0, 0, 0, 0, 0];
    reports.forEach(r => {
      const rate = r.overall_success_rate || 0;
      const idx = Math.min(Math.floor(rate / 20), 4);
      buckets[idx]++;
    });
    const maxBucket = Math.max(...buckets, 1);

    return { avgSuccess, withAI, avgTimeMin, scenarioBars, buckets, maxBucket };
  };

  const chartData = computeChartData();

  return (
    <div className="dashboard">
      <h1>{isZh ? '📊 儀表板' : '📊 Dashboard'}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🖥️</div>
          <div className="stat-info">
            <h3>{isZh ? '伺服器狀態' : 'Server Status'}</h3>
            <p className={stats.health?.status === 'ok' ? 'status-ok' : 'status-error'}>
              {stats.health?.status === 'ok' ? (isZh ? '✅ 在線' : '✅ Online') : (isZh ? '❌ 離線' : '❌ Offline')}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{isZh ? '總用戶數' : 'Total Users'}</h3>
            <p className="stat-number">{stats.users}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <h3>{isZh ? '關卡數' : 'Scenarios'}</h3>
            <p className="stat-number">{stats.scenarios}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{isZh ? '報告數' : 'Reports'}</h3>
            <p className="stat-number">{stats.reports}</p>
          </div>
        </div>
      </div>

      {/* Extra summary row */}
      {chartData && (
        <div className="stats-grid" style={{ marginTop: 0 }}>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>{isZh ? '平均成功率' : 'Avg Success Rate'}</h3>
              <p className="stat-number">{chartData.avgSuccess}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <h3>{isZh ? 'AI 分析完成' : 'AI Analysis Done'}</h3>
              <p className="stat-number">{chartData.withAI} / {stats.reports}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>{isZh ? '平均用時' : 'Avg Time'}</h3>
              <p className="stat-number">{chartData.avgTimeMin} {isZh ? '分鐘' : 'min'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      {chartData && (
        <div className="dashboard-charts">
          {/* Scenario pass rate chart */}
          <div className="chart-card">
            <h3>{isZh ? '各關卡通過率' : 'Scenario Pass Rates'}</h3>
            <div className="bar-chart">
              {chartData.scenarioBars.map((bar) => (
                <div key={bar.code} className="bar-row">
                  <span className="bar-label">{bar.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${bar.rate}%`,
                        background: bar.rate >= 80 ? '#4ade80' : bar.rate >= 50 ? '#fbbf24' : '#f87171',
                      }}
                    />
                  </div>
                  <span className="bar-value">{bar.rate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success rate distribution */}
          <div className="chart-card">
            <h3>{isZh ? '成功率分佈' : 'Success Rate Distribution'}</h3>
            <div className="histogram">
              {['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'].map((label, i) => (
                <div key={label} className="histogram-col">
                  <span className="histogram-count">{chartData.buckets[i]}</span>
                  <div
                    className="histogram-bar"
                    style={{
                      height: `${(chartData.buckets[i] / chartData.maxBucket) * 120}px`,
                      background: ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80'][i],
                    }}
                  />
                  <span className="histogram-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="server-info">
        <h3>{isZh ? '伺服器資訊' : 'Server Info'}</h3>
        <pre>{JSON.stringify(stats.health, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Dashboard;
