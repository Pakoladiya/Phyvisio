import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { patientsCollection, visitsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import Avatar from '../../components/common/Avatar';
import AppButton from '../../components/common/AppButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatDuration } from '../../utils/dateUtils';
import { formatCurrency, formatPhone } from '../../utils/formatUtils';
import { sendWhatsApp } from '../../services/whatsappService';
import type Patient from '../../database/models/Patient';
import type Visit from '../../database/models/Visit';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'PatientDetail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function PatientDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { patientId } = route.params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await patientsCollection.find(patientId);
      const v = await p.visits.query().fetch();
      const sorted = [...v].sort((a, b) => b.startTime - a.startTime).slice(0, 10);
      setPatient(p);
      setVisits(sorted);
      setLoading(false);
    })();
  }, [patientId]);

  if (loading || !patient) return <LoadingSpinner fullScreen />;

  const completedVisits = visits.filter(v => v.status === 'completed');
  const totalSpent = completedVisits.reduce((s, v) => s + v.charge, 0);
  const lastVisit = completedVisits[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <Avatar name={patient.fullName} photoUri={patient.prePhysioPhoto} size={72} showBadge />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{patient.fullName}</Text>
            <Text style={styles.ailment}>{patient.ailment}</Text>
            <Text style={styles.meta}>{patient.age} years · {patient.address}</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${patient.phone}`)}
              style={styles.phoneRow}
            >
              <MaterialCommunityIcons name="phone" size={14} color={Colors.primary} />
              <Text style={styles.phone}>{formatPhone(patient.phone)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completedVisits.length}</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{lastVisit ? formatDate(lastVisit.startTime, 'medium') : '—'}</Text>
            <Text style={styles.statLabel}>Last Visit</Text>
          </View>
        </View>

        {/* Pre-Physio Photo */}
        {patient.prePhysioPhoto ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pre-Physio Photo</Text>
            <Image source={{ uri: patient.prePhysioPhoto }} style={styles.photoThumb} />
          </View>
        ) : null}

        {/* Medical History */}
        {patient.medicalHistory ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical History</Text>
            <Text style={styles.medicalHistory}>{patient.medicalHistory}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actionBtns}>
          <AppButton
            label="▶  Start New Visit"
            onPress={() => navigation.navigate('ActiveVisit', { patientId: patient.id })}
            style={styles.btnHalf}
            fullWidth={false}
          />
          <AppButton
            label="✏  Edit Patient"
            onPress={() => navigation.navigate('AddEditPatient', { patientId: patient.id })}
            variant="outline"
            style={styles.btnHalf}
            fullWidth={false}
          />
        </View>
        <View style={styles.actionBtns}>
          <AppButton
            label="🧾  Generate Bill"
            onPress={() => {
              const now = new Date();
              const from = new Date(now.getFullYear(), now.getMonth(), 1);
              navigation.navigate('BillPreview', {
                patientId: patient.id,
                fromDate: from.getTime(),
                toDate: now.getTime(),
              });
            }}
            variant="outline"
            style={styles.btnHalf}
            fullWidth={false}
          />
          <AppButton
            label="💬  WhatsApp"
            onPress={() =>
              sendWhatsApp({
                template: 'appointment_confirm',
                patientName: patient.fullName,
                phoneNumber: patient.phone,
                visitDate: formatDate(new Date(), 'long'),
              })
            }
            style={[styles.btnHalf, { backgroundColor: Colors.whatsapp }]}
            fullWidth={false}
          />
        </View>

        {/* Visit History */}
        <Text style={styles.sectionTitle}>Visit History</Text>
        {visits.map(v => (
          <View key={v.id} style={styles.visitRow}>
            <View style={styles.visitLeft}>
              <Text style={styles.visitDate}>{formatDate(v.startTime, 'medium')}</Text>
              <Text style={styles.visitMeta}>{formatTime(v.startTime)} · {v.durationMin ? formatDuration(v.durationMin) : '—'}</Text>
            </View>
            <View style={styles.visitRight}>
              <Text style={styles.visitCharge}>{formatCurrency(v.charge)}</Text>
              <View style={[styles.paidBadge, { backgroundColor: v.isPaid ? Colors.success + '20' : Colors.warning + '20' }]}>
                <Text style={[styles.paidText, { color: v.isPaid ? Colors.success : Colors.warning }]}>
                  {v.isPaid ? 'Paid' : 'Unpaid'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  ailment: { fontSize: 14, color: Colors.primary, marginTop: 2 },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  phone: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  photoThumb: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.borderRadius.lg,
    resizeMode: 'cover',
  },
  medicalHistory: {
    fontSize: 14,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  btnHalf: { flex: 1 },
  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  visitLeft: {},
  visitDate: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  visitMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  visitRight: { alignItems: 'flex-end', gap: 4 },
  visitCharge: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  paidBadge: { borderRadius: Spacing.borderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  paidText: { fontSize: 11, fontWeight: '600' },
});
