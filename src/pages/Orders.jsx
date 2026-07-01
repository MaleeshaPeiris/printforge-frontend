import { useState } from 'react'

function Orders() {
  const [email, setEmail]     = useState('')
  const [orders, setOrders]   = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function searchOrders() {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/customer?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setOrders(data)
      setSearched(true)
    } catch {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const statusColors = {
    PENDING:     { background: '#f39c1222', color: '#f39c12' },
    IN_PROGRESS: { background: '#3498db22', color: '#3498db' },
    COMPLETED:   { background: '#00d4aa22', color: '#00d4aa' },
    CANCELLED:   { background: '#ff6b6b22', color: '#ff6b6b' },
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>TRACK YOUR ORDER</h2>

      {/* ── Search bar ──────────────────────────────────────── */}
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchOrders()}
          placeholder="Enter your email address..."
        />
        <button style={styles.btn} onClick={searchOrders}>
          Search
        </button>
      </div>

      {/* ── States ──────────────────────────────────────────── */}
      {loading && <p style={styles.muted}>Loading...</p>}
      {error   && <p style={styles.error}>{error}</p>}

      {!loading && searched && orders.length === 0 && (
        <p style={styles.muted}>No orders found for that email.</p>
      )}

      {/* ── Order cards ─────────────────────────────────────── */}
      {orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(o => (
          <div key={o.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.productName}>{o.product.name}</h3>
              <span style={{ ...styles.status, ...statusColors[o.status] }}>
                {o.status.replace('_', ' ')}
              </span>
            </div>
            <div style={styles.meta}>
              <span>Quantity: <strong>{o.quantity}</strong></span>
              <span>Customer: <strong>{o.customerName}</strong></span>
              <span>Placed: <strong>{formatDate(o.createdAt)}</strong></span>
              <span>Order ID: <strong>#{o.id}</strong></span>
            </div>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container:   { maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' },
  heading:     { fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem', color: '#fff' },
  searchRow:   { display: 'flex', gap: '0.75rem', marginBottom: '2rem' },
  input: {
    flex: 1, background: '#1a1a1a', border: '1px solid #333',
    color: '#fff', padding: '0.75rem 1rem', borderRadius: '6px',
    fontSize: '0.95rem', outline: 'none'
  },
  btn: {
    background: '#00d4aa', color: '#000', border: 'none',
    padding: '0.75rem 1.5rem', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold'
  },
  card: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '1.5rem', marginBottom: '1rem'
  },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  productName: { color: '#fff' },
  status: {
    fontSize: '0.78rem', fontWeight: 'bold', padding: '3px 10px',
    borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
  },
  meta: { display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#888' },
  muted: { color: '#555', textAlign: 'center', padding: '2rem' },
  error: { color: '#ff6b6b', textAlign: 'center', padding: '1rem' }
}

export default Orders