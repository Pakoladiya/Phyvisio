import { Model, Query } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import Visit from './Visit';
import Note from './Note';

export default class Patient extends Model {
  static table = 'patients';

  static associations = {
    visits: { type: 'has_many' as const, foreignKey: 'patient_id' },
    notes: { type: 'has_many' as const, foreignKey: 'patient_id' },
  };

  @field('full_name') fullName!: string;
  @field('age') age!: number;
  @field('phone') phone!: string;
  @field('address') address!: string;
  @field('ailment') ailment!: string;
  @field('referred_by') referredBy!: string;
  @field('pre_physio_photo') prePhysioPhoto!: string | null;
  @field('medical_history') medicalHistory!: string | null;
  @field('is_active') isActive!: boolean;
  @field('charge_per_visit') chargePerVisit!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('visits') visits!: Query<Visit>;
  @children('notes') notes!: Query<Note>;
}
