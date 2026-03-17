import { create } from 'zustand';

interface VisitState {
  activeVisitId: string | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setActiveVisit: (id: string | null) => void;
}

export const useVisitStore = create<VisitState>(set => ({
  activeVisitId: null,
  timerSeconds: 0,
  isTimerRunning: false,

  startTimer: () => set({ isTimerRunning: true }),
  stopTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ timerSeconds: 0, isTimerRunning: false }),
  setActiveVisit: (id) => set({ activeVisitId: id }),
}));
