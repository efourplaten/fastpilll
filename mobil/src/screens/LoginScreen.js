import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import Colors from '../constants/colors';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('hasta'); // 'hasta' veya 'eczane'

    const { girisYap } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !sifre) {
            Alert.alert('Uyarı', 'Lütfen e-posta ve şifrenizi girin.');
            return;
        }

        setLoading(true);
        try {
            await girisYap(email, sifre);
            // navigation.goBack() is no longer needed because AppNavigator unmounts Login automatically
        } catch (error) {
            const mesaj = error.response?.data?.hata || 'Giriş başarısız oldu. Bilgilerinizi kontrol edin.';
            Alert.alert('Giriş Hatası', mesaj);
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

            <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo.png')} style={{ width: 150, height: 150, borderRadius: 30, marginBottom: 15 }} />
                <Text style={styles.subText}>En Yakın Eczane Cebinde</Text>
            </View>

            <View style={styles.formContainer}>
                
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'hasta' && styles.activeTab]}
                        onPress={() => setActiveTab('hasta')}
                    >
                        <Text style={[styles.tabText, activeTab === 'hasta' && styles.activeTabText]}>Hasta Girişi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'eczane' && styles.activeTab]}
                        onPress={() => setActiveTab('eczane')}
                    >
                        <Text style={[styles.tabText, activeTab === 'eczane' && styles.activeTabText]}>Eczane Girişi</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder={activeTab === 'hasta' ? "E-posta Adresi" : "Eczane E-posta"}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Şifre"
                    value={sifre}
                    onChangeText={setSifre}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    )}
                </TouchableOpacity>

                {activeTab === 'hasta' && (
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Hesabın yok mu? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Hemen Kayıt Ol</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND,
    },
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
    logoContainer: {
        flex: 0.35,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 30,
    },
    logoText: {
        fontSize: 46,
        fontWeight: 'bold',
        color: Colors.PRIMARY,
    },
    subText: {
        fontSize: 16,
        color: Colors.TEXT_LIGHT,
        marginTop: 5,
    },
    formContainer: {
        flex: 0.65,
        paddingHorizontal: 30,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: Colors.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    tabText: {
        fontSize: 15,
        color: Colors.TEXT_LIGHT,
        fontWeight: '600',
    },
    activeTabText: {
        color: Colors.PRIMARY,
    },
    input: {
        backgroundColor: Colors.WHITE,
        height: 55,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: Colors.PRIMARY,
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, 
    },
    loginButtonText: {
        color: Colors.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    registerText: {
        color: Colors.TEXT_LIGHT,
        fontSize: 15,
    },
    registerLink: {
        color: Colors.PRIMARY,
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
