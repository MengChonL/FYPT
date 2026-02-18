import { useState, useEffect, useRef, useCallback } from 'react';
import { getUsers, searchUsers, getUserAttempts, deleteUser } from '../api';
import DataTable from '../components/DataTable';

const Users = ({ language }) => {
  const isZh = language === 'zh';
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const debounceTimer = useRef(null);

  const statusLabel = (code) => {
    if (!code) return isZh ? '未開始' : 'Not Started';
    if (code === 'completed') return isZh ? '✅ 已完成' : '✅ Completed';
    return `🔄 ${code}`;
  };

  const columns = [
    { key: 'username', label: isZh ? '用戶名' : 'Username' },
    { key: 'current_scenario_code', label: isZh ? '進度狀態' : 'Status', render: (val) => statusLabel(val) },
    { key: 'preferred_language', label: isZh ? '語言' : 'Language' },
    { key: 'consent_given', label: isZh ? '同意' : 'Consent', render: (val) => val ? '✅' : '❌' },
    { key: 'created_at', label: isZh ? '創建日期' : 'Created At', render: (val) => new Date(val).toLocaleDateString() }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const doSearch = useCallback(async (query) => {
    setSearching(true);
    try {
      const res = query.trim()
        ? await searchUsers(query)
        : await getUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(value), 400);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      doSearch(searchTerm);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const attemptsRes = await getUserAttempts(user.user_id);
      setUserDetails({
        attempts: attemptsRes.data || []
      });
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setUserDetails({ attempts: [] });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const confirmMsg = isZh
      ? `確定要刪除用戶「${selectedUser.username}」及其所有數據嗎？此操作無法撤銷！`
      : `Are you sure you want to delete user "${selectedUser.username}" and all their data? This cannot be undone!`;
    if (!window.confirm(confirmMsg)) return;
    setDeleting(true);
    try {
      await deleteUser(selectedUser.user_id);
      setUsers(prev => prev.filter(u => u.user_id !== selectedUser.user_id));
      setSelectedUser(null);
      setUserDetails(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(isZh ? '刪除失敗：' + error.message : 'Delete failed: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading">{isZh ? '載入用戶中...' : 'Loading users...'}</div>;
  }

  return (
    <div className="users-page">
      <h1>{isZh ? '👥 用戶管理' : '👥 Users Management'}</h1>
      
      <div className="users-content">
        <div className="users-list">
          <div className="users-header-row">
            <h3>{isZh ? '用戶' : 'Users'} ({users.length}){searching && ' 🔍'}</h3>
            <input
              type="text"
              className="users-search-input"
              placeholder={isZh ? '搜尋用戶名' : 'Search by username'}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <DataTable 
            columns={columns} 
            data={users} 
            onRowClick={handleUserClick}
          />
        </div>

        {selectedUser && (
          <div className="user-details">
            <div className="user-details-header">
              <h3>{isZh ? '用戶詳情' : 'User Details'}: {selectedUser.username}</h3>
              <button
                className="delete-user-btn"
                onClick={handleDeleteUser}
                disabled={deleting}
              >
                {deleting ? (isZh ? '刪除中...' : 'Deleting...') : (isZh ? '🗑️ 刪除用戶' : '🗑️ Delete User')}
              </button>
            </div>
            
            {detailsLoading ? (
              <div className="loading">{isZh ? '載入詳情中...' : 'Loading details...'}</div>
            ) : (
              <>
                {/* User Info Summary */}
                <div className="detail-section user-info-grid">
                  <h4>👤 {isZh ? '基本資料' : 'User Info'}</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">{isZh ? '用戶 ID' : 'User ID'}</span>
                      <span className="info-value mono">{selectedUser.user_id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{isZh ? '語言' : 'Language'}</span>
                      <span className="info-value">{selectedUser.preferred_language === 'zh' ? '中文' : 'English'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{isZh ? '進度狀態' : 'Status'}</span>
                      <span className="info-value">{statusLabel(selectedUser.current_scenario_code)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{isZh ? '註冊日期' : 'Registered'}</span>
                      <span className="info-value">{new Date(selectedUser.created_at).toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{isZh ? '同意書' : 'Consent'}</span>
                      <span className="info-value">{selectedUser.consent_given ? '✅' : '❌'}</span>
                    </div>
                  </div>
                </div>

                {/* Attempts Section */}
                <div className="detail-section">
                  <h4>🎯 {isZh ? '嘗試記錄' : 'Attempts'} ({userDetails?.attempts?.length || 0})</h4>
                  {userDetails?.attempts?.length > 0 ? (
                    <ul>
                      {userDetails.attempts.slice(0, 20).map((a, i) => (
                        <li key={i}>
                          {(isZh ? a.scenarios?.title_zh : a.scenarios?.title_en) || a.scenario_id}: 
                          {a.is_success ? ' ✅' : ' ❌'} 
                          ({a.duration_ms ? `${(a.duration_ms / 1000).toFixed(1)}s` : 'N/A'})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{isZh ? '尚無嘗試記錄' : 'No attempts yet'}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;