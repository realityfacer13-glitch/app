const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || 'Request failed');
  }
  return payload;
}

export const verifyToken = (idToken) => request('/api/auth/verify', { method: 'POST', body: { idToken } });
export const getCategories = () => request('/api/categories');
export const getProducts = (categoryId) => request(`/api/products${categoryId ? `?categoryId=${categoryId}` : ''}`);
export const getCart = (token) => request('/api/cart', { token });
export const addToCart = (token, body) => request('/api/cart/items', { method: 'POST', token, body });
export const updateCartItem = (token, productId, body) =>
  request(`/api/cart/items/${productId}`, { method: 'PATCH', token, body });
export const removeCartItem = (token, productId) => request(`/api/cart/items/${productId}`, { method: 'DELETE', token });
export const placeOrder = (token, body) => request('/api/orders', { method: 'POST', token, body });
export const getOrders = (token) => request('/api/orders/my', { token });
