import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { withObservables } from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { visitsCollection, patientsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { formatDate, formatTime, formatDuration, getStartOfDay, getEndOfDay, getDateRange } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatUtils';
import type Visit from '../../database/models/Visit';
import type Patient from '../../database/models/Patient';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type DateFilter = 'today' | 'week' | 'month' | 'all';

interface Props {
  visits: Visit[];
  patients: Patient[];
}

function VisitLogScreenBase({ visits, patients }: Props) {
  const navigation = useNavigation<NavProp>();
  const [filter, setFilter] = useState<DateFilter>('today');

  const patientMap = new Map(patients.map(p => [p.id, p]));

  const filtered = visits.filter(v => {
    if (filter === 'all') return true;
    const now = new Date();
    if (filter === 'today') {
      return v.startTime >= getStartOfDay(now).getTime() && v.startTime <= getEndOfDay(now).getTime();
    }
    if (filter === 'week') {
      const { from } = getDateRange(7);
      return v.startTime >= from.getTime();
    }
    if (filter === 'month') {
      const { from } = getDateRange(30);
      return v.startTime >= from.getTime();
    }
    return true;
  });

  const totalRevenue = filtered
    .filter(v => v.status === 'completed')
    .reduce((s, v) => s + v.charge, 0);

  const filterTabs: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'all', label: 'All' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{filtered.length} visits · {formatCurrency(totalRevenue)} revenue</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {filterTabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, filter === t.key && styles.tabActive]}
            onPress={() => setFilter(t.key)}
          >
            <Text style={[styles.tabText, filter === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const p = patientMap.get(item.patientId);
          return (
            <TouchableOpacity
              style={styles.visitCard}
              onPress={() => p && navigation.navigate('PatientDetail', { patientId: p.id })}
              activeOpacity={0.8}
            >
              <View style={styles.visitLeft}>
                <Text style={styles.visitDate}>{formatDate(item.startTime, 'medium')}</Text>
                <Text style={styles.patientName}>{p?.fullName ?? 'Unknown'}</Text>
                <Text style={styles.visitMeta}>
                  {formatTime(item.startTime)}
                  {item.durationMin ? ` · ${formatDuration(item.durationMin)}` : ''}
                </Text>
              </View>
              <View style={styles.visitRight}>
                <Text style={styles.charge}>{formatCurrency(item.charge)}</Text>
                <View style={[styles.badge, { backgroundColor: item.isPaid ? Colors.success + '20' : Colors.warning + '20' }]}>
                  <Text style={[styles.badgeText, { color: item.isPaid ? Colors.success : Colors.warning }]}>
                    {item.isPaid ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor:
                    item.status === 'active' ? Colors.success + '20'
                    : item.status === 'cancelled' ? Colors.danger + '20'
                    : Colors.info + '20',
                }]}>
                  <Text style={[styles.statusText, {
                    color:
                      item.status === 'active' ? Colors.success
                      : item.status === 'cancelled' ? Colors.danger
                      : Colors.info,
                  }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No visits for this period</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const enhance = withObservables([], () => ({
  visits: visitsCollection.query(Q.sortBy('start_time', Q.desc)).observe(),
  patients: patientsCollection.query().observe(),
}));

export default enhance(VisitLogScreenBase);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  summary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  summaryText: { color: Colors.surface, fontWeight: '600', fontSize: 14 },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: { fontSize: 14, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  list: { padding: Spacing.base, paddingBottom: 80 },
  visitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitLeft: { flex: 1 },
  visitDate: { fontSize: 13, color: Colors.textSecondary },
  patientName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  visitMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  visitRight: { alignItems: 'flex-end', gap: 4 },
  charge: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  badge: {
    borderRadius: Spacing.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  statusBadge: {
    borderRadius: Spacing.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
