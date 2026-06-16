import { NavLink, useNavigate } from 'react-router-dom';
import { store } from '../store/store';
import { getProfileImageUrl } from '../api/user-profile';
import Avatar from './Avatar';

const NavigationBar = () => {
  const { user, logout } = store();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex shrink-0 items-center gap-1.5">
          <svg className="h-7 w-7 text-teal-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-slate-900">FindNearBy</span>
        </NavLink>

        {/* Center Nav */}
        {user && (
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Feed
            </NavLink>
            {user.profileType === 'FINDER' && (
              <NavLink to="/brokers" className={linkClass}>
                Brokers
              </NavLink>
            )}
            <NavLink to="/conversations" className={linkClass}>
              Conversations
            </NavLink>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-lg bg-teal-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                Sign Up
              </NavLink>
            </>
          )}
          {user && (
            <>
              <div className="flex items-center gap-2">
                <Avatar
                  src={user.profileImageKey ? getProfileImageUrl(user.id) : null}
                  name={user.name}
                  size="sm"
                />
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
