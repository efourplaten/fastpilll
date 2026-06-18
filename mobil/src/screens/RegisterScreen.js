import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView, Image } from 'react-native';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [ad, setAd] = useState('');
    const [soyad, setSoyad] = useState('');
    const [email, setEmail] = useState('');
    const [telefon, setTelefon] = useState('');
    const [sifre, setSifre] = useState('');
    const [loading, setLoading] = useState(false);

    const { kayitOl } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!ad || !soyad || !email || !telefon || !sifre) {
            Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
            return;
        }

        setLoading(true);
        try {
            await kayitOl(ad, soyad, email, telefon, sifre);
            // Kayıt başarılı olduğunda otomatik giriş yapılıp haritaya atacak
            // AppNavigator unmounts Register automatically when logged in
        } catch (error) {
            const mesaj = error.response?.data?.hata || 'Kayıt başarısız oldu. Bilgilerinizi kontrol edin.';
            Alert.alert('Kayıt Hatası', mesaj);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Geri Dön Butonu */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.navigate('MainTabs')}
            >
                <Text style={styles.backButtonText}>← Ana Sayfa</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.headerContainer, { alignItems: 'center' }]}>
                <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 120, borderRadius: 30, marginBottom: 15 }} />
                <Text style={styles.headerTitle}>Yeni Hesap Oluştur</Text>
                <Text style={styles.headerSub}>Aramıza hoş geldin!</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput style={styles.input} placeholder="Ad" value={ad} onChangeText={setAd} />
                <TextInput style={styles.input} placeholder="Soyad" value={soyad} onChangeText={setSoyad} />
                <TextInput style={styles.input} placeholder="E-posta Adresi" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Telefon (05...)" value={telefon} onChangeText={setTelefon} keyboardType="phone-pad" />
                <TextInput style={styles.input} placeholder="Şifre" value={sifre} onChangeText={setSifre} secureTextEntry />

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.registerButtonText}>Kayıt Ol</Text>}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BACKGROUND },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.TEXT,
    },
    scrollContent: { flexGrow: 1, paddingTop: 40 },
    headerContainer: { paddingHorizontal: 30, paddingTop: 80, paddingBottom: 30 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: Colors.TEXT },
    headerSub: { fontSize: 16, color: Colors.TEXT_LIGHT, marginTop: 8 },
    formContainer: { flex: 1, paddingHorizontal: 30 },
    input: { backgroundColor: Colors.WHITE, height: 55, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.BORDER, fontSize: 16 },
    registerButton: { backgroundColor: Colors.PRIMARY, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: Colors.PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    registerButtonText: { color: Colors.WHITE, fontSize: 18, fontWeight: 'bold' },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 40 },
    loginText: { color: Colors.TEXT_LIGHT, fontSize: 15 },
    loginLink: { color: Colors.PRIMARY, fontSize: 15, fontWeight: 'bold' },
});

export default RegisterScreen;
