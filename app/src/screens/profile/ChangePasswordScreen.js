// src/screens/profile/ChangePasswordScreen.js
// Bagian dari Fitur 6: Pengaturan (ubah password)

import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { authApi } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing } from '../../constants/theme';

export default function ChangePasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!oldPassword) next.oldPassword = 'Password lama wajib diisi.';
    if (!newPassword) next.newPassword = 'Password baru wajib diisi.';
    else if (newPassword.length < 6) next.newPassword = 'Password baru minimal 6 karakter.';
    if (newPassword !== confirmPassword) next.confirmPassword = 'Konfirmasi password tidak cocok.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      Alert.alert('Berhasil', 'Password berhasil diubah.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Gagal mengubah password', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Ubah Password" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <FormInput label="Password Lama" value={oldPassword} onChangeText={setOldPassword} secureTextEntry error={errors.oldPassword} icon="lock-closed-outline" />
        <FormInput label="Password Baru" value={newPassword} onChangeText={setNewPassword} secureTextEntry error={errors.newPassword} icon="lock-closed-outline" />
        <FormInput label="Konfirmasi Password Baru" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword} icon="lock-closed-outline" />
        <PrimaryButton title="Simpan Password Baru" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
