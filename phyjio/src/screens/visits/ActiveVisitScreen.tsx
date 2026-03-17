import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { database, patientsCollection, visitsCollection } from '../../database';
import { useVisitStore } from '../../store';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatStopwatch } from '../../utils/dateUtils';
import type Patient from '../../database/models/Patient';
import type Visit from '../../database/models/Visit';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'ActiveVisit'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ActiveVisitScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { patientId } = route.params;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visitRecord, setVisitRecord] = useState<Visit | null>(null);
  const [notes, setNotes] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { setActiveVisit, resetTimer } = useVisitStore();

  useEffect(() => {
    (async () => {
      const p = await patientsCollection.find(patientId);
      setPatient(p);

      let createdVisit: Visit | null = null;
      await database.write(async () => {
        createdVisit = await visitsCollection.create(record => {
          record.patientId = patientId;
          record.startTime = Date.now();
          record.status = 'active';
          record.charge = p.chargePerVisit;
          record.isPaid = false;
        });
      });

      if (createdVisit) {
        setVisitRecord(createdVisit);
        setActiveVisit((createdVisit as Visit).id);
      }
      setLoading(false);

      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    })();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [patientId]);

  const endVisit = () => {
    Alert.alert('End Visit', 'Save and end this visit session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End & Save',
        onPress: async () => {
          if (!visitRecord) return;
          if (intervalRef.current) clearInterval(intervalRef.current);
          const endTime = Date.now();
          const durationMin = Math.round(seconds / 60);
          await database.write(async () => {
            await visitRecord.update(record => {
              record.endTime = endTime;
              record.durationMin = durationMin;
              record.status = 'completed';
              record.notes = notes || null;
            });
          });
          resetTimer();
          setActiveVisit(null);
          navigation.navigate('PatientDetail', { patientId });
        },
      },
    ]);
  };

  const cancelVisit = () => {
    Alert.alert('Cancel Visit', 'Cancel this visit? It will be marked as cancelled.', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Cancel Visit',
        style: 'destructive',
        onPress: async () => {
          if (!visitRecord) return;
          if (intervalRef.current) clearInterval(intervalRef.current);
          await database.write(async () => {
            await visitRecord.update(record => {
              record.status = 'cancelled';
            });
          });
          resetTimer();
          setActiveVisit(null);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading || !patient) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Patient Card */}
        <AppCard elevated style={styles.patientCard}>
          <Text style={styles.patientName}>{patient.fullName}</Text>
          <Text style={styles.ailment}>{patient.ailment}</Text>
          <Text style={styles.charge}>₹{patient.chargePerVisit} / visit</Text>
        </AppCard>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Session Duration</Text>
          <Text style={styles.timer}>{formatStopwatch(seconds)}</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.notesLabel}>Session Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Treatment notes, exercises performed, patient response..."
          placeholderTextColor={Colors.textLight}
          multiline
          textAlignVertical="top"
        />

        {/* Actions */}
        <AppButton label="End & Save Visit ✅" onPress={endVisit} style={styles.btn} />
        <AppButton
          label="Cancel Visit ✕"
          onPress={cancelVisit}
          variant="danger"
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  patientCard: { marginBottom: Spacing.base },
  patientName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  ailment: { fontSize: 14, color: Colors.primary, marginTop: 4 },
  charge: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  timerContainer: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.borderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timerLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.sm },
  timer: { fontSize: 54, fontWeight: '700', color: Colors.surface, letterSpacing: 2 },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  liveText: { color: Colors.danger, fontWeight: '700', fontSize: 13 },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    height: 150,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  btn: { marginBottom: Spacing.sm },
});
