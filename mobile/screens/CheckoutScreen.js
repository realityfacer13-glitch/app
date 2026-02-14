import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { placeOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CheckoutScreen({ navigation }) {
  const { token } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const submit = async () => {
    await placeOrder(token, { deliveryAddress, paymentMethod: 'COD' });
    Alert.alert('Success', 'Order placed successfully');
    navigation.navigate('Orders');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text>Payment Method: Cash on Delivery</Text>
      <TextInput
        style={styles.input}
        placeholder="Delivery Address"
        value={deliveryAddress}
        onChangeText={setDeliveryAddress}
      />
      <Button title="Place Order" onPress={submit} disabled={deliveryAddress.length < 5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }
});
