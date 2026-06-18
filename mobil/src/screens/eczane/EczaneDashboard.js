import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Colors from '../../constants/colors';
import api from '../../services/api';

const EczaneDashboard = () => {
    const [istatistik, setIstatistik] = useState({ bekleyen: 0, onayli: 0, iptal: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/admin/rezervasyonlar');
                const liste = res.data.rezervasyonlar;
                setIstatistik({
                    bekleyen: liste.filter(r => r.durum === 'beklemede').length,
                    onayli: liste.filter(r => r.durum === 'Onaylandı').length,
                    iptal: liste.filter(r => r.durum === 'iptal' || r.durum === 'İptal').length,
                });
            } catch (error) {
                console.error('Dashboard veri hatası:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Image source={require('../../../assets/logo.png')} style={{ width: 45, height: 45, borderRadius: 12, marginRight: 15 }} />
                <Text style={[styles.baslik, { marginBottom: 0 }]}>Eczane Durum Özeti</Text>
            </View>
            
            <View style={styles.cardContainer}>
                <View style={[styles.card, { borderLeftColor: Colors.WARNING }]}>
                    <Text style={styles.cardTitle}>Bekleyen</Text>
                    <Text style={styles.cardValue}>{istatistik.bekleyen}</Text>
                </View>

                <View style={[styles.card, { borderLeftColor: Colors.SUCCESS }]}>
                    <Text style={styles.cardTitle}>Onaylanan</Text>
                    <Text style={styles.cardValue}>{istatistik.onayli}</Text>
                </View>

                <View style={[styles.card, { borderLeftColor: Colors.DANGER }]}>
                    <Text style={styles.cardTitle}>İptal</Text>
                    <Text style={styles.cardValue}>{istatistik.iptal}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.BACKGROUND, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    baslik: { fontSize: 24, fontWeight: 'bold', color: Colors.TEXT, marginBottom: 20 },
    cardContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    card: {
        flex: 1,
        backgroundColor: Colors.WHITE,
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        borderLeftWidth: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
    },
    cardTitle: { fontSize: 14, color: Colors.TEXT_LIGHT, marginBottom: 5 },
    cardValue: { fontSize: 22, fontWeight: 'bold', color: Colors.TEXT },
});

export default EczaneDashboard;
