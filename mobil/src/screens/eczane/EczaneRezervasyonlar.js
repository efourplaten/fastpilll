import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import Colors from '../../constants/colors';
import api from '../../services/api';

const EczaneRezervasyonlar = () => {
    const [rezervasyonlar, setRezervasyonlar] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRezervasyonlar = async () => {
        try {
            const res = await api.get('/admin/rezervasyonlar');
            setRezervasyonlar(res.data.rezervasyonlar);
        } catch (error) {
            console.error('Rezervasyon fetch hatası:', error);
            Alert.alert('Hata', 'Rezervasyonlar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRezervasyonlar();
    }, []);

    const onayla = async (id) => {
        try {
            await api.patch(`/admin/rezervasyonlar/${id}/onayla`);
            Alert.alert('Başarılı', 'Rezervasyon onaylandı ve stoktan düşüldü.');
            fetchRezervasyonlar(); // Listeyi yenile
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.hata || 'Onaylama başarısız.');
        }
    };

    const reddet = async (id) => {
        try {
            await api.patch(`/admin/rezervasyonlar/${id}/reddet`);
            Alert.alert('Başarılı', 'Rezervasyon iptal edildi.');
            fetchRezervasyonlar();
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.hata || 'İptal başarısız.');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ flex: 1, justifyContent: 'center' }} />;
    }

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.ilac_adi}</Text>
            <Text style={styles.info}>Müşteri: {item.kullanici_ad} {item.kullanici_soyad}</Text>
            <Text style={styles.info}>Telefon: {item.kullanici_telefon}</Text>
            <Text style={styles.info}>Tarih: {new Date(item.created_at).toLocaleString('tr-TR')}</Text>
            
            <View style={styles.durumContainer}>
                <Text style={styles.durumLabel}>Durum:</Text>
                <Text style={[
                    styles.durum, 
                    item.durum === 'beklemede' && { color: Colors.WARNING },
                    item.durum === 'Onaylandı' && { color: Colors.SUCCESS },
                    (item.durum === 'iptal' || item.durum === 'İptal') && { color: Colors.DANGER }
                ]}>
                    {item.durum.toUpperCase()}
                </Text>
            </View>

            {item.durum === 'beklemede' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.btnReddet]} onPress={() => reddet(item.id)}>
                        <Text style={styles.btnText}>Reddet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.btnOnayla]} onPress={() => onayla(item.id)}>
                        <Text style={styles.btnText}>Onayla</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Image source={require('../../../assets/logo.png')} style={{ width: 45, height: 45, borderRadius: 12, marginRight: 15 }} />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.TEXT }}>Rezervasyonlar</Text>
            </View>
            <FlatList
                data={rezervasyonlar}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>Henüz rezervasyon yok.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BACKGROUND, padding: 15 },
    card: { backgroundColor: Colors.WHITE, padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', color: Colors.PRIMARY, marginBottom: 5 },
    info: { fontSize: 14, color: Colors.TEXT_LIGHT, marginBottom: 3 },
    durumContainer: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
    durumLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.TEXT, marginRight: 5 },
    durum: { fontSize: 14, fontWeight: 'bold' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 },
    button: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
    btnOnayla: { backgroundColor: Colors.SUCCESS },
    btnReddet: { backgroundColor: Colors.DANGER },
    btnText: { color: Colors.WHITE, fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, color: Colors.TEXT_LIGHT, fontSize: 16 }
});

export default EczaneRezervasyonlar;
