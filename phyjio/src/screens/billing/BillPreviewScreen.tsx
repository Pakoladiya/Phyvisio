import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { database } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import BillPreviewCard from '../../components/billing/BillPreviewCard';
import AppButton from '../../components/common/AppButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { loadBillData, generateTextBill, shareTextBill, markVisitsPaid } from '../../services/billingService';
import { exportToExcel } from '../../services/excelExportService';
import { sendWhatsApp } from '../../services/whatsappService';
import type { BillData } from '../../services/billingService';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'BillPreview'>;

export default function BillPreviewScreen() {
  const route = useRoute<RouteProps>();
  const { patientId, fromDate, toDate } = route.params;

  const [billData, setBillData] = useState<BillData | null>(null);
  const [billText, setBillText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await loadBillData(patientId, new Date(fromDate), new Date(toDate));
      setBillData(data);
      setBillText(generateTextBill(data));
      setLoading(false);
    })();
  }, [patientId, fromDate, toDate]);

  const handleShare = async () => {
    if (!billData) return;
    setSharing(true);
    try {
      await shareTextBill(billData);
    } catch {
      Alert.alert('Error', 'Failed to share bill.');
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!billData) return;
    await sendWhatsApp({
      template: 'bill_ready',
      patientName: billData.patient.fullName,
      phoneNumber: billData.patient.phone,
      billAmount: billData.totalCharge,
    });
  };

  const handleMarkPaid = async () => {
    if (!billData) return;
    Alert.alert('Mark All Paid', 'Mark all unpaid visits in this bill as paid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Paid',
        onPress: async () => {
          await markVisitsPaid(billData.visits, database);
          Alert.alert('Done', 'All visits marked as paid.');
        },
      },
    ]);
  };

  const handleExportExcel = async () => {
    setSharing(true);
    try {
      await exportToExcel({ type: 'single_patient', patientId });
    } catch {
      Alert.alert('Error', 'Failed to export Excel.');
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <BillPreviewCard text={billText} />
      <View style={styles.actions}>
        <AppButton label="Share Bill 📤" onPress={handleShare} loading={sharing} style={styles.btn} />
        <AppButton
          label="WhatsApp 💬"
          onPress={handleWhatsApp}
          style={[styles.btn, { backgroundColor: Colors.whatsapp }]}
        />
        <AppButton label="Mark All Paid ✅" onPress={handleMarkPaid} variant="outline" style={styles.btn} />
        <AppButton label="Export Excel 📊" onPress={handleExportExcel} variant="outline" loading={sharing} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  actions: {
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  btn: {},
});
