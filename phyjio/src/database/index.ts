import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Alert } from 'react-native';
import { schema } from './schema';
import { migrations } from './migrations';
import Patient from './models/Patient';
import Visit from './models/Visit';
import Note from './models/Note';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'phyjio_db',
  jsi: true,
  onSetUpError: error => {
    console.error('Database setup error:', error);
    Alert.alert(
      'Database Error',
      'Failed to initialise the database. Please restart the app. If the problem persists, contact support.',
    );
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Patient, Visit, Note],
});

export const patientsCollection = database.get<Patient>('patients');
export const visitsCollection = database.get<Visit>('visits');
export const notesCollection = database.get<Note>('notes');
