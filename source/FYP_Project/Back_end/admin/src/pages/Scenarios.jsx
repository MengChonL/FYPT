import { useState, useEffect, useMemo } from 'react';
import { getScenarios, createScenario } from '../api';

const Scenarios = ({ language }) => {
  const isZh = language === 'zh';
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const emptyForm = {
    scenario_code: '',
    phase_id: '',
    type_id: '',
    title_zh: '',
    title_en: '',
    story_zh: '',
    story_en: '',
    mission_zh: '',
    mission_en: '',
    warning_zh: '',
    warning_en: '',
    icon_type: 'shield',
    display_order: 1,
    is_active: true,
    config_data: '{}',
  };
  const [form, setForm] = useState(emptyForm);

  // Extract unique phases and types from existing scenarios
  const phases = useMemo(() => {
    const map = new Map();
    scenarios.forEach(s => {
      if (s.phase_id && s.phases) {
        map.set(s.phase_id, { phase_id: s.phase_id, ...s.phases });
      }
    });
    return Array.from(map.values());
  }, [scenarios]);

  const types = useMemo(() => {
    const map = new Map();
    scenarios.forEach(s => {
      if (s.type_id && s.scenario_types) {
        map.set(s.type_id, { type_id: s.type_id, ...s.scenario_types });
      }
    });
    return Array.from(map.values());
  }, [scenarios]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const scenRes = await getScenarios();
        setScenarios(scenRes.data || []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreate = async () => {
    setCreateError('');
    if (!form.scenario_code || !form.phase_id || !form.type_id || !form.title_zh || !form.title_en) {
      setCreateError(isZh ? '請填寫所有必填欄位（代碼、階段、類型、中英標題）' : 'Please fill all required fields (code, phase, type, titles)');
      return;
    }
    let configData;
    try {
      configData = JSON.parse(form.config_data);
    } catch {
      setCreateError(isZh ? 'Config Data 不是有效的 JSON' : 'Config Data is not valid JSON');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        scenario_code: form.scenario_code,
        phase_id: form.phase_id,
        type_id: form.type_id,
        title_zh: form.title_zh,
        title_en: form.title_en,
        story_zh: form.story_zh || null,
        story_en: form.story_en || null,
        mission_zh: form.mission_zh || null,
        mission_en: form.mission_en || null,
        warning_zh: form.warning_zh || null,
        warning_en: form.warning_en || null,
        icon_type: form.icon_type || 'shield',
        display_order: parseInt(form.display_order) || 1,
        is_active: form.is_active,
        config_data: configData,
      };
      const res = await createScenario(payload);
      // Refresh list
      const scenRes = await getScenarios();
      setScenarios(scenRes.data || []);
      setForm(emptyForm);
      setShowCreateForm(false);
    } catch (error) {
      setCreateError(error?.response?.data?.error || error.message);
    } finally {
      setCreating(false);
    }
  };

  const phaseName = (phaseId) => {
    const p = phases.find(ph => ph.phase_id === phaseId);
    if (!p) return phaseId?.slice(0, 8) || '—';
    return isZh ? p.title_zh : p.title_en;
  };

  const typeName = (typeId) => {
    const t = types.find(tp => tp.type_id === typeId);
    if (!t) return typeId?.slice(0, 8) || '—';
    return isZh ? (t.name_zh || t.type_code) : (t.name_en || t.type_code);
  };

  if (loading) {
    return <div className="loading">{isZh ? '載入關卡中...' : 'Loading scenarios...'}</div>;
  }

  return (
    <div className="scenarios-page">
      <div className="scenarios-header">
        <h1>{isZh ? '🎮 關卡管理' : '🎮 Scenarios Management'}</h1>
        <button className="create-scenario-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? (isZh ? '✕ 取消' : '✕ Cancel') : (isZh ? '＋ 新增關卡' : '＋ New Scenario')}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="scenario-create-form">
          <h3>{isZh ? '新增關卡' : 'Create New Scenario'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{isZh ? '關卡代碼 *' : 'Scenario Code *'}</label>
              <input name="scenario_code" value={form.scenario_code} onChange={handleInputChange} placeholder="e.g. phase3-1" />
            </div>
            <div className="form-group">
              <label>{isZh ? '所屬階段 *' : 'Phase *'}</label>
              <select name="phase_id" value={form.phase_id} onChange={handleInputChange}>
                <option value="">{isZh ? '— 選擇階段 —' : '— Select Phase —'}</option>
                {phases.map(p => (
                  <option key={p.phase_id} value={p.phase_id}>
                    {isZh ? p.title_zh : p.title_en}{p.phase_code ? ` (${p.phase_code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{isZh ? '關卡類型 *' : 'Type *'}</label>
              <select name="type_id" value={form.type_id} onChange={handleInputChange}>
                <option value="">{isZh ? '— 選擇類型 —' : '— Select Type —'}</option>
                {types.map(t => (
                  <option key={t.type_id} value={t.type_id}>
                    {isZh ? (t.name_zh || t.type_code) : (t.name_en || t.type_code)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{isZh ? '排序' : 'Display Order'}</label>
              <input type="number" name="display_order" value={form.display_order} onChange={handleInputChange} min="1" />
            </div>
            <div className="form-group">
              <label>{isZh ? '中文標題 *' : 'Title (ZH) *'}</label>
              <input name="title_zh" value={form.title_zh} onChange={handleInputChange} placeholder={isZh ? '中文標題' : 'Chinese title'} />
            </div>
            <div className="form-group">
              <label>{isZh ? '英文標題 *' : 'Title (EN) *'}</label>
              <input name="title_en" value={form.title_en} onChange={handleInputChange} placeholder={isZh ? '英文標題' : 'English title'} />
            </div>
            <div className="form-group form-full">
              <label>{isZh ? '中文劇情' : 'Story (ZH)'}</label>
              <textarea name="story_zh" value={form.story_zh} onChange={handleInputChange} rows="2" placeholder={isZh ? '劇情背景...' : 'Story background...'} />
            </div>
            <div className="form-group form-full">
              <label>{isZh ? '英文劇情' : 'Story (EN)'}</label>
              <textarea name="story_en" value={form.story_en} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-group">
              <label>{isZh ? '中文任務' : 'Mission (ZH)'}</label>
              <textarea name="mission_zh" value={form.mission_zh} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-group">
              <label>{isZh ? '英文任務' : 'Mission (EN)'}</label>
              <textarea name="mission_en" value={form.mission_en} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-group">
              <label>{isZh ? '中文警示語' : 'Warning (ZH)'}</label>
              <textarea name="warning_zh" value={form.warning_zh} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-group">
              <label>{isZh ? '英文警示語' : 'Warning (EN)'}</label>
              <textarea name="warning_en" value={form.warning_en} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-group">
              <label>{isZh ? '圖示類型' : 'Icon Type'}</label>
              <input name="icon_type" value={form.icon_type} onChange={handleInputChange} />
            </div>
            <div className="form-group form-checkbox-group">
              <label>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleInputChange} />
                {isZh ? ' 啟用' : ' Active'}
              </label>
            </div>
            <div className="form-group form-full">
              <label>Config Data (JSON)</label>
              <textarea name="config_data" value={form.config_data} onChange={handleInputChange} rows="4" className="monospace" placeholder='{ }' />
            </div>
          </div>
          {createError && <div className="form-error">{createError}</div>}
          <div className="form-actions">
            <button className="form-submit-btn" onClick={handleCreate} disabled={creating}>
              {creating ? (isZh ? '建立中...' : 'Creating...') : (isZh ? '✅ 建立關卡' : '✅ Create Scenario')}
            </button>
          </div>
        </div>
      )}

      {/* Scenario cards */}
      <div className="scenario-cards-grid">
        {scenarios.map((s) => (
          <div
            key={s.scenario_id}
            className={`scenario-card ${selectedScenario?.scenario_id === s.scenario_id ? 'scenario-card-selected' : ''} ${!s.is_active ? 'scenario-card-inactive' : ''}`}
            onClick={() => setSelectedScenario(selectedScenario?.scenario_id === s.scenario_id ? null : s)}
          >
            <div className="scenario-card-header">
              <span className="scenario-card-code">{s.scenario_code}</span>
              <span className={`scenario-card-status ${s.is_active ? 'active' : 'inactive'}`}>
                {s.is_active ? '✅' : '❌'}
              </span>
            </div>
            <h4 className="scenario-card-title">{isZh ? s.title_zh : s.title_en}</h4>
            <div className="scenario-card-meta">
              <span className="scenario-card-phase">📁 {s.phases ? (isZh ? s.phases.title_zh : s.phases.title_en) : phaseName(s.phase_id)}</span>
              <span className="scenario-card-type">🧩 {s.scenario_types ? (isZh ? (s.scenario_types.name_zh || s.scenario_types.type_code) : (s.scenario_types.name_en || s.scenario_types.type_code)) : typeName(s.type_id)}</span>
            </div>
            <div className="scenario-card-order">#{s.display_order}</div>
          </div>
        ))}
      </div>

      {/* Selected scenario detail */}
      {selectedScenario && (
        <div className="scenario-detail-panel">
          <div className="scenario-detail-header">
            <h3>{isZh ? '關卡詳情' : 'Scenario Details'}: {selectedScenario.scenario_code}</h3>
            <button className="close-detail-btn" onClick={() => setSelectedScenario(null)}>✕</button>
          </div>

          <div className="scenario-detail-grid">
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '中文標題' : 'Title (ZH)'}</span>
              <span className="scenario-detail-value">{selectedScenario.title_zh}</span>
            </div>
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '英文標題' : 'Title (EN)'}</span>
              <span className="scenario-detail-value">{selectedScenario.title_en}</span>
            </div>
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '階段' : 'Phase'}</span>
              <span className="scenario-detail-value">{selectedScenario.phases ? (isZh ? selectedScenario.phases.title_zh : selectedScenario.phases.title_en) : phaseName(selectedScenario.phase_id)}</span>
            </div>
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '類型' : 'Type'}</span>
              <span className="scenario-detail-value">{selectedScenario.scenario_types ? (isZh ? (selectedScenario.scenario_types.name_zh || selectedScenario.scenario_types.type_code) : (selectedScenario.scenario_types.name_en || selectedScenario.scenario_types.type_code)) : typeName(selectedScenario.type_id)}</span>
            </div>
            {selectedScenario.scenario_types?.component_name && (
              <div className="scenario-detail-item">
                <span className="scenario-detail-label">{isZh ? '前端組件' : 'Component'}</span>
                <span className="scenario-detail-value mono">{selectedScenario.scenario_types.component_name}</span>
              </div>
            )}
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '排序' : 'Order'}</span>
              <span className="scenario-detail-value">{selectedScenario.display_order}</span>
            </div>
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '圖示' : 'Icon'}</span>
              <span className="scenario-detail-value">{selectedScenario.icon_type || '—'}</span>
            </div>
            <div className="scenario-detail-item">
              <span className="scenario-detail-label">{isZh ? '狀態' : 'Status'}</span>
              <span className="scenario-detail-value">{selectedScenario.is_active ? (isZh ? '✅ 啟用' : '✅ Active') : (isZh ? '❌ 停用' : '❌ Inactive')}</span>
            </div>
          </div>

          {/* Story */}
          {(selectedScenario.story_zh || selectedScenario.story_en) && (
            <div className="scenario-detail-text-section">
              <h4>📖 {isZh ? '劇情背景' : 'Story'}</h4>
              <p>{isZh ? selectedScenario.story_zh : selectedScenario.story_en}</p>
            </div>
          )}

          {/* Mission */}
          {(selectedScenario.mission_zh || selectedScenario.mission_en) && (
            <div className="scenario-detail-text-section">
              <h4>🎯 {isZh ? '任務目標' : 'Mission'}</h4>
              <p>{isZh ? selectedScenario.mission_zh : selectedScenario.mission_en}</p>
            </div>
          )}

          {/* Warning */}
          {(selectedScenario.warning_zh || selectedScenario.warning_en) && (
            <div className="scenario-detail-text-section warning-section">
              <h4>⚠️ {isZh ? '教育警示' : 'Warning'}</h4>
              <p>{isZh ? selectedScenario.warning_zh : selectedScenario.warning_en}</p>
            </div>
          )}

          {/* Config Data */}
          {selectedScenario.config_data && Object.keys(selectedScenario.config_data).length > 0 && (
            <div className="scenario-detail-text-section">
              <h4>⚙️ Config Data</h4>
              <pre className="config-json">{JSON.stringify(selectedScenario.config_data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scenarios;