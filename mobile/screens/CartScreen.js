import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { cart, updateItem, removeItem } = useCart();

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        ListEmptyComponent={<Text>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{`Qty: ${item.quantity} | ₹${item.price}`}</Text>
            <View style={styles.row}>
              <Button title="+" onPress={() => updateItem(item.productId, item.quantity + 1)} />
              <Button title="-" onPress={() => item.quantity > 1 && updateItem(item.productId, item.quantity - 1)} />
              <Button title="Remove" onPress={() => removeItem(item.productId)} />
            </View>
          </View>
        )}
      />
      <Text style={styles.total}>{`Total: ₹${cart.total || 0}`}</Text>
      <Button title="Checkout" onPress={() => navigation.navigate('Checkout')} disabled={!cart.items.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  name: { fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  total: { fontSize: 20, fontWeight: 'bold' }
});
