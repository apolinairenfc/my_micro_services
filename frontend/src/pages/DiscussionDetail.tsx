import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingState from '../components/LoadingState';
import { createMessage, fetchDiscussionDetail } from '../api/discussions';
import { getCurrentUserId } from '../store/auth';
import { formatDate } from '../lib/utils';
import { toast } from '../lib/toast';

const DiscussionDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
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
    </div>
  );
};

export default DiscussionDetail;
