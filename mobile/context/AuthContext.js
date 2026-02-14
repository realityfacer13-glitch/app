import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { verifyToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);
      if (!nextUser) {
        setToken(null);
        return;
      }

      const idToken = await nextUser.getIdToken();
      await verifyToken(idToken);
      setToken(idToken);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      token,
      logout: () => signOut(auth)
    }),
    [firebaseUser, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
