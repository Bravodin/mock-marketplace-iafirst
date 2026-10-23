import { createContext, useContext, useState, useCallback } from 'react';
import { apiLogin, apiRegister, apiUpdateUser } from '../data/mockApi.js';
import { load, save } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => load('session', null));

  const persist = useCallback((u) => {
    setUser(u);
    save('session', u);
  }, []);

  const login = async (email, senha) => persist(await apiLogin(email, senha));
  const register = async (data) => persist(await apiRegister(data));
  const updateUser = async (changes) => persist(await apiUpdateUser(user.id, changes));
  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
