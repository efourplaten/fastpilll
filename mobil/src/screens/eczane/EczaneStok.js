import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import Colors from '../../constants/colors';
import api from '../../services/api';

const EczaneStok = () => {
    const [stoklar, setStoklar] = useState([]);
    const [loading, setLoading] = useState(true);

    // Güncelleme Modalı için state
    const [guncelleModal, setGuncelleModal] = useState(false);
    const [seciliStok, setSeciliStok] = useState(null);
    const [yeniMiktar, setYeniMiktar] = useState('');
    const [yeniFiyat, setYeniFiyat] = useState('');

    // Yeni İlaç Ekleme Modalı için state
    const [ekleModal, setEkleModal] = useState(false);
    const [yeniIlacAd, setYeniIlacAd] = useState('');
    const [yeniEtkenMadde, setYeniEtkenMadde] = useState('');
    const [yeniFiyatEkle, setYeniFiyatEkle] = useState('');
    const [yeniMiktarEkle, setYeniMiktarEkle] = useState('');

    const fetchStok = async () => {
        try {
            const res = await api.get('/admin/stok');
            setStoklar(res.data.stoklar);
        } catch (error) {
            Alert.alert('Hata', 'Stoklar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStok();
    }, []);

    const stokGuncelle = async () => {
        try {
            await api.patch(`/admin/stok/${seciliStok.id}`, {
                miktar: parseInt(yeniMiktar),
                fiyat: parseFloat(yeniFiyat)
            });
            Alert.alert('Başarılı', 'Stok güncellendi.');
            setGuncelleModal(false);
            fetchStok();
        } catch (error) {
            Alert.alert('Hata', 'Güncelleme başarısız.');
        }
    };



    const yeniIlacEkle = async () => {
        if (!yeniIlacAd || !yeniFiyatEkle || !yeniMiktarEkle) {
            Alert.alert('Uyarı', 'Lütfen İlaç Adı, Fiyat ve Miktar alanlarını doldurun.');
            return;
        }
        try {
            await api.post('/admin/stok', {
                ad: yeniIlacAd,
                etken_madde: yeniEtkenMadde,
                fiyat: parseFloat(yeniFiyatEkle),
                miktar: parseInt(yeniMiktarEkle)
            });
            Alert.alert('Başarılı', 'İlaç başarıyla stoğunuza eklendi.');
            setEkleModal(false);
            setYeniIlacAd('');
            setYeniEtkenMadde('');
            setYeniFiyatEkle('');
            setYeniMiktarEkle('');
            fetchStok();
        } catch (error) {
            const mesaj = error.response?.data?.hata || 'İlaç eklenemedi.';
            Alert.alert('Hata', mesaj);
        }
    };

    if (loading) return <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../../../assets/logo.png')} style={{ width: 45, height: 45, borderRadius: 12, marginRight: 10 }} />
                    <Text style={styles.baslik}>Stoklarım</Text>
                </View>
                <TouchableOpacity style={styles.btnEkle} onPress={() => setEkleModal(true)}>
                    <Text style={styles.btnEkleText}>+ Yeni İlaç Ekle</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={stoklar}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.ilacAdi}>{item.ilac_adi}</Text>
                            <Text style={styles.info}>Miktar: {item.miktar} Adet</Text>
                            <Text style={styles.info}>Fiyat: {item.fiyat} ₺</Text>
                        </View>
                        <TouchableOpacity style={styles.btnDuzenle} onPress={() => {
                            setSeciliStok(item);
                            setYeniMiktar(item.miktar.toString());
                            setYeniFiyat(item.fiyat.toString());
                            setGuncelleModal(true);
                        }}>
                            <Text style={styles.btnDuzenleText}>Düzenle</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* STOK GÜNCELLEME MODALI */}
            <Modal visible={guncelleModal} transparent animationType="slide" hardwareAccelerated={true}>
                <View style={styles.modalBg}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollCenter} keyboardShouldPersistTaps="always">
                            <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{seciliStok?.ilac_adi}</Text>
                        
                        <Text style={styles.label}>Yeni Miktar:</Text>
                        <TextInput style={styles.input} value={yeniMiktar} onChangeText={setYeniMiktar} keyboardType="numeric" />
                        
                        <Text style={styles.label}>Yeni Fiyat (₺):</Text>
                        <TextInput style={styles.input} value={yeniFiyat} onChangeText={setYeniFiyat} keyboardType="numeric" />
                        
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.modalBtnIptal} onPress={() => setGuncelleModal(false)}>
                                <Text style={styles.modalBtnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnKaydet} onPress={stokGuncelle}>
                                <Text style={styles.modalBtnText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* YENİ İLAÇ EKLEME MODALI (MANUEL) */}
            <Modal visible={ekleModal} transparent animationType="slide" hardwareAccelerated={true}>
                <View style={styles.modalBg}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollCenter} keyboardShouldPersistTaps="always">
                            <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Yeni İlaç Ekle</Text>
                        
                        <Text style={styles.label}>İlaç Adı (*):</Text>
                        <TextInput style={styles.input} placeholder="Örn: Parol 500mg" value={yeniIlacAd} onChangeText={setYeniIlacAd} />
                        
                        <Text style={styles.label}>Etken Madde:</Text>
                        <TextInput style={styles.input} placeholder="Örn: Parasetamol" value={yeniEtkenMadde} onChangeText={setYeniEtkenMadde} />

                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style={{flex: 1, marginRight: 5}}>
                                <Text style={styles.label}>Fiyat (₺) (*):</Text>
                                <TextInput style={styles.input} placeholder="0.00" value={yeniFiyatEkle} onChangeText={setYeniFiyatEkle} keyboardType="numeric" />
                            </View>
                            <View style={{flex: 1, marginLeft: 5}}>
                                <Text style={styles.label}>Stok Miktarı (*):</Text>
                                <TextInput style={styles.input} placeholder="Adet" value={yeniMiktarEkle} onChangeText={setYeniMiktarEkle} keyboardType="numeric" />
                            </View>
                        </View>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.modalBtnIptal} onPress={() => setEkleModal(false)}>
                                <Text style={styles.modalBtnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnKaydet} onPress={yeniIlacEkle}>
                                <Text style={styles.modalBtnText}>Ekle</Text>
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
    container: { flex: 1, backgroundColor: Colors.BACKGROUND, padding: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    baslik: { fontSize: 22, fontWeight: 'bold', color: Colors.TEXT },
    btnEkle: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    btnEkleText: { color: Colors.WHITE, fontWeight: 'bold' },
    card: { flexDirection: 'row', backgroundColor: Colors.WHITE, padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1, alignItems: 'center' },
    ilacAdi: { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY, marginBottom: 5 },
    info: { fontSize: 14, color: Colors.TEXT_LIGHT },
    btnDuzenle: { backgroundColor: Colors.WARNING, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    btnDuzenleText: { color: Colors.WHITE, fontWeight: 'bold' },
    
    // Modal Stilleri
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    scrollCenter: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    modalContainer: { backgroundColor: Colors.WHITE, padding: 20, borderRadius: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
    modalBtns: { flexDirection: 'row', justifyContent: 'space-between' },
    modalBtnIptal: { backgroundColor: Colors.TEXT_LIGHT, flex: 1, padding: 12, borderRadius: 8, marginRight: 5, alignItems: 'center' },
    modalBtnKaydet: { backgroundColor: Colors.SUCCESS, flex: 1, padding: 12, borderRadius: 8, marginLeft: 5, alignItems: 'center' },
    modalBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },

    // Arama Stilleri
    aramaContainer: { flexDirection: 'row', alignItems: 'center' },
    btnAra: { backgroundColor: Colors.PRIMARY, padding: 12, borderRadius: 8, marginLeft: 10 },
    aramaSonucCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
    aramaIlacAdi: { flex: 1, fontSize: 15 },
    btnKatalogEkle: { backgroundColor: Colors.SUCCESS, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }
});

export default EczaneStok;
