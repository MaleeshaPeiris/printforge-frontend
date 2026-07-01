import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Admin() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  // ── Products state ────────────────────────────────────────
  const [products, setProducts]         = useState([])
  const [productPage, setProductPage]   = useState(0)
  const [productTotalPages, setProductTotalPages] = useState(0)
  const [productSearch, setProductSearch] = useState('')
  const [productSearchInput, setProductSearchInput] = useState('')
  const [editingId, setEditingId]       = useState(null)
  const [editForm, setEditForm]         = useState({})
  const [newProduct, setNewProduct]     = useState({ name: '', description: '', material: '', price: '', stock: '' })
  const [productErrors, setProductErrors] = useState([])

  // ── Orders state ──────────────────────────────────────────
  const [orders, setOrders]             = useState([])
  const [orderPage, setOrderPage]       = useState(0)
  const [orderTotalPages, setOrderTotalPages] = useState(0)
  const [orderSearch, setOrderSearch]   = useState('')
  const [orderSearchInput, setOrderSearchInput] = useState('')

  // ── Shared state ──────────────────────────────────────────
  const [toast, setToast]               = useState('')

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  // ── Fetch products ────────────────────────────────────────
  useEffect(() => {
    fetchProducts()
  }, [productPage, productSearch])

  // ── Fetch orders ──────────────────────────────────────────
  useEffect(() => {
    fetchOrders()
  }, [orderPage, orderSearch])

  // ── Auth headers helper ───────────────────────────────────
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  function handle401(res) {
    if (res.status === 401 || res.status === 403) {
      logout()
      navigate('/login')
      return true
    }
    return false
  }

  // ── Products CRUD ─────────────────────────────────────────
  async function fetchProducts() {
    try {
      let url = `/api/products?page=${productPage}&size=10`
      if (productSearch) url += `&search=${encodeURIComponent(productSearch)}`
      const res  = await fetch(url)
      const data = await res.json()
      setProducts(data.content)
      setProductTotalPages(data.totalPages)
    } catch {
      showToast('Failed to load products.')
    }
  }

  async function addProduct() {
    setProductErrors([])
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      })
      if (handle401(res)) return
      if (!res.ok) {
        const data = await res.json()
        setProductErrors(data.errors || [])
        return
      }
      setNewProduct({ name: '', description: '', material: '', price: '', stock: '' })
      showToast('Product added!')
      fetchProducts()
    } catch {
      showToast('Failed to add product.')
    }
  }

  async function saveProduct(id) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          ...editForm,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock)
        })
      })
      if (handle401(res)) return
      setEditingId(null)
      showToast('Product updated!')
      fetchProducts()
    } catch {
      showToast('Failed to update product.')
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (handle401(res)) return
      showToast('Product deleted.')
      fetchProducts()
    } catch {
      showToast('Failed to delete product.')
    }
  }

  // ── Orders ────────────────────────────────────────────────
  async function fetchOrders() {
    try {
      let url = `/api/orders?page=${orderPage}&size=10`
      if (orderSearch) url += `&search=${encodeURIComponent(orderSearch)}`
      const res  = await fetch(url, { headers: authHeaders() })
      const data = await res.json()
      if (handle401(res)) return
      setOrders(data.content)
      setOrderTotalPages(data.totalPages)
    } catch {
      showToast('Failed to load orders.')
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/orders/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: authHeaders()
      })
      if (handle401(res)) return
      showToast(`Status updated to ${status.replace('_', ' ')}`)
      fetchOrders()
    } catch {
      showToast('Failed to update status.')
    }
  }

  async function deleteOrder(id) {
    if (!confirm('Delete this order?')) return
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      if (handle401(res)) return
      showToast('Order deleted.')
      fetchOrders()
    } catch {
      showToast('Failed to delete order.')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
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

      {/* ══ PRODUCTS SECTION ══════════════════════════════════ */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>PRODUCTS</h2>

        {/* Add product form */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add Product</h3>
          <div style={styles.formRow}>
            {['name', 'description', 'material'].map(field => (
              <input
                key={field}
                style={styles.input}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newProduct[field]}
                onChange={e => setNewProduct({ ...newProduct, [field]: e.target.value })}
              />
            ))}
            <input
              style={styles.input}
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <button style={styles.btn} onClick={addProduct}>Add Product</button>
          </div>
          {productErrors.map((err, i) => (
            <div key={i} style={styles.errorItem}>⚠ {err}</div>
          ))}
        </div>

        {/* Search */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Search products..."
            value={productSearchInput}
            onChange={e => setProductSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setProductSearch(productSearchInput), setProductPage(0))}
          />
          <button style={styles.btn} onClick={() => { setProductSearch(productSearchInput); setProductPage(0) }}>Search</button>
          <button style={styles.btnOutline} onClick={() => { setProductSearchInput(''); setProductSearch(''); setProductPage(0) }}>Clear</button>
        </div>

        {/* Products table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['ID', 'Name', 'Material', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>
                    {editingId === p.id
                      ? <input style={styles.inlineInput} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                      : p.name}
                  </td>
                  <td style={styles.td}>
                    {editingId === p.id
                      ? <input style={styles.inlineInput} value={editForm.material} onChange={e => setEditForm({ ...editForm, material: e.target.value })} />
                      : p.material}
                  </td>
                  <td style={styles.td}>
                    {editingId === p.id
                      ? <input style={styles.inlineInput} type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                      : `$${p.price.toFixed(2)}`}
                  </td>
                  <td style={styles.td}>
                    {editingId === p.id
                      ? <input style={styles.inlineInput} type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                      : p.stock}
                  </td>
                  <td style={styles.td}>
                    {editingId === p.id ? (
                      <>
                        <button style={styles.btnSave} onClick={() => saveProduct(p.id)}>Save</button>
                        <button style={styles.btnDanger} onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={styles.btnEdit} onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, material: p.material, price: p.price, stock: p.stock, description: p.description || '' }) }}>Edit</button>
                        <button style={styles.btnDanger} onClick={() => deleteProduct(p.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product pagination */}
        {productTotalPages > 1 && (
          <div style={styles.pagination}>
            <button style={styles.btnOutline} disabled={productPage === 0} onClick={() => setProductPage(p => p - 1)}>← Previous</button>
            <span style={styles.muted}>Page {productPage + 1} of {productTotalPages}</span>
            <button style={styles.btnOutline} disabled={productPage === productTotalPages - 1} onClick={() => setProductPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </section>

      {/* ══ ORDERS SECTION ════════════════════════════════════ */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>ORDERS</h2>

        {/* Search */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Search by customer name..."
            value={orderSearchInput}
            onChange={e => setOrderSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setOrderSearch(orderSearchInput), setOrderPage(0))}
          />
          <button style={styles.btn} onClick={() => { setOrderSearch(orderSearchInput); setOrderPage(0) }}>Search</button>
          <button style={styles.btnOutline} onClick={() => { setOrderSearchInput(''); setOrderSearch(''); setOrderPage(0) }}>Clear</button>
        </div>

        {/* Orders table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['ID', 'Product', 'Customer', 'Email', 'Qty', 'Status', 'Placed', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(o => (
                  <tr key={o.id}>
                    <td style={styles.td}>{o.id}</td>
                    <td style={styles.td}>{o.product.name}</td>
                    <td style={styles.td}>{o.customerName}</td>
                    <td style={styles.td}>{o.customerEmail}</td>
                    <td style={styles.td}>{o.quantity}</td>
                    <td style={styles.td}>
                      <select
                        style={{ ...styles.statusSelect, ...statusColors[o.status] }}
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                      >
                        {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>{formatDate(o.createdAt)}</td>
                    <td style={styles.td}>
                      <button style={styles.btnDanger} onClick={() => deleteOrder(o.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Order pagination */}
        {orderTotalPages > 1 && (
          <div style={styles.pagination}>
            <button style={styles.btnOutline} disabled={orderPage === 0} onClick={() => setOrderPage(p => p - 1)}>← Previous</button>
            <span style={styles.muted}>Page {orderPage + 1} of {orderTotalPages}</span>
            <button style={styles.btnOutline} disabled={orderPage === orderTotalPages - 1} onClick={() => setOrderPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </section>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  )
}

const styles = {
  container:    { maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' },
  section:      { marginBottom: '3rem' },
  sectionTitle: { fontSize: '1.1rem', letterSpacing: '1px', color: '#fff', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #2a2a2a' },
  formCard:     { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle:    { fontSize: '0.85rem', letterSpacing: '1px', color: '#00d4aa', marginBottom: '1rem', textTransform: 'uppercase' },
  formRow:      { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  searchRow:    { display: 'flex', gap: '0.75rem', marginBottom: '1rem' },
  input: {
    flex: 1, minWidth: '120px', background: '#0f0f0f', border: '1px solid #333',
    color: '#fff', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', outline: 'none'
  },
  inlineInput: {
    background: '#0f0f0f', border: '1px solid #00d4aa66', color: '#fff',
    padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', width: '100%'
  },
  tableWrapper: { overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid #2a2a2a',
    color: '#00d4aa', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase'
  },
  td:           { padding: '0.75rem 1rem', borderBottom: '1px solid #1a1a1a', color: '#ccc' },
  btn: {
    background: '#00d4aa', color: '#000', border: 'none',
    padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
  },
  btnOutline: {
    background: 'transparent', color: '#00d4aa', border: '1px solid #00d4aa44',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
  },
  btnEdit: {
    background: 'transparent', color: '#aaa', border: '1px solid #33333488',
    padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.4rem'
  },
  btnSave: {
    background: 'transparent', color: '#00d4aa', border: '1px solid #00d4aa44',
    padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.4rem'
  },
  btnDanger: {
    background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b44',
    padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
  },
  statusSelect: {
    border: 'none', padding: '0.3rem 0.6rem', borderRadius: '20px',
    fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none',
    textTransform: 'uppercase', letterSpacing: '1px'
  },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' },
  muted:        { color: '#888', fontSize: '0.85rem' },
  errorItem: {
    color: '#ff6b6b', fontSize: '0.82rem', padding: '0.3rem 0.6rem',
    background: '#ff6b6b11', borderLeft: '2px solid #ff6b6b', borderRadius: '3px', marginTop: '0.4rem'
  },
  toast: {
    position: 'fixed', bottom: '2rem', right: '2rem', background: '#00d4aa',
    color: '#000', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', zIndex: 999
  }
}

export default Admin