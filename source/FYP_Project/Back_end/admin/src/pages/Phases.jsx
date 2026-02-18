import { useState, useEffect } from 'react';
import { getPhases } from '../api';
import DataTable from '../components/DataTable';

const Phases = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: 'phase_code', label: 'Code' },
    { key: 'title_zh', label: 'Title (ZH)' },
    { key: 'title_en', label: 'Title (EN)' },
    { key: 'display_order', label: 'Order' },
    { key: 'is_active', label: 'Active', render: (val) => val ? '✅' : '❌' }
  ];

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const res = await getPhases();
        setPhases(res.data || []);
      } catch (error) {
        console.error('Failed to fetch phases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhases();
  }, []);

  if (loading) {
    return <div className="loading">Loading phases...</div>;
  }

  return (
    <div className="phases-page">
      <h1>📁 Phases Management</h1>
      <DataTable columns={columns} data={phases} />
    </div>
  );
};

export default Phases;