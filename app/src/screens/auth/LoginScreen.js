// src/screens/auth/LoginScreen.js
// Fitur 4: Login

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { getErrorMessage } from '../../api/client';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email wajib diisi.';
    if (!password) next.password = 'Password wajib diisi.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Gagal', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Ionicons name="library" size={56} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Selamat Datang Kembali</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Masuk untuk melanjutkan rak bukumu
          </Text>
        </View>

        <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="email@contoh.com" keyboardType="email-address" icon="mail-outline" error={errors.email} />
        <FormInput label="Password" value={password} onChangeText={setPassword} placeholder="Password kamu" secureTextEntry icon="lock-closed-outline" error={errors.password} />

        <View style={{ marginTop: spacing.sm }}>
          <PrimaryButton title="Masuk" onPress={handleLogin} loading={loading} />
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={{ color: colors.textSecondary }}>
            Belum punya akun? <Text style={{ color: colors.primary, fontWeight: '700' }}>Daftar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl * 2, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: spacing.xl * 1.5 },
  title: { fontSize: fontSize.xl, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, marginTop: 4, textAlign: 'center' },
  registerLink: { alignItems: 'center', marginTop: spacing.lg },
});
