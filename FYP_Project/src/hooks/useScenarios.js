// src/hooks/useScenarios.js
// 方便取得場景資料的 Hook

import { useState, useEffect } from 'react';
import { getScenarios, getScenario } from '../api';

// 取得所有場景
export const useScenarios = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const data = await getScenarios();
        setScenarios(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  return { scenarios, loading, error };
};

// 取得單一場景
export const useScenario = (scenarioCode) => {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scenarioCode) {
      setLoading(false);
      return;
    }

    const fetchScenario = async () => {
      try {
        const data = await getScenario(scenarioCode);
        setScenario(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [scenarioCode]);

  return { scenario, loading, error };
};

export default useScenarios;
