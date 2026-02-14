import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProduct, fetchOrders, fetchProducts, updateOrderStatus } from '../services/api';

const statuses = ['PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', categoryId: '', price: '', unit: '', imageUrl: '', stock: 0 });

  const loadData = async () => {
    const [productsRes, ordersRes] = await Promise.all([fetchProducts(token), fetchOrders(token)]);
    setProducts(productsRes.products);
    setOrders(ordersRes.orders);
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const submitProduct = async (event) => {
    event.preventDefault();
    await createProduct(token, { ...form, price: Number(form.price), stock: Number(form.stock) });
    setForm({ name: '', categoryId: '', price: '', unit: '', imageUrl: '', stock: 0 });
    await loadData();
  };

  return (
    <div className="layout">
      <header>
        <h1>Kasheer Admin</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="card">
        <h2>Add Product</h2>
        <form className="grid" onSubmit={submitProduct}>
          {Object.keys(form).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== 'stock'}
            />
          ))}
          <button type="submit">Save Product</button>
        </form>
      </section>

      <section className="card">
        <h2>Products</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>{`${product.name} - ₹${product.price}`}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Orders</h2>
        {orders.map((order) => (
          <div key={order.id} className="orderRow">
            <p>{`#${order.id.slice(0, 6)} | ₹${order.totalAmount}`}</p>
            <select value={order.status} onChange={(e) => updateOrderStatus(token, order.id, e.target.value)}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>
    </div>
  );
}
