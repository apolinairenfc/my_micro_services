import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { loginUser } from '../api/auth';
import { setAuth } from '../store/auth';
import { toast } from '../lib/toast';

const schema = z.object({
  login: z.string().min(3, 'Identifiant requis'),
  password: z.string().min(8, 'Mot de passe requis'),
});

type FormValues = z.infer<typeof schema>;

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success('Connexion réussie.');
      navigate('/app/discussions');
    },
    onError: () => {
      toast.error('Identifiants invalides.');
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              API #3 Connector
            </p>
            <h1 className="text-2xl font-semibold">Connexion</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Connecte-toi pour accéder aux discussions.
            </p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nom d’utilisateur ou Email</label>
              <Input placeholder="john@mail.com" {...register('login')} />
              {errors.login && <p className="text-xs text-[var(--color-error)]">{errors.login.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Mot de passe</label>
              <Input type="password" placeholder="********" {...register('password')} />
              {errors.password && (
                <p className="text-xs text-[var(--color-error)]">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
              Se connecter
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Pas encore de compte ?{' '}
            <Link className="font-semibold text-[var(--color-accent)]" to="/register">
              Créer un compte
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
