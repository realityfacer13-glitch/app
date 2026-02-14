import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/api';

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders(token).then((res) => setOrders(res.orders));
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.bold}>{`Order #${item.id.slice(0, 6)}`}</Text>
            <Text>{`Status: ${item.status}`}</Text>
            <Text>{`Amount: ₹${item.totalAmount}`}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No orders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  bold: { fontWeight: '700' }
});
