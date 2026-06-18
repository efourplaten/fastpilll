import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GirisGerekli from '../components/GirisGerekli';
import api from "../services/api"
import Colors from '../constants/colors';
const RezervationsScreen = () => {
    const [rezervasyonlar, setRezervasyonlar] = useState([]);
    const [loading, setloading] = useState(true);
    const { user } = useContext(AuthContext);
    useFocusEffect(
        useCallback(() => {
            if (user) {
                getirRezervasyonlar();
            } else {
                setloading(false);
            }
        }, [user])
    );

    if (!user) {
        return <GirisGerekli mesaj="Rezervasyonlarınızı görmek için giriş yapmalısınız." />;
    }
    const getirRezervasyonlar = async () => {
        setloading(true);
        try {
            const response = await api.get("/rezervasyonlar/benim")
            setRezervasyonlar(response.data.rezervasyonlar || []);
        } catch (error) {
            console.error("Rezervasyonlar getirilirken hata oluştu:", error);
        } finally {
            setloading(false);
        }
    };
    const iptalEt = (id) => {
        Alert.alert(
            "İptal Et",
            "Bu rezervasyonu iptal etmek istediğinizden emin misiniz?",
            [{ text: 'Hayır', style: 'cancel' },
            {
                text: 'İptal Et',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.patch(`/rezervasyonlar/${id}/iptal`);
                        Alert.alert('İptal gerçekleşti!', 'Rezervasyonunuz iptal edildi.');
                        getirRezervasyonlar();
                    } catch (error) {
                        Alert.alert('Hata', 'Rezervasyon iptal edilemedi.');
                    }
                }
            }
            ]
        );
    };

    const durumRengi = (durum) => {
        switch (durum) {
            case 'beklemede': return '#FF9800';
            case 'onaylandi': return Colors.SUCCESS;
            case 'iptal': return Colors.DANGER;
            case 'tamamlandi': return '#2196F3';
            default: return Colors.TEXT_LIGHT;
        }
    };

    const durumMetni = (durum) => {
        switch (durum) {
            case 'beklemede': return 'Beklemede';
            case 'onaylandi': return 'Onaylandı';
            case 'iptal': return 'İptal Edildi';
            case 'tamamlandi': return 'Tamamlandı';
            default: return durum;
        }
    };

    const durumIkonu = (durum) => {
        switch (durum) {
            case 'beklemede': return 'time';
            case 'onaylandi': return 'checkmark-circle';
            case 'iptal': return 'close-circle';
            case 'tamamlandi': return 'checkmark-done-circle';
            default: return 'information-circle';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.ilacAdi}>{item.ilac_adi}</Text>
                <View style={[styles.durumBadge, { backgroundColor: durumRengi(item.durum), flexDirection: 'row', alignItems: 'center' }]}>
                    <Ionicons name={durumIkonu(item.durum)} size={12} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.durumText}>{durumMetni(item.durum)}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name="pill" size={14} color={Colors.TEXT_LIGHT} />
                <Text style={[styles.etkenMadde, { marginBottom: 0, marginLeft: 4 }]}>{item.etken_madde}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="medical" size={14} color={Colors.TEXT} />
                <Text style={[styles.eczaneAdi, { marginBottom: 0, marginLeft: 4 }]}>{item.eczane_adi}</Text>
            </View>
            <Text style={styles.adres}>{item.eczane_adres}</Text>
            <View style={styles.tarihRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.TEXT_LIGHT} />
                    <Text style={[styles.tarih, { marginLeft: 4 }]}>
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={14} color={Colors.TEXT_LIGHT} />
                    <Text style={[styles.tarih, { marginLeft: 4 }]}>
                        Son: {new Date(item.expires_at).toLocaleDateString('tr-TR')}
                    </Text>
                </View>
            </View>
            {item.durum === 'beklemede' && (
                <TouchableOpacity style={styles.iptalButton} onPress={() => iptalEt(item.id)}>
                    <Text style={styles.iptalButtonText}>Rezervasyonu İptal Et</Text>
                </TouchableOpacity>
            )}
        </View>
    );
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Rezervasyonlar yükleniyor...</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../../assets/logo.png')} style={{ width: 50, height: 50, borderRadius: 12, marginRight: 15 }} />
                    <View>
                        <Text style={styles.headerTitle}>Rezervasyonlarım</Text>
                        <Text style={styles.headerSub}>İlaç ayırtmalarınızı buradan takip edin</Text>
                    </View>
                </View>
            </View>
            {rezervasyonlar.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="file-tray-outline" size={50} color={Colors.TEXT_LIGHT} style={{ marginBottom: 15 }} />
                    <Text style={styles.emptyText}>Henüz bir rezervasyonunuz yok.</Text>
                </View>
            ) : (
                <FlatList
                    data={rezervasyonlar}
                    renderItem={renderItem}
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
    listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.WHITE, borderRadius: 14, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: Colors.BORDER,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    ilacAdi: { fontSize: 17, fontWeight: 'bold', color: Colors.TEXT, flex: 1, paddingRight: 10 },
    durumBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    durumText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    etkenMadde: { fontSize: 13, color: Colors.TEXT_LIGHT, marginBottom: 4 },
    eczaneAdi: { fontSize: 14, fontWeight: '600', color: Colors.TEXT, marginBottom: 2 },
    adres: { fontSize: 12, color: Colors.TEXT_LIGHT, marginBottom: 10 },
    tarihRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    tarih: { fontSize: 12, color: Colors.TEXT_LIGHT },
    iptalButton: {
        backgroundColor: Colors.DANGER, paddingVertical: 10,
        borderRadius: 8, alignItems: 'center', marginTop: 5,
    },
    iptalButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.TEXT_LIGHT, fontSize: 15 },
    emptyIcon: { fontSize: 50, marginBottom: 15 },
    emptyText: { fontSize: 16, color: Colors.TEXT_LIGHT, textAlign: 'center' },
});
export default RezervationsScreen;

