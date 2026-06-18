import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

import EczaneDashboard from '../screens/eczane/EczaneDashboard';
import EczaneStok from '../screens/eczane/EczaneStok';
import EczaneRezervasyonlar from '../screens/eczane/EczaneRezervasyonlar';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const EczaneTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerTitle: 'Eczane Yönetim Paneli',
                headerStyle: { backgroundColor: Colors.PRIMARY },
                headerTintColor: Colors.WHITE,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Panel') {
                        iconName = focused ? 'storefront' : 'storefront-outline';
                    } else if (route.name === 'Stok Yönetimi') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'Rezervasyonlar') {
                        iconName = focused ? 'clipboard' : 'clipboard-outline';
                    } else if (route.name === 'Hesabım') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size || 24} color={color} />;
                },
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
            })}
        >
            <Tab.Screen name="Panel" component={EczaneDashboard} options={{ title: 'Eczane Paneli' }} />
            <Tab.Screen name="Stok Yönetimi" component={EczaneStok} />
            <Tab.Screen name="Rezervasyonlar" component={EczaneRezervasyonlar} />
            <Tab.Screen name="Hesabım" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default EczaneTabNavigator;
