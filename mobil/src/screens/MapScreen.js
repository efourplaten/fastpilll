import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Dimensions, ScrollView, Animated, Linking, Platform, Modal, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import api from '../services/api';
import Colors from '../constants/colors';
const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MIN = 180; // Kartın minimum yüksekliği (kapalıyken)
const BOTTOM_SHEET_MAX = height * 0.55; // Kartın maksimum yüksekliği (açıkken)
// İki koordinat arasındaki mesafeyi hesapla (Haversine formülü - km cinsinden)
const mesafeHesapla = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const MapScreen = () => {
    const [location, setLocation] = useState(null);
    const [eczaneler, setEczaneler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seciliEczane, setSeciliEczane] = useState(null);
    const [panelAcik, setPanelAcik] = useState(false);
    const panelYukseklik = useRef(new Animated.Value(BOTTOM_SHEET_MIN)).current;
    const mapRef = useRef(null);

    // API Verileri
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);

    // Seçim Durumları
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

    // Açık Durumları
    const [openProvince, setOpenProvince] = useState(false);
    const [openDistrict, setOpenDistrict] = useState(false);
    const [openNeighborhood, setOpenNeighborhood] = useState(false);

    // Yeni Mod State'leri
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

    useEffect(() => {
        const konumAl = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Uyarı', 'Haritayı kullanabilmek için konum izni vermelisiniz.');
                    setLoading(false);
                    return;
                }
                let anlikKonum = await Location.getCurrentPositionAsync({});
                const coords = {
                    latitude: anlikKonum.coords.latitude,
                    longitude: anlikKonum.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setLocation(coords);
                setIsSearchMode(false);
                eczaneleriGetir(coords.latitude, coords.longitude);
            } catch (error) {
                Alert.alert('Hata', 'Konum alınamadı.');
                setLoading(false);
            }
        };
        konumAl();

        // İlleri Çek
        fetch('https://turkiyeapi.dev/api/v1/provinces')
            .then(res => res.json())
            .then(data => {
                if (data?.data) {
                    const sorted = data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                    setProvinces(sorted.map(p => ({ label: p.name, value: p.id, data: p })));
                }
            })
            .catch(err => console.error('İller çekilirken hata:', err));

    }, []);

    const handleProvinceChange = (itemValue) => {
        if (!itemValue) return;
        setSelectedDistrict(null);
        setSelectedNeighborhood(null);
        setDistricts([]);
        setNeighborhoods([]);

        fetch(`https://turkiyeapi.dev/api/v1/provinces/${itemValue}`)
            .then(res => res.json())
            .then(data => {
                if (data?.data?.districts) {
                    const sorted = data.data.districts.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                    setDistricts(sorted.map(d => ({ label: d.name, value: d.id, data: d })));
                }
            })
            .catch(err => console.error(err));
    };

    const handleDistrictChange = (itemValue) => {
        if (!itemValue) return;
        setSelectedNeighborhood(null);
        setNeighborhoods([]);

        fetch(`https://turkiyeapi.dev/api/v1/neighborhoods?districtId=${itemValue}&limit=1000`)
            .then(res => res.json())
            .then(data => {
                if (data?.data) {
                    const sorted = data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                    setNeighborhoods(sorted.map(n => ({ label: n.name, value: n.id, data: n })));
                }
            })
            .catch(err => console.error(err));
    };

    const handleNeighborhoodChange = async (itemValue) => {
        if (!itemValue) return;

        const mahalle = neighborhoods.find(n => n.value === itemValue)?.data;
        const ilce = districts.find(d => d.value === selectedDistrict)?.data;
        const il = provinces.find(p => p.value === selectedProvince)?.data;

        if (mahalle && ilce && il) {
            const query = `${mahalle.name} Mahallesi, ${ilce.name}, ${il.name}, Türkiye`;
            try {
                const geocodeResults = await Location.geocodeAsync(query);
                if (geocodeResults.length > 0) {
                    const { latitude, longitude } = geocodeResults[0];
                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude,
                            longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }, 1000);
                    }
                    setLocation({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
                    setIsSearchMode(true);
                    setIsSearchModalVisible(false); // Modal'ı kapat
                    eczaneleriGetir(latitude, longitude);
                } else {
                    Alert.alert('Hata', 'Seçilen mahallenin koordinatları bulunamadı.');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Hata', 'Konum aranırken bir hata oluştu.');
            }
        }
    };

    const eczaneleriGetir = async (lat, lng) => {
        try {
            const response = await api.get('/eczaneler/yakin', {
                params: { lat, lng, yaricap: 5000 }
            });

            // Her eczaneye mesafe bilgisi ekle ve yakından uzağa sırala
            const mesafeli = (response.data.eczaneler || []).map(e => ({
                ...e,
                mesafe: mesafeHesapla(lat, lng, parseFloat(e.latitude), parseFloat(e.longitude))
            })).sort((a, b) => a.mesafe - b.mesafe).map((e, i) => ({ ...e, sira: i + 1 }));

            setEczaneler(mesafeli);
            setTimeout(() => {
                if (mapRef.current && mesafeli.length > 0) {
                    const koordinatlar = mesafeli.slice(0, 3).map(e => ({
                        latitude: parseFloat(e.latitude),
                        longitude: parseFloat(e.longitude),
                    }));
                    koordinatlar.push({ latitude: lat, longitude: lng });

                    mapRef.current.fitToCoordinates(koordinatlar, {
                        edgePadding: { top: 100, right: 80, bottom: 250, left: 80 },
                        animated: true,
                    });
                }
            }, 500);
        } catch (error) {
            console.error('Eczane çekme hatası:', error);
        } finally {
            setLoading(false);
        }
    };
    // Paneli aç/kapat animasyonu
    const panelToggle = () => {
        Animated.spring(panelYukseklik, {
            toValue: panelAcik ? BOTTOM_SHEET_MIN : BOTTOM_SHEET_MAX,
            useNativeDriver: false,
            friction: 8,
        }).start();
        setPanelAcik(!panelAcik);
    };
    // Bir eczaneye tıklanınca haritayı o eczaneye odakla
    const eczaneyeOdaklan = (eczane) => {
        setSeciliEczane(eczane);
        // Paneli kapat
        Animated.spring(panelYukseklik, {
            toValue: BOTTOM_SHEET_MIN,
            useNativeDriver: false,
            friction: 8,
        }).start();
        setPanelAcik(false);
        // Haritayı o eczaneye kaydır ve yakınlaştır
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: parseFloat(eczane.latitude),
                longitude: parseFloat(eczane.longitude),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 1000);
        }
    };

    const yolTarifiAl = (eczane) => {
        const latLng = `${eczane.latitude},${eczane.longitude}`;
        const label = eczane.ad;

        // Cihaz iOS ise Apple Maps, Android ise Google Maps açar
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latLng}`,
            android: `geo:0,0?q=${latLng}(${label})`
        });

        Linking.openURL(url);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Konumunuz bulunuyor...</Text>
            </View>
        );
    }

    const haritayaDon = async () => {
        setIsSearchMode(false);
        setLoading(true);
        try {
            let anlikKonum = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: anlikKonum.coords.latitude,
                longitude: anlikKonum.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setLocation(coords);
            if (mapRef.current) {
                mapRef.current.animateToRegion(coords, 1000);
            }
            eczaneleriGetir(coords.latitude, coords.longitude);
        } catch (e) {
            setLoading(false);
        }
    };

    // Listelenecek eczaneler: Eğer arama modu ise tamamı, değilse en yakın 5
    const listelenecekEczaneler = isSearchMode ? eczaneler : eczaneler.slice(0, 5);

    return (
        <View style={styles.container}>
            {/* HARİTA ÜSTÜ YÜZEN ARAMA BUTONU VE LOGO */}
            <View style={styles.floatingHeader}>
                <Image source={require('../../assets/logo.png')} style={{ width: 50, height: 50, borderRadius: 12, marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                    {isSearchMode ? (
                        <TouchableOpacity style={styles.searchButtonActive} onPress={haritayaDon}>
                            <Ionicons name="close" size={18} color={Colors.WHITE} style={{ marginRight: 5 }} />
                            <Text style={styles.searchButtonActiveText}>Konumuma Dön</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearchModalVisible(true)}>
                            <Ionicons name="search" size={18} color={Colors.TEXT} style={{ marginRight: 5 }} />
                            <Text style={styles.searchButtonText}>Adrese Göre Bul</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ARAMA MODALI */}
            <Modal
                visible={isSearchModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsSearchModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bölge Seçimi</Text>
                            <TouchableOpacity onPress={() => setIsSearchModalVisible(false)}>
                                <Text style={styles.modalCloseText}>İptal</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 15, zIndex: 3000 }}>
                            <DropDownPicker
                                open={openProvince}
                                value={selectedProvince}
                                items={provinces}
                                setOpen={setOpenProvince}
                                setValue={setSelectedProvince}
                                onChangeValue={handleProvinceChange}
                                placeholder="İl Seç"
                                searchable={true}
                                searchPlaceholder="İl Ara..."
                                listMode="MODAL"
                                modalTitle="İl Seçiniz"
                                style={styles.dropdown}
                            />
                        </View>

                        <View style={{ marginBottom: 15, zIndex: 2000 }}>
                            <DropDownPicker
                                open={openDistrict}
                                value={selectedDistrict}
                                items={districts}
                                setOpen={setOpenDistrict}
                                setValue={setSelectedDistrict}
                                onChangeValue={handleDistrictChange}
                                placeholder="İlçe Seç"
                                searchable={true}
                                searchPlaceholder="İlçe Ara..."
                                listMode="MODAL"
                                modalTitle="İlçe Seçiniz"
                                disabled={!selectedProvince}
                                style={styles.dropdown}
                            />
                        </View>

                        <View style={{ marginBottom: 15, zIndex: 1000 }}>
                            <DropDownPicker
                                open={openNeighborhood}
                                value={selectedNeighborhood}
                                items={neighborhoods}
                                setOpen={setOpenNeighborhood}
                                setValue={setSelectedNeighborhood}
                                onChangeValue={handleNeighborhoodChange}
                                placeholder="Mahalle Seç"
                                searchable={true}
                                searchPlaceholder="Mahalle Ara..."
                                listMode="MODAL"
                                modalTitle="Mahalle Seçiniz"
                                disabled={!selectedDistrict}
                                style={styles.dropdown}
                            />
                        </View>
                    </View>
                </View>
            </Modal>


            {/* HARİTA */}
            {location && (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={location}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    clusteringEnabled={false}
                >
                    {(seciliEczane ? [seciliEczane] : listelenecekEczaneler).map((eczane, index) => (
                        <Marker
                            key={eczane.id}
                            coordinate={{
                                latitude: parseFloat(eczane.latitude),
                                longitude: parseFloat(eczane.longitude)
                            }}
                            title={eczane.ad}
                            onPress={() => setSeciliEczane(eczane)}
                            tracksViewChanges={false}
                        >
                            <View style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: eczane.nobetci_mi ? Colors.PRIMARY : Colors.SUCCESS,
                                justifyContent: 'center', alignItems: 'center',
                                borderWidth: 2, borderColor: Colors.WHITE,
                            }}>
                                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>
                                    {eczane.sira}
                                </Text>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}
            {/* SEÇİLİ ECZANE DETAY KARTI (iğneye tıklayınca çıkar) */}
            {seciliEczane && !panelAcik && (
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <Text style={styles.detailTitle}>{seciliEczane.ad}</Text>
                        {seciliEczane.nobetci_mi && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Nöbetçi</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.detailAddress}>{seciliEczane.adres}</Text>
                    {!isSearchMode && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="location" size={14} color={Colors.SUCCESS} />
                            <Text style={[styles.detailDistance, { marginTop: 0, marginLeft: 3 }]}>
                                {seciliEczane.mesafe ? `${seciliEczane.mesafe.toFixed(2)} km uzaklıkta` : ''}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.yolTarifiButton}
                        onPress={() => yolTarifiAl(seciliEczane)}
                    >
                        <Text style={styles.yolTarifiText}>Yol Tarifi Al</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setSeciliEczane(null)}>
                        <Ionicons name="close" size={18} color={Colors.TEXT_LIGHT} />
                    </TouchableOpacity>
                </View>
            )}
            {/* ALT PANEL — EN YAKIN 5 ECZANE LİSTESİ */}
            <Animated.View style={[styles.bottomSheet, { height: panelYukseklik }]}>
                {/* Panel Tutamacı (sürüklenebilir çizgi) */}
                <TouchableOpacity style={styles.handleContainer} onPress={panelToggle} activeOpacity={0.8}>
                    <View style={styles.handle} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.panelTitle}>
                            {panelAcik ? (isSearchMode ? 'Mahalledeki Eczaneler' : 'En Yakın 5 Eczane') : (isSearchMode ? `Mahallede ${listelenecekEczaneler.length} Eczane` : `En Yakın ${listelenecekEczaneler.length} Eczane`)}
                        </Text>
                        {!panelAcik && <Ionicons name="chevron-up" size={18} color={Colors.TEXT} style={{ marginLeft: 5 }} />}
                        {panelAcik && <Ionicons name="chevron-down" size={18} color={Colors.TEXT} style={{ marginLeft: 5 }} />}
                    </View>
                </TouchableOpacity>
                {/* Eczane Listesi */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
                    {listelenecekEczaneler.map((eczane, index) => (
                        <TouchableOpacity
                            key={eczane.id}
                            style={[
                                styles.listItem,
                                seciliEczane?.id === eczane.id && styles.listItemActive
                            ]}
                            onPress={() => eczaneyeOdaklan(eczane)}
                        >
                            {/* Sıra Numarası */}
                            <View style={[
                                styles.rankBadge,
                                eczane.nobetci_mi && { backgroundColor: Colors.PRIMARY }
                            ]}>
                                <Text style={styles.rankText}>{index + 1}</Text>
                            </View>
                            {/* Eczane Bilgileri */}
                            <View style={styles.listItemInfo}>
                                <View style={styles.listItemRow}>
                                    <Text style={styles.listItemName} numberOfLines={1}>{eczane.ad}</Text>
                                    {eczane.nobetci_mi && (
                                        <View style={styles.miniBadge}>
                                            <Text style={styles.miniBadgeText}>Nöbetçi</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.listItemAddress} numberOfLines={1}>{eczane.adres}</Text>
                            </View>
                            {/* Mesafe */}
                            {!isSearchMode && (
                                <Text style={styles.listItemDistance}>
                                    {eczane.mesafe.toFixed(1)} km
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BACKGROUND },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.BACKGROUND },
    loadingText: { marginTop: 15, color: Colors.TEXT_LIGHT, fontSize: 16 },

    // Açılır Menüler
    dropdown: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderWidth: 1,
        borderColor: Colors.BORDER,
        borderRadius: 10,
        height: 46,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
    },

    map: { width: width, height: height },

    // Yüzen Arama Butonu ve Logo
    floatingHeader: {
        position: 'absolute', top: 50, left: 20, right: 20, zIndex: 99,
        flexDirection: 'row', alignItems: 'center'
    },
    searchButton: {
        backgroundColor: Colors.WHITE,
        paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
    searchButtonText: { color: Colors.TEXT, fontSize: 16, fontWeight: 'bold' },
    searchButtonActive: {
        backgroundColor: Colors.PRIMARY,
        paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
    searchButtonActiveText: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' },

    // Modal Stilleri
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: Colors.WHITE,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT },
    modalCloseText: { fontSize: 16, color: Colors.PRIMARY, fontWeight: 'bold' },

    // Seçili eczane detay kartı
    detailCard: {
        position: 'absolute', bottom: BOTTOM_SHEET_MIN + 20, left: 20, right: 20,
        backgroundColor: Colors.WHITE, borderRadius: 15, padding: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
    },
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT, flex: 1 },
    detailAddress: { fontSize: 13, color: Colors.TEXT_LIGHT, marginTop: 5 },
    detailDistance: { fontSize: 13, color: Colors.SUCCESS, fontWeight: '600', marginTop: 4 },
    closeButton: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' },
    yolTarifiButton: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    yolTarifiText: {
        color: Colors.WHITE,
        fontSize: 15,
        fontWeight: 'bold',
    },
    closeButtonText: { fontSize: 14, color: Colors.TEXT_LIGHT, fontWeight: 'bold' },
    // Nöbetçi rozeti
    badge: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    badgeText: { color: Colors.WHITE, fontSize: 11, fontWeight: 'bold' },
    // Alt panel (Bottom Sheet)
    bottomSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.WHITE,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 10,
    },
    handleContainer: { alignItems: 'center', paddingVertical: 12 },
    handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.BORDER, marginBottom: 8 },
    panelTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.TEXT },
    listContainer: { flex: 1, paddingHorizontal: 15 },
    // Liste öğeleri
    listItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 10,
        borderBottomWidth: 1, borderBottomColor: Colors.BORDER,
    },
    listItemActive: { backgroundColor: '#FFF0F0', borderRadius: 10, borderBottomWidth: 0 },
    rankBadge: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: Colors.TEXT_LIGHT, justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    rankText: { color: Colors.WHITE, fontSize: 14, fontWeight: 'bold' },
    listItemInfo: { flex: 1 },
    listItemRow: { flexDirection: 'row', alignItems: 'center' },
    listItemName: { fontSize: 15, fontWeight: '600', color: Colors.TEXT, flex: 1 },
    listItemAddress: { fontSize: 12, color: Colors.TEXT_LIGHT, marginTop: 2 },
    listItemDistance: { fontSize: 14, fontWeight: 'bold', color: Colors.SUCCESS, marginLeft: 10 },
    miniBadge: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
    miniBadgeText: { color: Colors.WHITE, fontSize: 9, fontWeight: 'bold' },
});
export default MapScreen;