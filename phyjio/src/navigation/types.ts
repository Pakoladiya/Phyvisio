export type RootStackParamList = {
  Main: undefined;
  AddEditPatient: { patientId?: string } | undefined;
  PatientDetail: { patientId: string };
  ActiveVisit: { patientId: string };
  BillPreview: { patientId: string; fromDate: number; toDate: number };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Patients: undefined;
  Visits: undefined;
  Messages: undefined;
  Billing: undefined;
};
