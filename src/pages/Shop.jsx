import { useState, useEffect } from 'react'

function Shop() {
  const [products, setProducts]     = useState([])
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState('')

  // ── Fetch products whenever page or search changes ──────────
  useEffect(() => {
    fetchProducts()
  }, [page, search])

  async function fetchProducts() {
    setLoading(true)
    try {
      let url = `/api/products?page=${page}&size=12`
      if (search) url += `&search=${encodeURIComponent(search)}`
      const res  = await fetch(url)
      const data = await res.json()
      setProducts(data.content)
      setTotalPages(data.totalPages)
    } catch {
      showToast('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    setSearch(searchInput)
    setPage(0)
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  async function orderProduct(productId, productName) {
    const customerName  = prompt('Your name:')
    if (!customerName) return
    const customerEmail = prompt('Your email:')
    if (!customerEmail) return
    const qty = parseInt(prompt(`Quantity for "${productName}":`, '1'))
    if (!qty || qty < 1) return

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: { id: productId },
          quantity: qty,
          customerName,
          customerEmail
        })
      })

      if (!res.ok) {
        const data = await res.json()
        showToast('Error: ' + data.errors?.join(', '))
        return
      }

      showToast(`Order placed for ${productName}!`)
      fetchProducts()
    } catch {
      showToast('Something went wrong.')
    }
  }

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div style={styles.container}>

      {/* ── Search bar ──────────────────────────────────────── */}
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
        />
        <button style={styles.btn} onClick={handleSearch}>Search</button>
        <button style={styles.btnOutline} onClick={clearSearch}>Clear</button>
      </div>

      {/* ── Product grid ────────────────────────────────────── */}
      {loading ? (
        <p style={styles.muted}>Loading...</p>
      ) : products.length === 0 ? (
        <p style={styles.muted}>No products found.</p>
      ) : (
        <div style={styles.grid}>
          {products.map(p => (
            <div key={p.id} style={styles.card}>
              <h3 style={styles.cardTitle}>{p.name}</h3>
              <span style={styles.tag}>{p.material}</span>
              <p style={styles.desc}>{p.description}</p>
              <div style={styles.price}>${p.price.toFixed(2)}</div>
              <div style={p.stock < 10 ? styles.stockLow : styles.stock}>
                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
              </div>
              <button
                style={p.stock === 0 ? styles.btnDisabled : styles.btn}
                disabled={p.stock === 0}
                onClick={() => orderProduct(p.id, p.name)}
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.btnOutline}
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ← Previous
          </button>
          <span style={styles.muted}>Page {page + 1} of {totalPages}</span>
          <button
            style={styles.btnOutline}
            disabled={page === totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Footer admin link ────────────────────────────────── */}
      <footer style={styles.footer}>
        <a href="/login" style={styles.footerLink}>Admin</a>
      </footer>

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && <div style={styles.toast}>{toast}</div>}

    </div>
  )
}

const styles = {
  container:  { maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' },
  searchRow:  { display: 'flex', gap: '0.75rem', marginBottom: '2rem' },
  input: {
    flex: 1, background: '#1a1a1a', border: '1px solid #333',
    color: '#fff', padding: '0.6rem 0.9rem', borderRadius: '6px',
    fontSize: '0.9rem', outline: 'none'
  },
  btn: {
    background: '#00d4aa', color: '#000', border: 'none',
    padding: '0.6rem 1.2rem', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
  },
  btnOutline: {
    background: 'transparent', color: '#00d4aa',
    border: '1px solid #00d4aa44', padding: '0.6rem 1.2rem',
    borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
  },
  btnDisabled: {
    background: '#333', color: '#666', border: 'none',
    padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'not-allowed',
    fontWeight: 'bold', width: '100%'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '1.5rem'
  },
  cardTitle:  { color: '#fff', marginBottom: '0.5rem' },
  tag: {
    display: 'inline-block', background: '#00d4aa22', color: '#00d4aa',
    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px',
    marginBottom: '0.75rem'
  },
  desc:       { color: '#888', fontSize: '0.9rem', marginBottom: '0.75rem' },
  price:      { fontSize: '1.3rem', color: '#00d4aa', fontWeight: 'bold', marginBottom: '0.5rem' },
  stock:      { fontSize: '0.8rem', color: '#666', marginBottom: '1rem' },
  stockLow:   { fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '1rem' },
  muted:      { color: '#555', textAlign: 'center', padding: '2rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
  footer:     { textAlign: 'center', padding: '2rem', marginTop: '3rem', borderTop: '1px solid #1a1a1a' },
  footerLink: { color: '#2a2a2a', fontSize: '0.75rem', textDecoration: 'none' },
  toast: {
    position: 'fixed', bottom: '2rem', right: '2rem',
    background: '#00d4aa', color: '#000', padding: '0.8rem 1.5rem',
    borderRadius: '8px', fontWeight: 'bold', zIndex: 999
  }
}

export default Shop