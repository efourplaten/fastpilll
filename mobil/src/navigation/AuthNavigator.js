import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
const Stack = createStackNavigator();
const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
/*
Bu kod, React Navigation kullanılarak oluşturulmuş bir kimlik doğrulama (Authentication) navigasyon yapısıdır. 
Kullanıcı giriş yapmadığında gösterilecek ekranları yönetir ve LoginScreen ile 
RegisterScreen arasında geçiş yapılmasını sağlar. 
headerShown: false ayarı sayesinde ekranların üst kısmındaki varsayılan navigasyon başlığı gizlenmiştir. 
Böylece kullanıcı giriş ve kayıt ekranları arasında sorunsuz bir şekilde gezinebilir.
*/