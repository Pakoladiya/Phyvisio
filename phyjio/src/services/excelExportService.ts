import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as XLSX from 'xlsx';
import { Q } from '@nozbe/watermelondb';
import { formatDate, formatTime, formatDuration } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';

export interface ExportOptions {
  type: 'all_patients' | 'single_patient' | 'visits_range';
  patientId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export async function exportToExcel(options: ExportOptions): Promise<void> {
  const { patientsCollection, visitsCollection } = await import('../database');

  // Fetch data
  let patients = await patientsCollection.query().fetch();
  if (options.type === 'single_patient' && options.patientId) {
    patients = patients.filter(p => p.id === options.patientId);
  }

  let allVisits = await visitsCollection.query(Q.sortBy('start_time', Q.desc)).fetch();
  if (options.patientId) {
    allVisits = allVisits.filter(v => v.patientId === options.patientId);
  }
  if (options.fromDate) {
    allVisits = allVisits.filter(v => v.startTime >= options.fromDate!.getTime());
  }
  if (options.toDate) {
    allVisits = allVisits.filter(v => v.startTime <= options.toDate!.getTime());
  }

  const patientMap = new Map(patients.map(p => [p.id, p]));

  // Sheet 1: Patients
  const patientRows = patients.map(p => ({
    'Patient Name': p.fullName,
    Age: p.age,
    Phone: p.phone,
    Address: p.address,
    Ailment: p.ailment,
    'Referred By': p.referredBy,
    'Charge/Visit': p.chargePerVisit,
    'Medical History': p.medicalHistory ?? '',
    Status: p.isActive ? 'Active' : 'Inactive',
    'Registered On': formatDate(p.createdAt, 'short'),
  }));

  // Sheet 2: Visit Log
  const visitRows = allVisits.map(v => {
    const p = patientMap.get(v.patientId);
    return {
      'Visit Date': formatDate(v.startTime, 'short'),
      'Start Time': formatTime(v.startTime),
      'End Time': v.endTime ? formatTime(v.endTime) : '',
      'Duration (min)': v.durationMin ?? '',
      'Patient Name': p?.fullName ?? '',
      Ailment: p?.ailment ?? '',
      'Session Notes': v.notes ?? '',
      Charge: v.charge,
      'Payment Status': v.isPaid ? 'Paid' : 'Unpaid',
      'Visit Status': v.status,
    };
  });

  // Sheet 3: Summary per patient
  const summaryRows = patients.map(p => {
    const pVisits = allVisits.filter(v => v.patientId === p.id && v.status === 'completed');
    const totalBilled = pVisits.reduce((s, v) => s + v.charge, 0);
    const totalPaid = pVisits.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0);
    const avgDuration =
      pVisits.length > 0
        ? Math.round(pVisits.reduce((s, v) => s + (v.durationMin ?? 0), 0) / pVisits.length)
        : 0;
    return {
      'Patient Name': p.fullName,
      'Total Visits': pVisits.length,
      'Total Billed ₹': totalBilled,
      'Total Paid ₹': totalPaid,
      'Balance Due ₹': totalBilled - totalPaid,
      'Avg Duration': avgDuration,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(patientRows);
  const ws2 = XLSX.utils.json_to_sheet(visitRows);
  const ws3 = XLSX.utils.json_to_sheet(summaryRows);

  // Set column width 20 for all sheets
  const setColWidth = (ws: XLSX.WorkSheet, count: number) => {
    ws['!cols'] = Array(count).fill({ wch: 20 });
  };
  setColWidth(ws1, 10);
  setColWidth(ws2, 10);
  setColWidth(ws3, 6);

  XLSX.utils.book_append_sheet(wb, ws1, 'Patients');
  XLSX.utils.book_append_sheet(wb, ws2, 'Visit Log');
  XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const filename = `PhyJio_Export_${Date.now()}.xlsx`;
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  await RNFS.writeFile(path, base64, 'base64');
  await Share.open({
    url: `file://${path}`,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename,
  });
}

export async function exportToCSV(patientId?: string): Promise<void> {
  const { visitsCollection, patientsCollection } = await import('../database');

  let visits = await visitsCollection.query(Q.sortBy('start_time', Q.desc)).fetch();
  if (patientId) visits = visits.filter(v => v.patientId === patientId);

  const patients = await patientsCollection.query().fetch();
  const patientMap = new Map(patients.map(p => [p.id, p]));

  const headers = ['Date', 'Start Time', 'End Time', 'Duration (min)', 'Patient', 'Ailment', 'Notes', 'Charge', 'Paid', 'Status'];
  const rows = visits.map(v => {
    const p = patientMap.get(v.patientId);
    return [
      formatDate(v.startTime, 'short'),
      formatTime(v.startTime),
      v.endTime ? formatTime(v.endTime) : '',
      String(v.durationMin ?? ''),
      p?.fullName ?? '',
      p?.ailment ?? '',
      (v.notes ?? '').replace(/,/g, ';'),
      String(v.charge),
      v.isPaid ? 'Yes' : 'No',
      v.status,
    ];
  });

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const filename = `PhyJio_Visits_${Date.now()}.csv`;
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  await RNFS.writeFile(path, csv, 'utf8');
  await Share.open({ url: `file://${path}`, type: 'text/csv', filename });
}
