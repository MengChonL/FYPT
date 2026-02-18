import { NavLink } from 'react-router-dom';

const Sidebar = ({ onLogout, language, onToggleLang }) => {
  const isZh = language === 'zh';

  const menuItems = [
    { path: '/', label: isZh ? '📊 儀表板' : '📊 Dashboard' },
    { path: '/users', label: isZh ? '👥 用戶管理' : '👥 Users' },
    { path: '/scenarios', label: isZh ? '🎮 關卡管理' : '🎮 Scenarios' },
    { path: '/reports', label: isZh ? '📄 用戶報告' : '📄 User Reports' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🛡️ {isZh ? '管理面板' : 'Admin Panel'}</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="lang-toggle-btn" onClick={onToggleLang}>
          🌐 {isZh ? 'English' : '中文'}
        </button>
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            🚪 {isZh ? '登出' : 'Logout'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;