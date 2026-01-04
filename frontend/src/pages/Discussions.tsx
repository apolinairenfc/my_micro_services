import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Badge from '../components/ui/Badge';
import { createDiscussion, fetchDiscussions } from '../api/discussions';
import { getCurrentUserId } from '../store/auth';
import { formatDate, parseUserIds } from '../lib/utils';
import { toast } from '../lib/toast';
import { Link } from 'react-router-dom';
import { getContactId } from '../store/contacts';

const Discussions = () => {
  const queryClient = useQueryClient();
  const currentUserId = getCurrentUserId();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [userIdsText, setUserIdsText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['discussions'],
    queryFn: () => fetchDiscussions(),
  });

  const mutation = useMutation({
    mutationFn: createDiscussion,
    onSuccess: () => {
      toast.success('Discussion créée.');
      setIsOpen(false);
      setTitle('');
      setUserIdsText('');
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: () => {
      toast.error('Impossible de créer la discussion.');
    },
  });

  const userIds = useMemo(() => {
    const entries = userIdsText.split(',').map((value) => value.trim()).filter(Boolean);
    const ids: number[] = [];
    entries.forEach((entry) => {
      const numeric = Number(entry);
      if (Number.isInteger(numeric) && numeric > 0) {
        ids.push(numeric);
        return;
      }
      const mapped = getContactId(entry);
      if (mapped) {
        ids.push(mapped);
      }
    });
    return Array.from(new Set([...parseUserIds(userIdsText), ...ids]));
  }, [userIdsText]);

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Le titre est requis.');
      return;
    }
    const entries = userIdsText.split(',').map((value) => value.trim()).filter(Boolean);
    const unresolved = entries.filter((entry) => {
      const numeric = Number(entry);
      if (Number.isInteger(numeric) && numeric > 0) {
        return false;
      }
      return getContactId(entry) === null;
    });

    if (unresolved.length > 0) {
      toast.info(`Usernames inconnus: ${unresolved.join(', ')}`);
    }

    const merged = currentUserId ? Array.from(new Set([...userIds, currentUserId])) : userIds;
    mutation.mutate({ title, userIds: merged });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Discussions</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Toutes les discussions où tu es participant.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>New discussion</Button>
      </div>

      {isLoading && <LoadingState />}

      {!isLoading && data?.data?.length === 0 && (
        <EmptyState
          title="Aucune discussion"
          description="Crée ta première discussion pour démarrer une conversation."
        />
      )}

      {!isLoading && data?.data && data.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.data.map((discussion) => (
            <Card key={discussion.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{discussion.title}</h3>
                <Badge>{discussion.userIds.length} participants</Badge>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Créée le {formatDate(discussion.createdAt)}
              </p>
              <Link
                to={`/app/discussions/${discussion.id}`}
                className="text-sm font-semibold text-[var(--color-accent)]"
              >
                Ouvrir la discussion
              </Link>
            </Card>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nouvelle discussion</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Ajoute les participants séparés par des virgules.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Titre</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">User IDs ou usernames (ex: 2,3,alice)</label>
              <Input
                value={userIdsText}
                onChange={(event) => setUserIdsText(event.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={mutation.isPending}>
                Create
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Discussions;
