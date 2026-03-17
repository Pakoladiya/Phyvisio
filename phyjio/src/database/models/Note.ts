import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export type NoteType = 'progress' | 'medical' | 'general';

export default class Note extends Model {
  static table = 'notes';

  static associations = {
    patients: { type: 'belongs_to' as const, key: 'patient_id' },
  };

  @field('patient_id') patientId!: string;
  @field('visit_id') visitId!: string | null;
  @field('content') content!: string;
  @field('note_type') noteType!: NoteType;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
