// src/screens/profile/EditProfileScreen.js
// Fitur 5: Edit Profil

import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import ScreenHeader from '../../components/ScreenHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing } from '../../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, updateLocalUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nama tidak boleh kosong');
      return;
    }
    setLoading(true);
    try {
      await authApi.updateProfile({ name: name.trim() });
      updateLocalUser({ name: name.trim() });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal menyimpan', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Profil" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <FormInput label="Email" value={user?.email} editable={false} icon="mail-outline" />
        <FormInput label="Nama Lengkap" value={name} onChangeText={setName} icon="person-outline" />
        <PrimaryButton title="Simpan Perubahan" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
