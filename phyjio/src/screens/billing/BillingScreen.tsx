import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { withObservables } from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { patientsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import AppButton from '../../components/common/AppButton';
import { exportToExcel, exportToCSV } from '../../services/excelExportService';
import { formatDate } from '../../utils/dateUtils';
import type Patient from '../../database/models/Patient';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  patients: Patient[];
}

function BillingScreenBase({ patients }: Props) {
  const navigation = useNavigation<NavProp>();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [toDate] = useState(() => new Date());
  const [exporting, setExporting] = useState(false);

  const handleGenerateBill = () => {
    if (!selectedPatient) {
      Alert.alert('Select Patient', 'Please select a patient to generate a bill.');
      return;
    }
    navigation.navigate('BillPreview', {
      patientId: selectedPatient.id,
      fromDate: fromDate.getTime(),
      toDate: toDate.getTime(),
    });
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      await exportToExcel({ type: 'all_patients' });
    } catch {
      Alert.alert('Export Error', 'Failed to export Excel file.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportToCSV();
    } catch {
      Alert.alert('Export Error', 'Failed to export CSV file.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Select Patient</Text>
        {patients.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.patientRow, selectedPatient?.id === p.id && styles.patientRowActive]}
            onPress={() => setSelectedPatient(prev => prev?.id === p.id ? null : p)}
            activeOpacity={0.8}
          >
            <Text style={[styles.patientName, selectedPatient?.id === p.id && styles.patientNameActive]}>
              {p.fullName}
            </Text>
            <Text style={styles.ailment}>{p.ailment}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Date Range</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{formatDate(fromDate, 'medium')}</Text>
          </View>
          <Text style={styles.dateSeparator}>→</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{formatDate(toDate, 'medium')}</Text>
          </View>
        </View>

        <AppButton
          label="Generate Bill 🧾"
          onPress={handleGenerateBill}
          style={styles.btn}
        />

        <Text style={styles.sectionTitle}>Export Data</Text>
        <AppButton
          label="Export All to Excel 📊"
          onPress={handleExportAll}
          variant="outline"
          loading={exporting}
          style={styles.btn}
        />
        <AppButton
          label="Export CSV 📄"
          onPress={handleExportCSV}
          variant="outline"
          loading={exporting}
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const enhance = withObservables([], () => ({
  patients: patientsCollection.query(Q.where('is_active', true)).observe(),
}));

export default enhance(BillingScreenBase);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  patientRow: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  patientRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  patientName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  patientNameActive: { color: Colors.primary },
  ailment: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  dateBox: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 12, color: Colors.textSecondary },
  dateValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  dateSeparator: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  btn: { marginBottom: Spacing.sm },
});
