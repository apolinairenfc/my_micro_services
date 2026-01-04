import { useEffect, useState } from 'react';
import Button from './ui/Button';
import { getTheme, toggleTheme } from '../lib/theme';

const ThemeToggle = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(getTheme());

  useEffect(() => {
    setMode(getTheme());
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setMode(next);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle}>
      {mode === 'dark' ? 'Clair' : 'Sombre'}
    </Button>
  );
};

export default ThemeToggle;
