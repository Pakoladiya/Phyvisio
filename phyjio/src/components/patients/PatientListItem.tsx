import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from '../common/Avatar';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/formatUtils';
import type Patient from '../../database/models/Patient';

interface PatientListItemProps {
  patient: Patient;
  onPress: () => void;
}

export default function PatientListItem({ patient, onPress }: PatientListItemProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <Avatar name={patient.fullName} photoUri={patient.prePhysioPhoto} size={52} showBadge={patient.isActive} />
      <View style={styles.info}>
        <Text style={styles.name}>{patient.fullName}</Text>
        <Text style={styles.ailment}>{patient.ailment}</Text>
        <Text style={styles.meta}>{patient.age} yrs · Ref: {patient.referredBy}</Text>
      </View>
      <View style={styles.charge}>
        <Text style={styles.chargeText}>{formatCurrency(patient.chargePerVisit)}</Text>
        <Text style={styles.chargeLabel}>/ visit</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  ailment: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  charge: { alignItems: 'flex-end' },
  chargeText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  chargeLabel: { fontSize: 11, color: Colors.textSecondary },
});
