import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { withObservables } from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { patientsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import AppButton from '../../components/common/AppButton';
import { buildWhatsAppMessage, sendWhatsApp, MessageTemplate } from '../../services/whatsappService';
import type Patient from '../../database/models/Patient';

interface Template {
  key: MessageTemplate;
  label: string;
  icon: string;
  color: string;
}

const TEMPLATES: Template[] = [
  { key: 'delay', label: 'Running Late', icon: 'clock-alert', color: Colors.warning },
  { key: 'absence_today', label: 'Absent Today', icon: 'calendar-remove', color: Colors.danger },
  { key: 'absence_tomorrow', label: 'Absent Tomorrow', icon: 'calendar-clock', color: Colors.danger },
  { key: 'appointment_confirm', label: 'Confirm Appointment', icon: 'calendar-check', color: Colors.success },
  { key: 'charges', label: 'Share Charges', icon: 'currency-inr', color: Colors.info },
  { key: 'bill_ready', label: 'Bill Ready', icon: 'receipt', color: '#9B59B6' },
];

interface Props {
  patients: Patient[];
}

function QuickCommScreenBase({ patients }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [delayMinutes, setDelayMinutes] = useState('');
  const [absenceReason, setAbsenceReason] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewText, setPreviewText] = useState('');

  const handlePreview = () => {
    if (!selectedTemplate) return;
    const msg = buildWhatsAppMessage({
      template: selectedTemplate,
      patientName: selectedPatient?.fullName ?? 'Patient',
      phoneNumber: selectedPatient?.phone,
      delayMinutes: delayMinutes ? Number(delayMinutes) : undefined,
      absenceReason: absenceReason || undefined,
    });
    setPreviewText(msg);
    setPreviewVisible(true);
  };

  const handleSend = async () => {
    if (!selectedTemplate) return;
    await sendWhatsApp({
      template: selectedTemplate,
      patientName: selectedPatient?.fullName ?? 'Patient',
      phoneNumber: selectedPatient?.phone,
      delayMinutes: delayMinutes ? Number(delayMinutes) : undefined,
      absenceReason: absenceReason || undefined,
    });
    setPreviewVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Choose Template</Text>
        <View style={styles.templateGrid}>
          {TEMPLATES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.templateCard, selectedTemplate === t.key && styles.templateCardActive]}
              onPress={() => setSelectedTemplate(t.key)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={t.icon} size={28} color={t.color} />
              <Text style={styles.templateLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Select Patient (Optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {patients.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, selectedPatient?.id === p.id && styles.chipActive]}
              onPress={() => setSelectedPatient(prev => prev?.id === p.id ? null : p)}
            >
              <Text style={[styles.chipText, selectedPatient?.id === p.id && styles.chipTextActive]}>
                {p.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Conditional Inputs */}
        {selectedTemplate === 'delay' && (
          <View style={styles.extraInput}>
            <Text style={styles.inputLabel}>Delay (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={delayMinutes}
              onChangeText={setDelayMinutes}
              keyboardType="numeric"
              placeholder="e.g. 15"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        )}

        {(selectedTemplate === 'absence_today' || selectedTemplate === 'absence_tomorrow') && (
          <View style={styles.extraInput}>
            <Text style={styles.inputLabel}>Reason (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={absenceReason}
              onChangeText={setAbsenceReason}
              placeholder="e.g. personal emergency"
              placeholderTextColor={Colors.textLight}
            />
          </View>
        )}

        <AppButton
          label="Preview Message"
          onPress={handlePreview}
          disabled={!selectedTemplate}
          variant="outline"
          style={styles.btn}
        />
        <AppButton
          label="Send via WhatsApp"
          onPress={handleSend}
          disabled={!selectedTemplate}
          style={[styles.btn, { backgroundColor: Colors.whatsapp }]}
        />
      </ScrollView>

      {/* Preview Modal */}
      <Modal visible={previewVisible} animationType="slide" transparent onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Message Preview</Text>
            <ScrollView style={styles.bubble}>
              <Text style={styles.bubbleText} selectable>{previewText}</Text>
            </ScrollView>
            <AppButton
              label="Send via WhatsApp 💬"
              onPress={handleSend}
              style={[styles.btn, { backgroundColor: Colors.whatsapp }]}
            />
            <AppButton
              label="Close"
              onPress={() => setPreviewVisible(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const enhance = withObservables([], () => ({
  patients: patientsCollection.query(Q.where('is_active', true)).observe(),
}));

export default enhance(QuickCommScreenBase);

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
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  templateCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  templateCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  templateLabel: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary, textAlign: 'center' },
  chipScroll: { marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.textPrimary },
  chipTextActive: { color: Colors.surface, fontWeight: '600' },
  extraInput: { marginBottom: Spacing.md },
  inputLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginBottom: 4 },
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.base,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  btn: { marginBottom: Spacing.sm },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Spacing.borderRadius.xl,
    borderTopRightRadius: Spacing.borderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  bubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.md,
    maxHeight: 300,
    marginBottom: Spacing.md,
  },
  bubbleText: { fontSize: 14, color: '#1A2E2E', lineHeight: 22 },
});
