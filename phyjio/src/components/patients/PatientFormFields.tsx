import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import AppInput from '../common/AppInput';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

export interface PatientFormData {
  fullName: string;
  age: string;
  phone: string;
  address: string;
  ailment: string;
  referredBy: string;
  chargePerVisit: string;
  medicalHistory: string;
  prePhysioPhoto: string;
}

interface PatientFormFieldsProps {
  data: PatientFormData;
  onChange: (key: keyof PatientFormData, value: string) => void;
  onPickPhoto: () => void;
}

export default function PatientFormFields({ data, onChange, onPickPhoto }: PatientFormFieldsProps) {
  return (
    <View>
      <AppInput
        label="Full Name *"
        value={data.fullName}
        onChangeText={v => onChange('fullName', v)}
        placeholder="e.g. Ramesh Kumar"
      />
      <AppInput
        label="Age *"
        value={data.age}
        onChangeText={v => onChange('age', v)}
        keyboardType="numeric"
        placeholder="e.g. 68"
      />
      <AppInput
        label="Phone *"
        value={data.phone}
        onChangeText={v => onChange('phone', v)}
        keyboardType="phone-pad"
        placeholder="e.g. 9876543210"
      />
      <AppInput
        label="Address *"
        value={data.address}
        onChangeText={v => onChange('address', v)}
        placeholder="Full address"
        multiline
        style={{ height: 80 }}
      />
      <AppInput
        label="Ailment / Condition *"
        value={data.ailment}
        onChangeText={v => onChange('ailment', v)}
        placeholder="e.g. Post-stroke paralysis"
      />
      <AppInput
        label="Referred By"
        value={data.referredBy}
        onChangeText={v => onChange('referredBy', v)}
        placeholder="e.g. Dr. Sharma"
      />
      <AppInput
        label="Charge Per Visit (₹) *"
        value={data.chargePerVisit}
        onChangeText={v => onChange('chargePerVisit', v)}
        keyboardType="numeric"
        placeholder="e.g. 500"
      />
      <AppInput
        label="Medical History"
        value={data.medicalHistory}
        onChangeText={v => onChange('medicalHistory', v)}
        placeholder="Previous conditions, medications, allergies..."
        multiline
        style={{ height: 100 }}
      />

      <Text style={styles.label}>Pre-Physio Photo</Text>
      <TouchableOpacity style={styles.photoBtn} onPress={onPickPhoto} activeOpacity={0.8}>
        {data.prePhysioPhoto ? (
          <Image source={{ uri: data.prePhysioPhoto }} style={styles.thumb} />
        ) : (
          <Text style={styles.photoBtnText}>📷  Tap to upload photo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  photoBtn: {
    height: 120,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  photoBtnText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
