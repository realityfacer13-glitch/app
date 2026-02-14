import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';
import { auth } from '../services/firebase';

export default function LoginScreen() {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const sendOtp = async () => {
    const provider = new PhoneAuthProvider(auth);
    const id = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current);
    setVerificationId(id);
    setMessage('OTP sent successfully');
  };

  const verifyOtp = async () => {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    await signInWithCredential(auth, credential);
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={Constants.expoConfig.extra.firebase}
      />
      <Text style={styles.title}>Kasheer Login</Text>
      <TextInput style={styles.input} placeholder="+919876543210" value={phoneNumber} onChangeText={setPhoneNumber} />
      <Button title="Send OTP" onPress={sendOtp} />
      <TextInput style={styles.input} placeholder="Enter OTP" value={code} onChangeText={setCode} />
      <Button title="Verify OTP" onPress={verifyOtp} disabled={!verificationId} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }
});
