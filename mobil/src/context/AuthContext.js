import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenKontrol = async () => {
            try {
                const kayitliToken = await AsyncStorage.getItem('usertoken');
                const kayitliUser = await AsyncStorage.getItem('userData');
                if (kayitliToken && kayitliUser) {
                    setToken(kayitliToken);
                    setUser(JSON.parse(kayitliUser));
                }
            } catch (error) {
                console.error('Token okuma hatası:', error);
            } finally {
                setLoading(false);
            }
        };
        tokenKontrol();
    }, []);

    const girisYap = async (email, sifre) => {
        const response = await api.post('/auth/login', { email, sifre });
        const { token: gelenToken, user: gelenUser } = response.data;
        await AsyncStorage.setItem('usertoken', gelenToken);
        await AsyncStorage.setItem('userData', JSON.stringify(gelenUser));

        setToken(gelenToken);
        setUser(gelenUser);
    };
    const kayitOl = async (ad, soyad, email, telefon, sifre) => {
        await api.post('/auth/register', { ad, soyad, email, telefon, sifre });
        await girisYap(email, sifre);
    };
    const cikisYap = async () => {
        await AsyncStorage.removeItem('usertoken');
        await AsyncStorage.removeItem('userData');
        setToken(null);
        setUser(null);
    };
    
    const profilGuncelle = async (yeniUserVerisi) => {
        const guncelUser = { ...user, ...yeniUserVerisi };
        await AsyncStorage.setItem('userData', JSON.stringify(guncelUser));
        setUser(guncelUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, girisYap, kayitOl, cikisYap, profilGuncelle }}>
            {children}
        </AuthContext.Provider>
    );
};

/*
Bu kod, React Native uygulamasında kullanıcı kimlik doğrulamasını yönetmek için 
oluşturulmuş bir Auth Context yapısıdır. 
Kullanıcının giriş yapmasını, kayıt olmasını ve 
çıkış yapmasını sağlayarak JWT token ve kullanıcı bilgilerini AsyncStorage'da saklar. 
Uygulama açıldığında kayıtlı oturum bilgilerini kontrol eder ve varsa kullanıcıyı otomatik
olarak giriş yapmış kabul eder. Böylece kullanıcı bilgileri ve oturum durumu uygulamanın 
her yerinden AuthContext üzerinden erişilebilir hale gelir.
*/
