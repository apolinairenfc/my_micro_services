import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { registerUser } from '../api/auth';
import { toast } from '../lib/toast';

const schema = z
  .object({
    username: z.string().min(3, 'Nom d’utilisateur requis').max(50, 'Nom d’utilisateur trop long'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Mot de passe trop court'),
    passwordConfirm: z.string().min(8, 'Confirmation requise'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Les mots de passe ne correspondent pas',
  });

type FormValues = z.infer<typeof schema>;

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Compte créé. Connecte-toi.');
      navigate('/login');
    },
    onError: () => {
      toast.error('Impossible de créer le compte.');
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
            <h1 className="text-2xl font-semibold">Créer un compte</h1>
            <p className="text-sm text-[var(--color-muted)]">
              Ton accès unique à toutes les discussions.
            </p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nom d’utilisateur</label>
              <Input placeholder="john" {...register('username')} />
              {errors.username && (
                <p className="text-xs text-[var(--color-error)]">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Email</label>
              <Input placeholder="john@mail.com" {...register('email')} />
              {errors.email && <p className="text-xs text-[var(--color-error)]">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Mot de passe</label>
              <Input type="password" placeholder="********" {...register('password')} />
              {errors.password && (
                <p className="text-xs text-[var(--color-error)]">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Confirmer le mot de passe</label>
              <Input type="password" placeholder="********" {...register('passwordConfirm')} />
              {errors.passwordConfirm && (
                <p className="text-xs text-[var(--color-error)]">{errors.passwordConfirm.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
              Créer un compte
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Déjà inscrit ?{' '}
            <Link className="font-semibold text-[var(--color-accent)]" to="/login">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
