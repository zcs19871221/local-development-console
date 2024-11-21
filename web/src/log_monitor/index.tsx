import { Route, Routes } from 'react-router-dom';
import LogMonitorDetail from './LogMonitorDetail.tsx';
import LogMonitorList from './LogMonitorList.tsx';

export default function LogMonitorEntryPage() {
  return (
    <Routes>
      <Route path="/new" element={<LogMonitorDetail />} />
      <Route path="/:logMonitorId" element={<LogMonitorDetail />} />
      <Route path="*" element={<LogMonitorList />} />
    </Routes>
  );
}
