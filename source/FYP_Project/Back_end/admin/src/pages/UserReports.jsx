import { useState, useEffect } from 'react';
import { getAllReports } from '../api';

// 關卡代碼 → 中英名稱
const SCENARIO_NAMES = {
  'phase1-1': { zh: '下載錢包', en: 'Download Wallet' },
  'phase1-2': { zh: '創建錢包', en: 'Create Wallet' },
  'phase1-3': { zh: '首次入金', en: 'First Deposit' },
  'phase1-4': { zh: '錢包轉帳', en: 'Wallet Transfer' },
  'phase1-5': { zh: '中心化平台判別', en: 'CEX Check' },
  'phase1-6': { zh: '去中心化平台判別', en: 'DEX Check' },
  'phase2-1': { zh: '判別惡意授權', en: 'Identify Malicious Authorization' },
  'phase2-2': { zh: '判斷授權內容', en: 'Judge Authorization Content' },
  'phase2-3': { zh: '混合詐騙實戰', en: 'Hybrid Scam Drill' },
};

// 錯誤類型代碼 → 中英名稱
const ERROR_NAMES = {
  phishing_technique: { zh: '釣魚手法', en: 'Phishing Technique' },
  ui_deception: { zh: '介面欺騙', en: 'UI Deception' },
  fake_data: { zh: '偽造數據', en: 'Fake Data' },
  impossible_returns: { zh: '不可能回報', en: 'Impossible Returns' },
  regulatory_contradiction: { zh: '監管矛盾', en: 'Regulatory Contradiction' },
  regulatory_fraud: { zh: '監管欺詐', en: 'Regulatory Fraud' },
  fake_endorsement: { zh: '虛假背書', en: 'Fake Endorsement' },
  wrong_choice: { zh: '錯誤選擇', en: 'Wrong Choice' },
  skipped_verification: { zh: '跳過驗證', en: 'Skipped Verification' },
  wrong_backup_method: { zh: '錯誤備份方式', en: 'Wrong Backup Method' },
  wrong_categorization: { zh: '錯誤分類', en: 'Wrong Categorization' },
  address_poisoning_trap: { zh: '地址投毒陷阱', en: 'Address Poisoning Trap' },
  wrong_function_matching: { zh: '功能匹配錯誤', en: 'Wrong Function Matching' },
  wrong_domain_classification: { zh: '域名分類錯誤', en: 'Wrong Domain Classification' },
  wrong_anomaly_identification: { zh: '異常識別錯誤', en: 'Wrong Anomaly Identification' },
  wrong_authorization_judgment: { zh: '授權判斷錯誤', en: 'Wrong Authorization Judgment' },
  wrong_contract_identification: { zh: '合約識別錯誤', en: 'Wrong Contract Identification' },
  wrong_connection_method: { zh: '錯誤連接方式', en: 'Wrong Connection Method' },
  wrong_license_selection: { zh: '錯誤許可選擇', en: 'Wrong License Selection' },
  wrong_transfer_details: { zh: '轉帳細節錯誤', en: 'Wrong Transfer Details' },
  wrong_deposit_method: { zh: '錯誤存款方式', en: 'Wrong Deposit Method' },
};

// 能力維度代碼 → 中英名稱
const SKILL_NAMES = {
  reaction_speed: { zh: '反應速度', en: 'Reaction Speed' },
  accuracy: { zh: '準確度', en: 'Accuracy' },
  consistency: { zh: '一致性', en: 'Consistency' },
};

// 能力等級代碼 → 中英名稱
const LEVEL_NAMES = {
  excellent: { zh: '優秀', en: 'Excellent' },
  good: { zh: '良好', en: 'Good' },
  average: { zh: '普通', en: 'Average' },
  needs_improvement: { zh: '待加強', en: 'Needs Improvement' },
};

