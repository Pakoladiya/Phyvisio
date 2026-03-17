import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'full_name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'phone', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'ailment', type: 'string' },
        { name: 'referred_by', type: 'string' },
        { name: 'pre_physio_photo', type: 'string', isOptional: true },
        { name: 'medical_history', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'charge_per_visit', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'visits',
      columns: [
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'start_time', type: 'number' },
        { name: 'end_time', type: 'number', isOptional: true },
        { name: 'duration_min', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'charge', type: 'number' },
        { name: 'is_paid', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'visit_id', type: 'string', isOptional: true },
        { name: 'content', type: 'string' },
        { name: 'note_type', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
