import { create } from "zustand";

const CLIENT_ID_KEY = "presight.clientId";

function loadClientId(): string {
  const existing = sessionStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

export type Job = { jobId: string; status: "pending" | "done"; result?: string; createdAt: number };

type QueueState = {
  clientId: string;
  jobs: Record<string, Job>;
  jobOrder: string[];
  addPending: (jobId: string) => void;
  setResult: (jobId: string, result: string) => void;
  reset: () => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  clientId: loadClientId(),
  jobs: {},
  jobOrder: [],
  addPending: (jobId) =>
    set((s) => ({
      jobs: { ...s.jobs, [jobId]: { jobId, status: "pending", createdAt: Date.now() } },
      jobOrder: [...s.jobOrder, jobId],
    })),
  setResult: (jobId, result) =>
    set((s) => {
      const existing = s.jobs[jobId];
      if (!existing) return s;
      return { jobs: { ...s.jobs, [jobId]: { ...existing, status: "done", result } } };
    }),
  reset: () => set({ jobs: {}, jobOrder: [] }),
}));
