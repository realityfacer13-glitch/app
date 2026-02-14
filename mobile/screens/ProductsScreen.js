import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductsScreen({ route, navigation }) {
  const category = route.params?.category;
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    getProducts(category?.id).then((res) => setProducts(res.products));
  }, [category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category?.name || 'Products'}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>{`₹${item.price} / ${item.unit}`}</Text>
            <Button title="Add to Cart" onPress={() => addItem(item.id)} />
          </View>
        )}
      />
      <Button title="Go to Cart" onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontWeight: '700', marginBottom: 4 }
});
