const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

export const fetchProducts = (token) => request('/api/products', { token });
export const createProduct = (token, body) => request('/api/products', { token, method: 'POST', body });
export const updateProduct = (token, productId, body) => request(`/api/products/${productId}`, { token, method: 'PATCH', body });
export const fetchOrders = (token) => request('/api/orders/admin/all', { token });
export const updateOrderStatus = (token, orderId, status) =>
  request(`/api/orders/admin/${orderId}/status`, { token, method: 'PATCH', body: { status } });
