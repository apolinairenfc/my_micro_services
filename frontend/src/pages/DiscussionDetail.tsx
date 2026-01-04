import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingState from '../components/LoadingState';
import { createMessage, deleteDiscussion, fetchDiscussionDetail, updateDiscussion } from '../api/discussions';
import { getCurrentUserId } from '../store/auth';
import { formatDate } from '../lib/utils';
import { toast } from '../lib/toast';
import Dialog from '../components/ui/Dialog';
import { addContact, getContactId, listContacts, removeContact } from '../store/contacts';
import Input from '../components/ui/Input';

const DiscussionDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [participantInput, setParticipantInput] = useState('');
  const [contactUsername, setContactUsername] = useState('');
  const [contactUserId, setContactUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = getCurrentUserId();

  const { data, isLoading } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => fetchDiscussionDetail(id || ''),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: { content: string }) => createMessage(id || '', payload),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['discussion', id] });
    },
    onError: () => {
      toast.error('Impossible d\'envoyer le message.');
    },
  });

  const updateDiscussionMutation = useMutation({
    mutationFn: (payload: { title?: string; userIds?: number[] }) => updateDiscussion(id || '', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', id] });
      toast.success('Discussion mise à jour.');
    },
    onError: () => toast.error('Mise à jour impossible.'),
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: () => deleteDiscussion(id || ''),
    onSuccess: () => {
      toast.success('Discussion supprimée.');
      window.location.assign('/app/discussions');
    },
    onError: () => toast.error('Suppression impossible.'),
  });

  const discussion = data?.data.discussion;
  const messages = data?.data.messages || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!content.trim()) {
      return;
    }
    mutation.mutate({ content });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  const participants = useMemo(() => discussion?.userIds || [], [discussion]);

  const resolveUserId = (value: string): number | null => {
    const numeric = Number(value);
    if (Number.isInteger(numeric) && numeric > 0) {
      return numeric;
    }
    return getContactId(value);
  };

  const handleAddParticipant = () => {
    const userId = resolveUserId(participantInput.trim());
    if (!userId) {
      toast.error('User inconnu. Ajoute-le dans les contacts ou saisis son ID.');
      return;
    }
    const updated = Array.from(new Set([...participants, userId]));
    updateDiscussionMutation.mutate({ userIds: updated });
    setParticipantInput('');
  };

  const handleRemoveParticipant = (userId: number) => {
    const updated = participants.filter((idValue) => idValue !== userId);
    updateDiscussionMutation.mutate({ userIds: updated });
  };

  const handleLeave = () => {
    if (!currentUserId) {
      return;
    }
    const updated = participants.filter((idValue) => idValue !== currentUserId);
    updateDiscussionMutation.mutate({ userIds: updated });
  };

  const contacts = listContacts();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!discussion) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-muted)]">Discussion introuvable.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Discussion
          </p>
          <h2 className="text-2xl font-semibold">{discussion.title}</h2>
          <p className="text-sm text-[var(--color-muted)]">Créée le {formatDate(discussion.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {participants.map((participant) => (
            <Badge key={participant}>User {participant}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            Discussion settings
          </Button>
          <Button variant="ghost" onClick={handleLeave}>
            Quitter la discussion
          </Button>
          <Button variant="ghost" onClick={() => deleteDiscussionMutation.mutate()}>
            Supprimer la discussion
          </Button>
        </div>
      </div>

      <Card className="flex h-[60vh] flex-col gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine = message.userId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-soft ${
                      isMine
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-bg-soft)] text-[var(--color-text)]'
                    }`}
                  >
                    <p className="mb-1 text-xs opacity-70">User {message.userId}</p>
                    <p>{message.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="sticky bottom-0 flex gap-3 border-t border-[var(--color-border)] pt-4">
          <Input
            placeholder="Type a message..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSend} disabled={mutation.isPending}>
            Send
          </Button>
        </div>
      </Card>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Paramètres de la discussion"
        description="Ajoute/retire des participants ou gère ton carnet d’adresses."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Ajouter un participant (username ou ID)</label>
            <div className="flex gap-2">
              <Input
                placeholder="ex: alice ou 3"
                value={participantInput}
                onChange={(event) => setParticipantInput(event.target.value)}
              />
              <Button onClick={handleAddParticipant}>Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Participants actuels</p>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <Badge key={participant} className="flex items-center gap-2">
                  User {participant}
                  {participant !== currentUserId && (
                    <button
                      className="text-xs text-[var(--color-error)]"
                      onClick={() => handleRemoveParticipant(participant)}
                    >
                      remove
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Carnet d’adresses (username → id)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="username"
                value={contactUsername}
                onChange={(event) => setContactUsername(event.target.value)}
              />
              <Input
                placeholder="id"
                value={contactUserId}
                onChange={(event) => setContactUserId(event.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const idValue = Number(contactUserId);
                if (!contactUsername.trim() || !Number.isInteger(idValue)) {
                  toast.error('Contact invalide.');
                  return;
                }
                addContact({ username: contactUsername.trim(), userId: idValue });
                toast.success('Contact enregistré.');
                setContactUsername('');
                setContactUserId('');
              }}
            >
              Ajouter un contact
            </Button>
            <div className="space-y-2">
              {contacts.length === 0 && (
                <p className="text-xs text-[var(--color-muted)]\">Aucun contact enregistré.</p>
              )}
              {contacts.map((contact) => (
                <div key={contact.username} className="flex items-center justify-between text-sm">
                  <span>
                    {contact.username} → {contact.userId}
                  </span>
                  <button
                    className="text-xs text-[var(--color-error)]"
                    onClick={() => {
                      removeContact(contact.username);
                      toast.info('Contact supprimé.');
                    }}
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DiscussionDetail;
