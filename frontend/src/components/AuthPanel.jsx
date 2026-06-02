import { useState } from 'react';

function AuthPanel({ user, authError, onUserSignUp, onUserSignIn, onAdminSignIn }) {
  const [role, setRole] = useState('user');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (role === 'admin') {
      await onAdminSignIn(email, password);
      return;
    }

    if (mode === 'signup') {
      await onUserSignUp(email, password);
      return;
    }

    await onUserSignIn(email, password);
  };

  return (
    <section className="auth-panel">
      <h2>{user?.email ? 'Signed in' : 'Login / Signup'}</h2>
      {user?.email ? (
        <div className="auth-message">
          <p>You are currently signed in as {user.email}.</p>
          <p>Use the navigation to access your complaints or the admin dashboard.</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-toggle-group">
            <button
              type="button"
              className={role === 'user' ? 'active' : ''}
              onClick={() => setRole('user')}
            >
              User
            </button>
            <button
              type="button"
              className={role === 'admin' ? 'active' : ''}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>

          {role === 'user' && (
            <div className="auth-toggle-group">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="name@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter a secure password"
            />
          </label>

          <button type="submit" className="primary">
            {role === 'admin' ? 'Admin Login' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>

          {authError && <div className="error-message">{authError}</div>}

          <p className="auth-help">
            You can still submit reports anonymously without signing in. Sign in to track your own past complaints.
          </p>
        </form>
      )}
    </section>
  );
}

export default AuthPanel;
