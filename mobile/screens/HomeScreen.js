import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    getCategories().then((res) => setCategories(res.categories));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Products', { category: item })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.row}>
        <Button title="Cart" onPress={() => navigation.navigate('Cart')} />
        <Button title="Orders" onPress={() => navigation.navigate('Orders')} />
        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: '#f8f8f8', padding: 12, borderRadius: 10, marginBottom: 10 },
  cardTitle: { fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between' }
});
