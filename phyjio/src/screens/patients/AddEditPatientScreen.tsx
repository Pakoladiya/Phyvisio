import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { database, patientsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import PatientFormFields, { PatientFormData } from '../../components/patients/PatientFormFields';
import AppButton from '../../components/common/AppButton';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'AddEditPatient'>;

const EMPTY_FORM: PatientFormData = {
  fullName: '',
  age: '',
  phone: '',
  address: '',
  ailment: '',
  referredBy: '',
  chargePerVisit: '',
  medicalHistory: '',
  prePhysioPhoto: '',
};

export default function AddEditPatientScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const patientId = route.params?.patientId;

  const [form, setForm] = useState<PatientFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [initialised, setInitialised] = useState(false);

  // Load patient data if editing
  React.useEffect(() => {
    if (patientId && !initialised) {
      patientsCollection.find(patientId).then(p => {
        setForm({
          fullName: p.fullName,
          age: String(p.age),
          phone: p.phone,
          address: p.address,
          ailment: p.ailment,
          referredBy: p.referredBy,
          chargePerVisit: String(p.chargePerVisit),
          medicalHistory: p.medicalHistory ?? '',
          prePhysioPhoto: p.prePhysioPhoto ?? '',
        });
        setInitialised(true);
      });
    }
  }, [patientId, initialised]);

  const handleChange = (key: keyof PatientFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets?.[0]?.uri) {
      handleChange('prePhysioPhoto', result.assets[0].uri);
    }
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full Name is required';
    if (!form.age || isNaN(Number(form.age))) return 'Valid Age is required';
    if (!form.phone.trim()) return 'Phone is required';
    if (!form.address.trim()) return 'Address is required';
    if (!form.ailment.trim()) return 'Ailment is required';
    if (!form.chargePerVisit || isNaN(Number(form.chargePerVisit))) return 'Valid charge is required';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    setLoading(true);
    try {
      await database.write(async () => {
        if (patientId) {
          const patient = await patientsCollection.find(patientId);
          await patient.update(record => {
            record.fullName = form.fullName.trim();
            record.age = Number(form.age);
            record.phone = form.phone.trim();
            record.address = form.address.trim();
            record.ailment = form.ailment.trim();
            record.referredBy = form.referredBy.trim();
            record.chargePerVisit = Number(form.chargePerVisit);
            record.medicalHistory = form.medicalHistory || null;
            record.prePhysioPhoto = form.prePhysioPhoto || null;
          });
        } else {
          await patientsCollection.create(record => {
            record.fullName = form.fullName.trim();
            record.age = Number(form.age);
            record.phone = form.phone.trim();
            record.address = form.address.trim();
            record.ailment = form.ailment.trim();
            record.referredBy = form.referredBy.trim();
            record.chargePerVisit = Number(form.chargePerVisit);
            record.medicalHistory = form.medicalHistory || null;
            record.prePhysioPhoto = form.prePhysioPhoto || null;
            record.isActive = true;
          });
        }
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <PatientFormFields
            data={form}
            onChange={handleChange}
            onPickPhoto={handlePickPhoto}
          />
          <AppButton label="Save Patient" onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
});
