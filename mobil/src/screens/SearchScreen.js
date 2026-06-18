import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GirisGerekli from '../components/GirisGerekli';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import Colors from '../constants/colors';

const SearchScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const [aramaMetni, setAramaMetni] = useState('');
    const [sonuclar, setSonuclar] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aramYapildi, setAramYapildi] = useState(false);
    const [seciliIlacId, setSeciliIlacId] = useState(null);
    const [bulunanEczaneler, setBulunanEczaneler] = useState([]);
    const [eczaneLoading, setEczaneLoading] = useState(false);


    const ilacAra = async () => {
        if (!aramaMetni.trim()) {
            Alert.alert('Uyarı', 'Lütfen bir ilaç adı girin.');
            return;
        }

        setLoading(true);
        setAramYapildi(true);
        try {
            const response = await api.get('/ilaclar/ara', {
                params: { q: aramaMetni.trim() }
            });
            setSonuclar(response.data.ilaclar || []);
            setSeciliIlacId(null);
            setBulunanEczaneler([]);
        } catch (error) {
            console.error('Arama hatası:', error);
            Alert.alert('Hata', 'İlaç aranırken bir sorun oluştu.');
            setSonuclar([]);
            setSeciliIlacId(null);
        } finally {
            setLoading(false);
        }
    };

    const rezervasyonOlustur = async (pharmacyId, medicineId, ilacAdi, eczaneAdi) => {
        if (!user) {
            Alert.alert(
                'Giriş Yapmalısınız',
                'İlaç rezerve edebilmek için giriş yapmanız gerekmektedir.',
                [
                    { text: 'İptal', style: 'cancel' },
                    { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        Alert.alert(
            'Rezervasyon',
            `${ilacAdi} ilacını ${eczaneAdi} eczanesinde ayırtmak istiyor musunuz?`,
            [
                { text: 'Hayır', style: 'cancel' },
                {
                    text: 'Evet',
                    onPress: async () => {
                        try {
                            await api.post('/rezervasyonlar/olustur', {
                                pharmacyId,
                                medicineId: seciliIlacId
                            });
                            Alert.alert('Rezervasyonunuz yapıldı!', 'İlaç başarıyla ayırtıldı! Rezervasyonlarım sayfasından takip edebilirsiniz.');
                        } catch (error) {
                            console.error('Rezervasyon hatası:', error);
                            Alert.alert('Hata', 'Rezervasyon oluşturulamadı.');
                        }
                    }
                }
            ]
        );
    };

    const ilacDetayGetir = async (ilacId) => {
        if (seciliIlacId === ilacId) {
            setSeciliIlacId(null);
            return;
        }

        setSeciliIlacId(ilacId);
        setEczaneLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Uyarı', 'Size en yakın eczaneleri bulabilmek için konum iznine ihtiyacımız var.');
                setEczaneLoading(false);
                return;
            }
            let anlikKonum = await Location.getCurrentPositionAsync({});

            const response = await api.get(`/ilaclar/${ilacId}/bulunurluk`, {
                params: {
                    lat: anlikKonum.coords.latitude,
                    lng: anlikKonum.coords.longitude
                }
            });
            setBulunanEczaneler(response.data.eczaneler || []);
        } catch (error) {
            console.error('Eczane bulunurluk hatası:', error);
            Alert.alert('Hata', 'Eczaneler getirilemedi.');
        } finally {
            setEczaneLoading(false);
        }
    };

    const renderSonuc = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, seciliIlacId === item.id && styles.cardActive]}
            activeOpacity={0.8}
            onPress={() => ilacDetayGetir(item.id)}
        >
            <View style={styles.cardTop}>
                <Text style={styles.ilacAdi}>{item.ad}</Text>
                <View style={styles.fiyatBadge}>
                    <Text style={styles.fiyatText}>{item.kategori}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="pill" size={16} color={Colors.TEXT_LIGHT} />
                <Text style={[styles.eczaneAdi, { marginLeft: 5 }]}>Etken Madde: {item.etken_madde}</Text>
            </View>

            {/* Eczane Listesi - Sadece bu ilaç seçildiyse görünür */}
            {seciliIlacId === item.id && (
                <View style={styles.eczaneListContainer}>
                    <Text style={styles.bulunduText}>Bu ilacın bulunduğu en yakın eczaneler:</Text>
                    {eczaneLoading ? (
                        <ActivityIndicator size="small" color={Colors.PRIMARY} style={{ marginVertical: 10 }} />
                    ) : bulunanEczaneler.length === 0 ? (
                        <Text style={styles.noStockText}>Yakınlarda stokta bulunamadı.</Text>
                    ) : (
                        bulunanEczaneler.slice(0, 3).map((eczane) => (
                            <View key={eczane.id} style={styles.eczaneItem}>
                                <View style={styles.eczaneItemTop}>
                                    <Text style={styles.eczaneItemName}>{eczane.ad}</Text>
                                    <Text style={styles.eczaneItemDistance}>
                                        {(eczane.mesafe_metre / 1000).toFixed(2)} km
                                    </Text>
                                </View>
                                <Text style={styles.eczaneItemAddress} numberOfLines={1}>{eczane.adres}</Text>
                                <View style={styles.stokFiyatRow}>
                                    <Text style={styles.stokBadgeText}>Stok: {eczane.miktar}</Text>
                                    <Text style={styles.fiyatBadgeText}>{eczane.fiyat} ₺</Text>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.PRIMARY,
                                        paddingVertical: 8,
                                        borderRadius: 6,
                                        alignItems: 'center',
                                        marginTop: 8,
                                    }}
                                    onPress={() => rezervasyonOlustur(
                                        eczane.id,
                                        item.id,
                                        item.ad,
                                        eczane.ad
                                    )}
                                >
                                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>
                                        Rezerve Et
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Başlık */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../../assets/logo.png')} style={{ width: 50, height: 50, borderRadius: 12, marginRight: 15 }} />
                    <View>
                        <Text style={styles.headerTitle}>İlaç Ara</Text>
                        <Text style={styles.headerSub}>Yakınındaki eczanelerde ilaç bul</Text>
                    </View>
                </View>
            </View>

            {/* Arama Kutusu */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="İlaç adı yazın (örn: Parol)"
                    value={aramaMetni}
                    onChangeText={setAramaMetni}
                    onSubmitEditing={ilacAra}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={ilacAra}>
                    <Text style={styles.searchButtonText}>Ara</Text>
                </TouchableOpacity>
            </View>

            {/* Sonuçlar */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                    <Text style={styles.loadingText}>Aranıyor...</Text>
                </View>
            ) : aramYapildi && sonuclar.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="search" size={50} color={Colors.TEXT_LIGHT} style={{ marginBottom: 15 }} />
                    <Text style={styles.emptyText}>"{aramaMetni}" için sonuç bulunamadı.</Text>
                </View>
            ) : (
                <FlatList
                    data={sonuclar}
                    renderItem={renderSonuc}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BACKGROUND },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.TEXT },
    headerSub: { fontSize: 14, color: Colors.TEXT_LIGHT, marginTop: 4 },
    searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
    searchInput: {
        flex: 1, height: 50, backgroundColor: Colors.WHITE,
        borderRadius: 12, paddingHorizontal: 15, fontSize: 16,
        borderWidth: 1, borderColor: Colors.BORDER, marginRight: 10,
    },
    searchButton: {
        width: 70, height: 50, backgroundColor: Colors.PRIMARY,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    },
    searchButtonText: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.WHITE, borderRadius: 14, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: Colors.BORDER,
    },
    cardActive: {
        borderColor: Colors.PRIMARY,
        borderWidth: 2,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    ilacAdi: { fontSize: 17, fontWeight: 'bold', color: Colors.TEXT, flex: 1, paddingRight: 10 },
    fiyatBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    fiyatText: { color: '#E65100', fontSize: 12, fontWeight: 'bold' },
    eczaneAdi: { fontSize: 13, color: Colors.TEXT_LIGHT },

    eczaneListContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.BORDER,
    },
    bulunduText: { fontSize: 13, fontWeight: 'bold', color: Colors.TEXT, marginBottom: 10 },
    noStockText: { fontSize: 13, color: Colors.DANGER, fontStyle: 'italic' },
    eczaneItem: {
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EFEFEF'
    },
    eczaneItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    eczaneItemName: { fontSize: 14, fontWeight: 'bold', color: Colors.TEXT, flex: 1 },
    eczaneItemDistance: { fontSize: 12, fontWeight: 'bold', color: Colors.PRIMARY },
    eczaneItemAddress: { fontSize: 11, color: Colors.TEXT_LIGHT, marginBottom: 8 },
    stokFiyatRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stokBadgeText: { fontSize: 12, fontWeight: 'bold', color: Colors.SUCCESS },
    fiyatBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },

    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.TEXT_LIGHT, fontSize: 15 },
    emptyIcon: { fontSize: 50, marginBottom: 15 },
    emptyText: { fontSize: 16, color: Colors.TEXT_LIGHT, textAlign: 'center' },
});

export default SearchScreen;
