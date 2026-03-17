import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { withObservables } from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { database, visitsCollection, patientsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import StatsRow from '../../components/dashboard/StatsRow';
import TodayVisitCard from '../../components/dashboard/TodayVisitCard';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatUtils';
import { getStartOfDay, getEndOfDay } from '../../utils/dateUtils';
import type Visit from '../../database/models/Visit';
import type Patient from '../../database/models/Patient';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  todayVisits: Visit[];
  activePatients: Patient[];
}

function DashboardScreenBase({ todayVisits, activePatients }: Props) {
  const navigation = useNavigation<NavProp>();

  const completedToday = todayVisits.filter(v => v.status === 'completed');
  const activeVisit = todayVisits.find(v => v.status === 'active');
  const todayRevenue = completedToday.reduce((s, v) => s + v.charge, 0);

  const patientMap = new Map(activePatients.map(p => [p.id, p]));

  const stats = [
    { label: "Today's Visits", value: String(todayVisits.length) },
    { label: 'Completed', value: String(completedToday.length) },
    { label: 'Total Patients', value: String(activePatients.length) },
    { label: "Today's Revenue", value: formatCurrency(todayRevenue) },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning 👋';
    if (h < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const quickActions = [
    { icon: 'account-plus', label: 'Add Patient', onPress: () => navigation.navigate('AddEditPatient', {}) },
    { icon: 'clipboard-plus', label: 'Log Visit', onPress: () => navigation.navigate('Patients') },
    { icon: 'whatsapp', label: 'Send Message', onPress: () => navigation.navigate('Messages') },
    { icon: 'receipt', label: 'Generate Bill', onPress: () => navigation.navigate('Billing') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.date}>{formatDate(new Date(), 'long')}</Text>
          </View>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddEditPatient', {})}
          >
            <MaterialCommunityIcons name="plus" size={24} color={Colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Active Visit Banner */}
        {activeVisit && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => {
              const p = patientMap.get(activeVisit.patientId);
              if (p) navigation.navigate('ActiveVisit', { patientId: p.id });
            }}
            activeOpacity={0.8}
          >
            <View style={styles.pulsingDot} />
            <Text style={styles.activeBannerText}>
              Visit in progress — {patientMap.get(activeVisit.patientId)?.fullName ?? '...'} → Tap to open
            </Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todayVisits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No visits scheduled today</Text>
            <TouchableOpacity
              style={styles.startVisitBtn}
              onPress={() => navigation.navigate('Patients')}
            >
              <Text style={styles.startVisitBtnText}>Start a Visit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todayVisits.map(visit => {
            const p = patientMap.get(visit.patientId);
            return (
              <TodayVisitCard
                key={visit.id}
                visit={visit}
                patientName={p?.fullName ?? 'Unknown'}
                ailment={p?.ailment ?? ''}
                onPress={() => {
                  if (p) navigation.navigate('PatientDetail', { patientId: p.id });
                }}
              />
            );
          })
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={a.onPress} activeOpacity={0.8}>
              <MaterialCommunityIcons name={a.icon} size={28} color={Colors.primary} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const enhance = withObservables([], () => {
  const now = new Date();
  const startOfDay = getStartOfDay(now).getTime();
  const endOfDay = getEndOfDay(now).getTime();
  return {
    todayVisits: visitsCollection.query(
      Q.where('start_time', Q.gte(startOfDay)),
      Q.where('start_time', Q.lte(endOfDay)),
    ).observe(),
    activePatients: patientsCollection.query(Q.where('is_active', true)).observe(),
  };
});

export default enhance(DashboardScreenBase);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  date: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  activeBannerText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.base,
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  startVisitBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.borderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  startVisitBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 14 },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  actionLabel: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
});
