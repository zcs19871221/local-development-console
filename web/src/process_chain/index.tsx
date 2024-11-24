import { Route, Routes } from 'react-router-dom';
import ProcessChainDetail from './ProcessChainDetail.tsx';
import ProcessChainList from './ProcessChainDetail.tsx';

export default function LogMonitorEntryPage() {
  return (
    <Routes>
      <Route path="/new" element={<ProcessChainDetail />} />
      <Route path="/:logMonitorId" element={<ProcessChainDetail />} />
      <Route path="*" element={<ProcessChainList />} />
    </Routes>
  );
}
