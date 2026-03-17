import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import ExcelJS from 'exceljs';
import { Q } from '@nozbe/watermelondb';
import { formatDate, formatTime } from '../utils/dateUtils';

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

  const wb = new ExcelJS.Workbook();
  wb.creator = 'PhyJio';
  wb.created = new Date();

  const COL_WIDTH = 20;

  // ── Sheet 1: Patients ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet('Patients');
  ws1.columns = [
    { header: 'Patient Name', key: 'name', width: COL_WIDTH },
    { header: 'Age', key: 'age', width: COL_WIDTH },
    { header: 'Phone', key: 'phone', width: COL_WIDTH },
    { header: 'Address', key: 'address', width: COL_WIDTH },
    { header: 'Ailment', key: 'ailment', width: COL_WIDTH },
    { header: 'Referred By', key: 'referredBy', width: COL_WIDTH },
    { header: 'Charge/Visit', key: 'charge', width: COL_WIDTH },
    { header: 'Medical History', key: 'medicalHistory', width: COL_WIDTH },
    { header: 'Status', key: 'status', width: COL_WIDTH },
    { header: 'Registered On', key: 'registeredOn', width: COL_WIDTH },
  ];
  patients.forEach(p => {
    ws1.addRow({
      name: p.fullName,
      age: p.age,
      phone: p.phone,
      address: p.address,
      ailment: p.ailment,
      referredBy: p.referredBy,
      charge: p.chargePerVisit,
      medicalHistory: p.medicalHistory ?? '',
      status: p.isActive ? 'Active' : 'Inactive',
      registeredOn: formatDate(p.createdAt, 'short'),
    });
  });

  // ── Sheet 2: Visit Log ─────────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Visit Log');
  ws2.columns = [
    { header: 'Visit Date', key: 'date', width: COL_WIDTH },
    { header: 'Start Time', key: 'startTime', width: COL_WIDTH },
    { header: 'End Time', key: 'endTime', width: COL_WIDTH },
    { header: 'Duration (min)', key: 'duration', width: COL_WIDTH },
    { header: 'Patient Name', key: 'patient', width: COL_WIDTH },
    { header: 'Ailment', key: 'ailment', width: COL_WIDTH },
    { header: 'Session Notes', key: 'notes', width: COL_WIDTH },
    { header: 'Charge', key: 'charge', width: COL_WIDTH },
    { header: 'Payment Status', key: 'paid', width: COL_WIDTH },
    { header: 'Visit Status', key: 'status', width: COL_WIDTH },
  ];
  allVisits.forEach(v => {
    const p = patientMap.get(v.patientId);
    ws2.addRow({
      date: formatDate(v.startTime, 'short'),
      startTime: formatTime(v.startTime),
      endTime: v.endTime ? formatTime(v.endTime) : '',
      duration: v.durationMin ?? '',
      patient: p?.fullName ?? '',
      ailment: p?.ailment ?? '',
      notes: v.notes ?? '',
      charge: v.charge,
      paid: v.isPaid ? 'Paid' : 'Unpaid',
      status: v.status,
    });
  });

  // ── Sheet 3: Summary ───────────────────────────────────────────────────────
  const ws3 = wb.addWorksheet('Summary');
  ws3.columns = [
    { header: 'Patient Name', key: 'name', width: COL_WIDTH },
    { header: 'Total Visits', key: 'visits', width: COL_WIDTH },
    { header: 'Total Billed ₹', key: 'billed', width: COL_WIDTH },
    { header: 'Total Paid ₹', key: 'paid', width: COL_WIDTH },
    { header: 'Balance Due ₹', key: 'balance', width: COL_WIDTH },
    { header: 'Avg Duration', key: 'avgDuration', width: COL_WIDTH },
  ];
  patients.forEach(p => {
    const pVisits = allVisits.filter(v => v.patientId === p.id && v.status === 'completed');
    const totalBilled = pVisits.reduce((s, v) => s + v.charge, 0);
    const totalPaid = pVisits.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0);
    const avgDuration =
      pVisits.length > 0
        ? Math.round(pVisits.reduce((s, v) => s + (v.durationMin ?? 0), 0) / pVisits.length)
        : 0;
    ws3.addRow({
      name: p.fullName,
      visits: pVisits.length,
      billed: totalBilled,
      paid: totalPaid,
      balance: totalBilled - totalPaid,
      avgDuration,
    });
  });

  // Write workbook to buffer and share
  const buffer = await wb.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
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

  const headers = [
    'Date', 'Start Time', 'End Time', 'Duration (min)',
    'Patient', 'Ailment', 'Notes', 'Charge', 'Paid', 'Status',
  ];
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
