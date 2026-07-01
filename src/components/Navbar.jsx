import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {

  const { token, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <h1 style={styles.logo}>⬡ PRINT3D</h1>
      <div style={styles.links}>
        <Link to="/"       style={styles.link}>Shop</Link>
        <Link to="/orders" style={styles.link}>Orders</Link>
        {token && (
          <Link to="/admin" style={styles.link}>Admin</Link>
        )}
        {token ? (
          <span onClick={handleLogout} style={styles.logout}>Logout</span>
        ) : (
          <Link to="/login" style={styles.link}>Login</Link>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#1a1a1a',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333'
  },
  logo: {
    color: '#00d4aa',
    fontSize: '1.4rem',
    letterSpacing: '2px'
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  },
  link: {
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  logout: {
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
}

export default Navbar