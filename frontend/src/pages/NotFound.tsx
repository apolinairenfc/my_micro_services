import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="text-center">
          <h1 className="text-3xl font-semibold">404</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Page introuvable.</p>
          <Link to="/app/discussions">
            <Button className="mt-6">Retour aux discussions</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
