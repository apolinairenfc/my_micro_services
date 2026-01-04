import { Outlet } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

const App = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default App;
