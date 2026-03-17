import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { formatTime, formatDuration } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatUtils';
import type Visit from '../../database/models/Visit';

interface TodayVisitCardProps {
  visit: Visit;
  patientName: string;
  ailment: string;
  onPress: () => void;
}

const statusConfig = {
  active: { label: 'Active', color: Colors.success },
  completed: { label: 'Done', color: Colors.info },
  cancelled: { label: 'Cancelled', color: Colors.textLight },
};

export default function TodayVisitCard({ visit, patientName, ailment, onPress }: TodayVisitCardProps) {
  const cfg = statusConfig[visit.status] ?? statusConfig.completed;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <Text style={styles.name}>{patientName}</Text>
        <Text style={styles.ailment}>{ailment}</Text>
        <Text style={styles.time}>{formatTime(visit.startTime)}</Text>
        {visit.durationMin ? (
          <Text style={styles.duration}>{formatDuration(visit.durationMin)}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.charge}>{formatCurrency(visit.charge)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  ailment: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  time: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
  duration: { fontSize: 12, color: Colors.textLight },
  right: { alignItems: 'flex-end', gap: 6 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  charge: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});
