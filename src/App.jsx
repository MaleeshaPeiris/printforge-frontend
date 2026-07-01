import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Shop from './pages/Shop'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Admin from './pages/Admin'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Shop />} />
        <Route path="/orders"  element={<Orders />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/admin"   element={<Admin />} />
      </Routes>
    </>
  )
}

export default App