const UserReports = ({ language }) => {
  const isZh = language === 'zh';
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const username = (r.users?.username || '').toLowerCase();
    const userId = (r.user_id || '').toLowerCase();
    return username.includes(q) || userId.includes(q);
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getAllReports();
        setReports(res.data || []);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}${isZh ? '分' : 'm'} ${seconds % 60}${isZh ? '秒' : 's'}`;
    return `${seconds}${isZh ? '秒' : 's'}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' });
  };

  const levelColor = (level) => {
    const colors = {
      excellent: '#4ade80',
      good: '#00d9ff',
      average: '#fbbf24',
      needs_improvement: '#f87171',
    };
    return colors[level] || '#aaa';
  };

  const getScenarioName = (p) => {
    const code = p.scenario_code;
    const names = SCENARIO_NAMES[code];
    if (names) return isZh ? names.zh : names.en;
    return p.scenario_title || code || 'Unknown';
  };

  const getErrorName = (key) => {
    const names = ERROR_NAMES[key];
    if (names) return isZh ? names.zh : names.en;
    return key.replace(/_/g, ' ');
  };

  const getSkillName = (key) => {
    const names = SKILL_NAMES[key];
    if (names) return isZh ? names.zh : names.en;
    return key.replace(/_/g, ' ');
  };

  const getLevelName = (level) => {
    const names = LEVEL_NAMES[level];
    if (names) return isZh ? names.zh : names.en;
    return level;
  };

  const downloadReport = (report) => {
    const username = report.users?.username || report.user_id?.slice(0, 8) || 'unknown';
    const sep = ',';
    const lines = [];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    // Title
    lines.push(esc(isZh ? `用戶報告 — ${username}` : `User Report — ${username}`));
    lines.push('');

    // Overview
    lines.push(esc(isZh ? '【總覽】' : '【Overview】'));
    lines.push([esc(isZh ? '完成關卡數' : 'Scenarios Completed'), esc(`${report.total_scenarios_completed} / 9`)].join(sep));
    lines.push([esc(isZh ? '總體成功率' : 'Overall Success Rate'), esc(`${report.overall_success_rate}%`)].join(sep));
    lines.push([esc(isZh ? '總用時' : 'Total Time'), esc(formatTime(report.total_time_ms))].join(sep));
    lines.push([esc(isZh ? '完成天數' : 'Days to Complete'), esc(report.total_days_to_complete)].join(sep));
    lines.push([esc(isZh ? '首次嘗試' : 'First Attempt'), esc(formatDate(report.first_attempt_at))].join(sep));
    lines.push([esc(isZh ? '最後完成' : 'Last Completed'), esc(formatDate(report.last_completed_at))].join(sep));
    lines.push('');

    // Skill Grading
    if (report.skill_grading) {
      lines.push(esc(isZh ? '【能力評分】' : '【Skill Grading】'));
      lines.push([esc(isZh ? '能力' : 'Skill'), esc(isZh ? '分數' : 'Score'), esc(isZh ? '等級' : 'Level')].join(sep));
      Object.entries(report.skill_grading).forEach(([key, val]) => {
        lines.push([esc(getSkillName(key)), esc(val.score), esc(getLevelName(val.level))].join(sep));
      });
      lines.push('');
    }

    // Error Distribution
    if (report.error_distribution && Object.keys(report.error_distribution).length > 0) {
      lines.push(esc(isZh ? '【錯誤類型分佈】' : '【Error Distribution】'));
      lines.push([esc(isZh ? '錯誤類型' : 'Error Type'), esc(isZh ? '次數' : 'Count'), esc(isZh ? '百分比' : 'Percentage')].join(sep));
      Object.entries(report.error_distribution).forEach(([type, info]) => {
        lines.push([esc(getErrorName(type)), esc(info.count), esc(`${info.percentage}%`)].join(sep));
      });
      lines.push('');
    }

    // Performance Summary
    if (report.performance_summary) {
      lines.push(esc(isZh ? '【各關表現】' : '【Performance Summary】'));
      lines.push([esc(isZh ? '關卡' : 'Scenario'), esc(isZh ? '嘗試次數' : 'Attempts'), esc(isZh ? '成功次序' : 'Success At'), esc(isZh ? '平均用時' : 'Avg Time'), esc(isZh ? '結果' : 'Result')].join(sep));
      const ps = Array.isArray(report.performance_summary) ? report.performance_summary : Object.values(report.performance_summary);
      ps.forEach((p) => {
        lines.push([esc(getScenarioName(p)), esc(p.total_attempts), esc(p.successful_attempt_number || '-'), esc(formatTime(p.avg_time_ms)), esc(p.final_success ? (isZh ? '通過' : 'Passed') : (isZh ? '未通過' : 'Failed'))].join(sep));
      });
      lines.push('');
    }

    // AI Analysis
    if (report.ai_analysis_result) {
      const ai = report.ai_analysis_result;
      const rp = ai.risk_profile || {};
      lines.push(esc(isZh ? '【AI 分析】' : '【AI Analysis】'));
      lines.push([esc(isZh ? '風險等級' : 'Risk Level'), esc((rp.overall_risk_level || 'N/A').toUpperCase())].join(sep));
      lines.push([esc(isZh ? '最強領域' : 'Strongest Area'), esc(isZh ? rp.strongest_area_zh : rp.strongest_area_en)].join(sep));
      lines.push([esc(isZh ? '最弱領域' : 'Weakest Area'), esc(isZh ? rp.weakest_area_zh : rp.weakest_area_en)].join(sep));
      lines.push([esc(isZh ? '脆弱點' : 'Vulnerability'), esc(isZh ? rp.vulnerability_summary_zh : rp.vulnerability_summary_en)].join(sep));
      lines.push('');
      const summary = isZh ? ai.summary_zh : ai.summary_en;
      if (summary) {
        lines.push(esc(isZh ? '【分析摘要】' : '【Analysis Summary】'));
        lines.push(esc(summary));
        lines.push('');
      }
      const recs = isZh ? ai.recommendations_zh : ai.recommendations_en;
      if (recs && recs.length > 0) {
        lines.push(esc(isZh ? '【建議】' : '【Recommendations】'));
        recs.forEach((rec, i) => lines.push(esc(`${i + 1}. ${rec}`)));
        lines.push('');
      }
    }

    // BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    const csv = bom + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${username}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">{isZh ? '載入報告中...' : 'Loading reports...'}</div>;
  }

  return (
    <div className="reports-page">
      <h1>{isZh ? '📄 用戶報告' : '📄 User Reports'}</h1>

      <div className="reports-content">
        {/* Report list */}
        <div className="reports-list">
          <div className="users-header-row">
            <h3>{isZh ? '所有報告' : 'All Reports'} ({filteredReports.length}{searchQuery ? ` / ${reports.length}` : ''})</h3>
            <input
              type="text"
              className="users-search-input"
              placeholder={isZh ? '搜尋用戶名' : 'Search by username'}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedReport(null); }}
            />
          </div>
          {filteredReports.length === 0 ? (
            <div className="no-data">{searchQuery ? (isZh ? '找不到匹配的用戶' : 'No matching users found') : (isZh ? '尚未生成任何報告' : 'No reports generated yet')}</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isZh ? '用戶名' : 'Username'}</th>
                    <th>{isZh ? '完成數' : 'Completed'}</th>
                    <th>{isZh ? '成功率' : 'Success Rate'}</th>
                    <th>{isZh ? '總用時' : 'Total Time'}</th>
                    <th>{isZh ? '生成日期' : 'Generated At'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr
                      key={r.report_id}
                      className={`clickable ${selectedReport?.report_id === r.report_id ? 'selected-row' : ''}`}
                      onClick={() => setSelectedReport(r)}
                    >
                      <td>{r.users?.username || r.user_id?.slice(0, 8)}</td>
                      <td>{r.total_scenarios_completed} / 9</td>
                      <td>{r.overall_success_rate}%</td>
                      <td>{formatTime(r.total_time_ms)}</td>
                      <td>{formatDate(r.generated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report detail */}
        {selectedReport && (
          <div className="report-detail">
            <div className="report-detail-header">
              <h3>
                {isZh ? '報告' : 'Report'}: {selectedReport.users?.username || selectedReport.user_id?.slice(0, 8)}
              </h3>
              <button className="download-report-btn" onClick={() => downloadReport(selectedReport)}>
                📥 {isZh ? '下載報告' : 'Download Report'}
              </button>
            </div>

            {/* Overview */}
            <div className="detail-section">
              <h4>📊 {isZh ? '總覽' : 'Overview'}</h4>
              <ul className="report-overview-list">
                <li>
                  <span className="label">{isZh ? '完成關卡數' : 'Scenarios Completed'}</span>
                  <span className="value">{selectedReport.total_scenarios_completed} / 9</span>
                </li>
                <li>
                  <span className="label">{isZh ? '總體成功率' : 'Overall Success Rate'}</span>
                  <span className="value">{selectedReport.overall_success_rate}%</span>
                </li>
                <li>
                  <span className="label">{isZh ? '總用時' : 'Total Time'}</span>
                  <span className="value">{formatTime(selectedReport.total_time_ms)}</span>
                </li>
                <li>
                  <span className="label">{isZh ? '完成天數' : 'Days to Complete'}</span>
                  <span className="value">{selectedReport.total_days_to_complete}</span>
                </li>
                <li>
                  <span className="label">{isZh ? '首次嘗試' : 'First Attempt'}</span>
                  <span className="value">{formatDate(selectedReport.first_attempt_at)}</span>
                </li>
                <li>
                  <span className="label">{isZh ? '最後完成' : 'Last Completed'}</span>
                  <span className="value">{formatDate(selectedReport.last_completed_at)}</span>
                </li>
              </ul>
            </div>

            {/* Skill Grading */}
            {selectedReport.skill_grading && (
              <div className="detail-section">
                <h4>🎯 {isZh ? '能力評分' : 'Skill Grading'}</h4>
                <div className="skill-grid">
                  {Object.entries(selectedReport.skill_grading).map(([key, val]) => (
                    <div key={key} className="skill-card">
                      <div className="skill-name">{getSkillName(key)}</div>
                      <div className="skill-score" style={{ color: levelColor(val.level) }}>
                        {val.score}
                      </div>
                      <div className="skill-level" style={{ color: levelColor(val.level) }}>
                        {getLevelName(val.level)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Distribution */}
            {selectedReport.error_distribution && Object.keys(selectedReport.error_distribution).length > 0 && (
              <div className="detail-section">
                <h4>⚠️ {isZh ? '錯誤類型分佈' : 'Error Distribution'}</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{isZh ? '錯誤類型' : 'Error Type'}</th>
                        <th>{isZh ? '次數' : 'Count'}</th>
                        <th>{isZh ? '百分比' : 'Percentage'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedReport.error_distribution).map(([type, info]) => (
                        <tr key={type}>
                          <td>{getErrorName(type)}</td>
                          <td>{info.count}</td>
                          <td>{info.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Performance Summary */}
            {selectedReport.performance_summary && (
              <div className="detail-section">
                <h4>📋 {isZh ? '各關表現' : 'Performance Summary'}</h4>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{isZh ? '關卡' : 'Scenario'}</th>
                        <th>{isZh ? '嘗試次數' : 'Attempts'}</th>
                        <th>{isZh ? '成功次序' : 'Success At'}</th>
                        <th>{isZh ? '平均用時' : 'Avg Time'}</th>
                        <th>{isZh ? '結果' : 'Result'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(selectedReport.performance_summary)
                        ? selectedReport.performance_summary
                        : Object.values(selectedReport.performance_summary)
                      ).map((p, i) => (
                        <tr key={i}>
                          <td>{getScenarioName(p)}</td>
                          <td>{p.total_attempts}</td>
                          <td>{p.successful_attempt_number || '-'}</td>
                          <td>{formatTime(p.avg_time_ms)}</td>
                          <td>{p.final_success ? '✅' : '❌'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Analysis Result — Formatted */}
            {selectedReport.ai_analysis_result && (() => {
              const ai = selectedReport.ai_analysis_result;
              const summary = isZh ? ai.summary_zh : ai.summary_en;
              const recommendations = isZh ? ai.recommendations_zh : ai.recommendations_en;
              const rp = ai.risk_profile || {};
              const riskLevel = rp.overall_risk_level || 'unknown';
              const riskColor = { low: '#4ade80', medium: '#fbbf24', high: '#f87171', unknown: '#aaa' }[riskLevel] || '#aaa';
              const strongestArea = isZh ? rp.strongest_area_zh : rp.strongest_area_en;
              const weakestArea = isZh ? rp.weakest_area_zh : rp.weakest_area_en;
              const vulnSummary = isZh ? rp.vulnerability_summary_zh : rp.vulnerability_summary_en;

              return (
                <div className="detail-section">
                  <h4>🤖 {isZh ? 'AI 分析' : 'AI Analysis'}</h4>

                  {/* Risk Profile Card */}
                  <div className="ai-risk-card" style={{ borderLeft: `4px solid ${riskColor}` }}>
                    <div className="ai-risk-header">
                      <span className="ai-risk-badge" style={{ background: riskColor, color: '#000' }}>
                        {riskLevel.toUpperCase()}
                      </span>
                      <span className="ai-risk-title">{isZh ? '整體風險等級' : 'Overall Risk Level'}</span>
                    </div>
                    <div className="ai-risk-grid">
                      <div className="ai-risk-item">
                        <span className="ai-risk-label">💪 {isZh ? '最強領域' : 'Strongest Area'}</span>
                        <span className="ai-risk-value" style={{ color: '#4ade80' }}>{strongestArea || 'N/A'}</span>
                      </div>
                      <div className="ai-risk-item">
                        <span className="ai-risk-label">⚠️ {isZh ? '最弱領域' : 'Weakest Area'}</span>
                        <span className="ai-risk-value" style={{ color: '#f87171' }}>{weakestArea || 'N/A'}</span>
                      </div>
                    </div>
                    {vulnSummary && (
                      <div className="ai-risk-vuln">
                        <span className="ai-risk-label">🎯 {isZh ? '易受攻擊類型' : 'Vulnerability'}</span>
                        <p>{vulnSummary}</p>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {summary && (
                    <div className="ai-summary-card">
                      <h5>📝 {isZh ? '分析摘要' : 'Analysis Summary'}</h5>
                      <p className="ai-summary-text">{summary}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations && recommendations.length > 0 && (
                    <div className="ai-recommendations-card">
                      <h5>💡 {isZh ? '建議' : 'Recommendations'}</h5>
                      <ol className="ai-recommendations-list">
                        {recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReports;
