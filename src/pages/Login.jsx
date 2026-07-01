import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login, token } = useAuth()
  const navigate = useNavigate()

  // already logged in → go straight to admin
  if (token) {
    navigate('/admin')
    return null
  }

  async function handleLogin() {
    if (!username || !password) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        setError('Invalid username or password.')
        return
      }

      const data = await res.json()
      login(data.token)
      navigate('/admin')

    } catch {
      setError('Network error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⬡ PRINT3D</h1>
        <p style={styles.subtitle}>Admin access only</p>

        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="admin"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={loading ? styles.btnDisabled : styles.btn}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '80vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  card: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '380px'
  },
  logo:     { color: '#00d4aa', fontSize: '1.4rem', letterSpacing: '2px', marginBottom: '0.4rem' },
  subtitle: { color: '#555', fontSize: '0.85rem', marginBottom: '2rem' },
  field:    { marginBottom: '1rem' },
  label: {
    display: 'block', fontSize: '0.78rem', color: '#888',
    letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem'
  },
  input: {
    width: '100%', background: '#0f0f0f', border: '1px solid #333',
    color: '#fff', padding: '0.75rem 1rem', borderRadius: '6px',
    fontSize: '0.95rem', outline: 'none'
  },
  error: {
    color: '#ff6b6b', fontSize: '0.85rem', padding: '0.6rem 0.8rem',
    background: '#ff6b6b11', borderLeft: '2px solid #ff6b6b',
    borderRadius: '3px', marginBottom: '1rem'
  },
  btn: {
    width: '100%', background: '#00d4aa', color: '#000', border: 'none',
    padding: '0.8rem', borderRadius: '6px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem'
  },
  btnDisabled: {
    width: '100%', background: '#333', color: '#666', border: 'none',
    padding: '0.8rem', borderRadius: '6px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'not-allowed', marginTop: '1rem'
  }
}

export default Login