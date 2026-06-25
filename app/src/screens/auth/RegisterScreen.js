// src/screens/auth/RegisterScreen.js
// Fitur 3: Register

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { getErrorMessage } from '../../api/client';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing, fontSize } from '../../constants/theme';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Nama wajib diisi.';
    if (!email.trim()) next.email = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Format email tidak valid.';
    if (!password) next.password = 'Password wajib diisi.';
    else if (password.length < 6) next.password = 'Password minimal 6 karakter.';
    if (password !== confirmPassword) next.confirmPassword = 'Konfirmasi password tidak cocok.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      // Navigasi otomatis ditangani RootNavigator karena isAuthenticated berubah
    } catch (err) {
      Alert.alert('Registrasi Gagal', getErrorMessage(err));
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
          <Ionicons name="library" size={48} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Buat Akun Baru</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Mulai catat perjalanan membacamu
          </Text>
        </View>

        <FormInput label="Nama Lengkap" value={name} onChangeText={setName} placeholder="Nama kamu" icon="person-outline" error={errors.name} />
        <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="email@contoh.com" keyboardType="email-address" icon="mail-outline" error={errors.email} />
        <FormInput label="Password" value={password} onChangeText={setPassword} placeholder="Minimal 6 karakter" secureTextEntry icon="lock-closed-outline" error={errors.password} />
        <FormInput label="Konfirmasi Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Ulangi password" secureTextEntry icon="lock-closed-outline" error={errors.confirmPassword} />

        <View style={{ marginTop: spacing.sm }}>
          <PrimaryButton title="Daftar" onPress={handleRegister} loading={loading} />
        </View>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: colors.textSecondary }}>
            Sudah punya akun? <Text style={{ color: colors.primary, fontWeight: '700' }}>Masuk</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl * 1.5 },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { fontSize: fontSize.sm, marginTop: 4 },
  loginLink: { alignItems: 'center', marginTop: spacing.lg },
});
