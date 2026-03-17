import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import Patient from './Patient';

export type VisitStatus = 'active' | 'completed' | 'cancelled';

export default class Visit extends Model {
  static table = 'visits';

  static associations = {
    patients: { type: 'belongs_to' as const, key: 'patient_id' },
  };

  @field('patient_id') patientId!: string;
  @field('start_time') startTime!: number;
  @field('end_time') endTime!: number | null;
  @field('duration_min') durationMin!: number | null;
  @field('notes') notes!: string | null;
  @field('status') status!: VisitStatus;
  @field('charge') charge!: number;
  @field('is_paid') isPaid!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('patients', 'patient_id') patient!: Patient;
}
