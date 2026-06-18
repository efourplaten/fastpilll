import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';

const GirisGerekli = ({ mesaj }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Ionicons name="lock-closed" size={60} color={Colors.TEXT_LIGHT} style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Giriş Yapmalısınız</Text>
            <Text style={styles.mesaj}>{mesaj || 'Bu özelliği kullanmak için giriş yapın.'}</Text>

            <TouchableOpacity
                style={styles.girisButton}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.girisButtonText}>Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.kayitButton}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.kayitButtonText}>Hesap Oluştur</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.BACKGROUND, paddingHorizontal: 30 },
    icon: { fontSize: 60, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: Colors.TEXT, marginBottom: 10 },
    mesaj: { fontSize: 15, color: Colors.TEXT_LIGHT, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
    girisButton: {
        backgroundColor: Colors.PRIMARY, width: '100%', paddingVertical: 14,
        borderRadius: 12, alignItems: 'center', marginBottom: 12,
    },
    girisButtonText: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' },
    kayitButton: {
        backgroundColor: Colors.WHITE, width: '100%', paddingVertical: 14,
        borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.PRIMARY,
    },
    kayitButtonText: { color: Colors.PRIMARY, fontSize: 16, fontWeight: 'bold' },
});

export default GirisGerekli;
