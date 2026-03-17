import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { withObservables } from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { patientsCollection } from '../../database';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import PatientListItem from '../../components/patients/PatientListItem';
import type Patient from '../../database/models/Patient';
import type { RootStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  patients: Patient[];
}

function PatientListScreenBase({ patients }: Props) {
  const navigation = useNavigation<NavProp>();
  const [search, setSearch] = useState('');

  const filtered = search
    ? patients.filter(
        p =>
          p.fullName.toLowerCase().includes(search.toLowerCase()) ||
          p.ailment.toLowerCase().includes(search.toLowerCase()),
      )
    : patients;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.searchRow}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PatientListItem
            patient={item}
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditPatient', {})}
      >
        <MaterialCommunityIcons name="plus" size={28} color={Colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const enhance = withObservables([], () => ({
  patients: patientsCollection
    .query(Q.where('is_active', true), Q.sortBy('full_name', Q.asc))
    .observe(),
}));

export default enhance(PatientListScreenBase);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    margin: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 90 },
  empty: { alignItems: 'center', paddingTop: Spacing.xxxl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
