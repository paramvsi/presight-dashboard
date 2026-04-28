import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { PeoplePage } from "@/features/people/pages/people-page";
import { StreamPage } from "@/features/stream/pages/stream-page";
import { QueuePage } from "@/features/queue/pages/queue-page";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/people" replace />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/stream" element={<StreamPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="*" element={<Navigate to="/people" replace />} />
      </Route>
    </Routes>
  );
}
