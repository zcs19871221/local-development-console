import { Route, Routes } from 'react-router-dom';
import ProcessChainDetail from './ProcessChainDetail.tsx';
import ProcessChainList from './ProcessChainList.tsx';

export default function ProcessChainEntryPage() {
  return (
    <Routes>
      <Route path="/new" element={<ProcessChainDetail />} />
      <Route path="/:processChainId" element={<ProcessChainDetail />} />
      <Route path="*" element={<ProcessChainList />} />
    </Routes>
  );
}
