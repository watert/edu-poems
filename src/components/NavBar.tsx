import { Link, useLocation } from "react-router";

const navItems = [
  { path: '/edu-poems', label: '古诗', icon: '📖' },
  { path: '/edu-poems/strokes', label: '笔画', icon: '✍️' },
  { path: '/edu-poems/char-quiz', label: '汉字练习', icon: '🎯' },
  { path: '/edu-poems/dizigui', label: '弟子规', icon: '📜' },
];

export function NavBar() {
  const location = useLocation();
  return (
    <nav className="nav-bar">
      <div className="nav-title">🏮 教育诗词</div>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
