/* global React, ReactDOM */

const { useState, useEffect } = React;
const API_BASE = (typeof window.__API_BASE__ === 'string' && window.__API_BASE__.length)
  ? window.__API_BASE__
  : (location.protocol.startsWith('http') ? '' : 'http://localhost:3000');

function LoginForm({ onSuccess, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Client-only success; no backend call
      await new Promise((r) => setTimeout(r, 300));
      onSuccess({ username });
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign In</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="muted">
        Don't have an account?{' '}
        <button className="link" onClick={() => onSwitch('signup')} disabled={loading}>Sign Up</button>
      </p>
    </div>
  );
}

function SignupForm({ onSuccess, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Create account, then send user to login page
      // Client-only signup; immediately switch to login
      await new Promise((r) => setTimeout(r, 300));
      onSwitch('login');
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={loading} type="submit">
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <p className="muted">
        Already have an account?{' '}
        <button className="link" onClick={() => onSwitch('login')} disabled={loading}>Sign In</button>
      </p>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <div className="nav">
        <h3>Dashboard</h3>
        <div className="spacer" />
        <span className="user">Hello, {user?.username}</span>
        <button onClick={onLogout}>Log Out</button>
      </div>
      <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h4>You've successfully logged into the page.</h4>
        <p>Please remember your ID and passcode.</p>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('login'); // login | signup | dashboard
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (u) => {
    setUser(u);
    setView('dashboard');
  };
  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  return (
    <div className="container" style={{ background: 'transparent' }}>
      {view === 'login' && (
        <LoginForm onSuccess={handleAuthSuccess} onSwitch={setView} />
      )}
      {view === 'signup' && (
        <SignupForm onSuccess={handleAuthSuccess} onSwitch={setView} />
      )}
      {view === 'dashboard' && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
      <style>{`
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .auth-card { width: 100%; max-width: 360px; background: rgba(255,255,255,0.9); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .auth-card h2 { margin: 0 0 12px; color: #0a3d2e; }
        .auth-card .error { background: #ffe5e5; color: #a40000; padding: 8px 10px; border-radius: 8px; margin-bottom: 12px; }
        .auth-card input { width: 100%; padding: 10px 12px; margin: 8px 0; border: 1px solid #c7d2d9; border-radius: 10px; }
        .auth-card button { width: 100%; background: #118a51; color: #fff; border: 0; padding: 10px 12px; border-radius: 10px; cursor: pointer; }
        .auth-card button:disabled { opacity: .6; cursor: not-allowed; }
        .auth-card .muted { font-size: 12px; color: #335; margin-top: 8px; text-align: center; }
        .auth-card .link { background: none; border: none; color: #0b68c7; cursor: pointer; padding: 0; }

        .dashboard { width: 100%; max-width: 1100px; }
        .dashboard .nav { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.95); padding: 12px 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 16px; }
        .dashboard .nav .spacer { flex: 1; }
        .dashboard .nav h3 { margin: 0; color: #0a3d2e; }
        .dashboard .nav .user { color: #0a3d2e; margin-right: 8px; }
        .dashboard .card { background: rgba(255,255,255,0.9); border-radius: 14px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .dashboard .card h4 { margin: 0 0 8px; color: #0a3d2e; }
        .inline.error { margin-bottom: 12px; }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);


