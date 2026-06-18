import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import GirisGerekli from '../components/GirisGerekli';
import Colors from '../constants/colors';
import api from '../services/api';

const ProfileScreen = () => {
    const { user, cikisYap, profilGuncelle } = useContext(AuthContext);

    // Profil Modalı
    const [profilModal, setProfilModal] = useState(false);
    const [yeniEmail, setYeniEmail] = useState(user?.email || '');
    const [yeniTelefon, setYeniTelefon] = useState(user?.telefon || '');
    const [profilLoading, setProfilLoading] = useState(false);

    // Şifre Modalı
    const [sifreModal, setSifreModal] = useState(false);
    const [eskiSifre, setEskiSifre] = useState('');
    const [yeniSifre, setYeniSifre] = useState('');
    const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
    const [sifreLoading, setSifreLoading] = useState(false);

    // Kullanıcı giriş yapmamışsa GirisGerekli bileşenini göster
    if (!user) {
        return <GirisGerekli mesaj="Profil bilgilerinizi görmek ve hesap ayarlarınızı yönetmek için giriş yapmalısınız." />;
    }

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await cikisYap();
                    }
                }
            ]
        );
    };

    const profilBilgileriniKaydet = async () => {
        if (!yeniEmail || !yeniTelefon) {
            Alert.alert('Uyarı', 'E-posta ve Telefon alanları boş bırakılamaz.');
            return;
        }
        setProfilLoading(true);
        try {
            const res = await api.put('/auth/profile', { email: yeniEmail, telefon: yeniTelefon });
            await profilGuncelle({ email: res.data.user.email, telefon: res.data.user.telefon });
            Alert.alert('Başarılı', 'İletişim bilgileriniz güncellendi.');
            setProfilModal(false);
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.hata || 'Profil güncellenemedi.');
        } finally {
            setProfilLoading(false);
        }
    };

    const sifreDegistir = async () => {
        if (!eskiSifre || !yeniSifre || !yeniSifreTekrar) {
            Alert.alert('Uyarı', 'Tüm şifre alanlarını doldurmalısınız.');
            return;
        }
        if (yeniSifre !== yeniSifreTekrar) {
            Alert.alert('Uyarı', 'Yeni şifreler birbiriyle eşleşmiyor.');
            return;
        }
        if (yeniSifre.length < 6) {
            Alert.alert('Uyarı', 'Yeni şifreniz en az 6 karakter olmalıdır.');
            return;
        }

        setSifreLoading(true);
        try {
            await api.put('/auth/password', { eskiSifre, yeniSifre });
            Alert.alert('Başarılı', 'Şifreniz güvenli bir şekilde değiştirildi.');
            setSifreModal(false);
            setEskiSifre('');
            setYeniSifre('');
            setYeniSifreTekrar('');
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.hata || 'Şifre değiştirilemedi.');
        } finally {
            setSifreLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, user?.rol === 'eczane' && { paddingTop: 20 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../../assets/logo.png')} style={{ width: 50, height: 50, borderRadius: 12, marginRight: 15 }} />
                    <View>
                        <Text style={styles.headerTitle}>Hesabım</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    {user.ad ? (
                        <Text style={styles.avatarText}>{user.ad.charAt(0).toUpperCase()}</Text>
                    ) : (
                        <Ionicons name="person" size={40} color={Colors.WHITE} />
                    )}
                </View>

                <Text style={styles.userName}>{user.ad} {user.soyad}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{user.telefon}</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuButton} onPress={() => {
                    setYeniEmail(user.email);
                    setYeniTelefon(user.telefon || '');
                    setProfilModal(true);
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="mail-outline" size={22} color={Colors.PRIMARY} style={{ marginRight: 15 }} />
                        <Text style={styles.menuButtonText}>İletişim Bilgilerini Güncelle</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton} onPress={() => setSifreModal(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="lock-closed-outline" size={22} color={Colors.PRIMARY} style={{ marginRight: 15 }} />
                        <Text style={styles.menuButtonText}>Şifre Değiştir</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="log-out-outline" size={22} color={Colors.DANGER} style={{ marginRight: 10 }} />
                    <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
                </View>
            </TouchableOpacity>

            {/* İLETİŞİM BİLGİLERİ MODALI */}
            <Modal visible={profilModal} transparent animationType="slide" hardwareAccelerated={true}>
                <View style={styles.modalBg}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollCenter} keyboardShouldPersistTaps="handled">
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>İletişim Bilgileri</Text>

                                <Text style={styles.label}>E-posta Adresi:</Text>
                                <TextInput style={styles.input} value={yeniEmail} onChangeText={setYeniEmail} keyboardType="email-address" autoCapitalize="none" />

                                <Text style={styles.label}>Telefon Numarası:</Text>
                                <TextInput style={styles.input} value={yeniTelefon} onChangeText={setYeniTelefon} keyboardType="phone-pad" />

                                <View style={styles.modalBtns}>
                                    <TouchableOpacity style={styles.modalBtnIptal} onPress={() => setProfilModal(false)}>
                                        <Text style={styles.modalBtnText}>İptal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalBtnKaydet} onPress={profilBilgileriniKaydet} disabled={profilLoading}>
                                        {profilLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Kaydet</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* ŞİFRE DEĞİŞTİRME MODALI */}
            <Modal visible={sifreModal} transparent animationType="slide" hardwareAccelerated={true}>
                <View style={styles.modalBg}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollCenter} keyboardShouldPersistTaps="handled">
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Şifremi Değiştir</Text>

                                <Text style={styles.label}>Mevcut Şifre (*):</Text>
                                <TextInput style={styles.input} value={eskiSifre} onChangeText={setEskiSifre} secureTextEntry />

                                <Text style={styles.label}>Yeni Şifre (*):</Text>
                                <TextInput style={styles.input} value={yeniSifre} onChangeText={setYeniSifre} secureTextEntry />

                                <Text style={styles.label}>Yeni Şifre Tekrar (*):</Text>
                                <TextInput style={styles.input} value={yeniSifreTekrar} onChangeText={setYeniSifreTekrar} secureTextEntry />

                                <View style={styles.modalBtns}>
                                    <TouchableOpacity style={styles.modalBtnIptal} onPress={() => setSifreModal(false)}>
                                        <Text style={styles.modalBtnText}>İptal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalBtnKaydet} onPress={sifreDegistir} disabled={sifreLoading}>
                                        {sifreLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Kaydet</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: Colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BORDER,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.TEXT,
    },
    card: {
        backgroundColor: Colors.WHITE,
        margin: 20,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 32,
        color: Colors.WHITE,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.TEXT,
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: Colors.TEXT_LIGHT,
        marginBottom: 5,
    },
    userPhone: {
        fontSize: 15,
        color: Colors.TEXT_LIGHT,
    },
    menuContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    menuButton: {
        backgroundColor: Colors.WHITE,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    menuButtonText: {
        fontSize: 16,
        color: Colors.TEXT,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: Colors.WHITE,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.DANGER,
    },
    logoutButtonText: {
        color: Colors.DANGER,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Stilleri
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    scrollCenter: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    modalContainer: { backgroundColor: Colors.WHITE, padding: 20, borderRadius: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: Colors.TEXT },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: Colors.TEXT },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: Colors.BACKGROUND },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modalBtnIptal: { backgroundColor: Colors.TEXT_LIGHT, flex: 1, padding: 12, borderRadius: 8, marginRight: 5, alignItems: 'center' },
    modalBtnKaydet: { backgroundColor: Colors.PRIMARY, flex: 1, padding: 12, borderRadius: 8, marginLeft: 5, alignItems: 'center' },
    modalBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
