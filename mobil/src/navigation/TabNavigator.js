import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapScreen from '../screens/MapScreen';
import SearchScreen from '../screens/SearchScreen';
import RezervationsScreen from '../screens/RezervationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Colors from '../constants/colors';


const Tab = createBottomTabNavigator();
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.PRIMARY,
                tabBarInactiveTintColor: Colors.TEXT_LIGHT,
                tabBarStyle: {
                    backgroundColor: Colors.WHITE,
                    borderTopWidth: 1,
                    borderTopColor: Colors.BORDER,
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 0,
                },
            }}
        >
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    tabBarLabel: 'Harita',
                    tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size || 24} color={color} />,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'İlaç Ara',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="pill" size={size || 24} color={color} />,
                }}
            />
            <Tab.Screen
                name="Reservations"
                component={RezervationsScreen}
                options={{
                    tabBarLabel: 'Rezervasyonlar',
                    tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size || 24} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Hesabım',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size || 24} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};
export default TabNavigator;
/*
Bu kod, React Navigation'ın Bottom Tab Navigator yapısını kullanarak uygulamanın alt menü navigasyonunu oluşturur.
 Kullanıcılar Harita, İlaç Ara, Rezervasyonlar ve Profil ekranları arasında alt sekmeler aracılığıyla geçiş yapabilir. 
 Sekmeler için özel renkler, stil ayarları ve emoji tabanlı ikonlar tanımlanmıştır.
  Ayrıca headerShown: false ayarı sayesinde ekranların üst kısmındaki varsayılan başlık gizlenmiştir.
  */