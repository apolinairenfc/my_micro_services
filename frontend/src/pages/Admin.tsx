import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import { api1, api2 } from '../api/admin';
import { http } from '../api/http';
import { toast } from '../lib/toast';
import { formatDate, parseUserIds } from '../lib/utils';

const Admin = () => {
  const queryClient = useQueryClient();
  const [userFilter, setUserFilter] = useState('');
  const [messageDiscussionId, setMessageDiscussionId] = useState('');
  const [messageUserId, setMessageUserId] = useState('');

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [messageForm, setMessageForm] = useState({
    discussionId: '',
    content: '',
  });

  const [updateMessageId, setUpdateMessageId] = useState('');
  const [updateContent, setUpdateContent] = useState('');

  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    userIdsText: '',
    targetId: '',
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: api1.listUsers,
  });

  const messagesQuery = useQuery({
    queryKey: ['admin-messages', messageDiscussionId, messageUserId],
    queryFn: () =>
      api1.listMessages({
        discussionId: messageDiscussionId || undefined,
        userId: messageUserId ? Number(messageUserId) : undefined,
      }),
  });

  const discussionsQuery = useQuery({
    queryKey: ['admin-discussions'],
    queryFn: () => api2.listDiscussions(),
  });

  const createUserMutation = useMutation({
    mutationFn: api1.createUser,
    onSuccess: () => {
      toast.success('User créé.');
      setUserForm({ username: '', email: '', password: '', passwordConfirm: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Erreur création user.'),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { username?: string; email?: string } }) =>
      api1.updateUser(id, payload),
    onSuccess: () => {
      toast.success('User mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Erreur mise à jour user.'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: api1.deleteUser,
    onSuccess: () => {
      toast.success('User supprimé.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Erreur suppression user.'),
  });

  const createMessageMutation = useMutation({
    mutationFn: api1.createMessage,
    onSuccess: () => {
      toast.success('Message créé.');
      setMessageForm({ discussionId: '', content: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
    onError: () => toast.error('Erreur création message.'),
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => api1.updateMessage(id, { content }),
    onSuccess: () => {
      toast.success('Message mis à jour.');
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
    onError: () => toast.error('Erreur mise à jour message.'),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: api1.deleteMessage,
    onSuccess: () => {
      toast.success('Message supprimé.');
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
    onError: () => toast.error('Erreur suppression message.'),
  });

  const createDiscussionMutation = useMutation({
    mutationFn: api2.createDiscussion,
    onSuccess: () => {
      toast.success('Discussion créée.');
      setDiscussionForm((prev) => ({ ...prev, title: '', userIdsText: '' }));
      queryClient.invalidateQueries({ queryKey: ['admin-discussions'] });
    },
    onError: () => toast.error('Erreur création discussion.'),
  });

  const updateDiscussionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title?: string; userIds?: number[] } }) =>
      api2.updateDiscussion(id, payload),
    onSuccess: () => {
      toast.success('Discussion mise à jour.');
      queryClient.invalidateQueries({ queryKey: ['admin-discussions'] });
    },
    onError: () => toast.error('Erreur mise à jour discussion.'),
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: api2.deleteDiscussion,
    onSuccess: () => {
      toast.success('Discussion supprimée.');
      queryClient.invalidateQueries({ queryKey: ['admin-discussions'] });
    },
    onError: () => toast.error('Erreur suppression discussion.'),
  });

  const healthChecks = async () => {
    try {
      await Promise.all([
        api1.listUsers(),
        api2.listDiscussions(),
        http.get('/health/services'),
      ]);
      toast.success('Health check OK.');
    } catch {
      toast.error('Health check en échec.');
    }
  };

  const users = usersQuery.data?.data || [];
  const filteredUsers = users.filter((user) =>
    userFilter ? user.username.toLowerCase().includes(userFilter.toLowerCase()) : true
  );

  const messages = messagesQuery.data?.data || [];
  const discussions = discussionsQuery.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Admin Playground</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Teste toutes les routes API1/API2 depuis le frontend.
          </p>
        </div>
        <Button variant="outline" onClick={healthChecks}>
          Run health checks
        </Button>
      </div>

      <Tabs
        items={[
          {
            id: 'users',
            label: 'API1 Users',
            content: (
              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <Card className="space-y-3">
                  <h4 className="text-sm font-semibold">Créer un utilisateur</h4>
                  <Input
                    placeholder="username"
                    value={userForm.username}
                    onChange={(event) => setUserForm({ ...userForm, username: event.target.value })}
                  />
                  <Input
                    placeholder="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                  />
                  <Input
                    placeholder="password"
                    type="password"
                    value={userForm.password}
                    onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
                  />
                  <Input
                    placeholder="confirm password"
                    type="password"
                    value={userForm.passwordConfirm}
                    onChange={(event) => setUserForm({ ...userForm, passwordConfirm: event.target.value })}
                  />
                  <Button
                    onClick={() => createUserMutation.mutate(userForm)}
                    disabled={createUserMutation.isPending}
                  >
                    Create user
                  </Button>
                </Card>
                <div className="space-y-3">
                  <Input
                    placeholder="Filter username"
                    value={userFilter}
                    onChange={(event) => setUserFilter(event.target.value)}
                  />
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{user.username}</p>
                          <p className="text-xs text-[var(--color-muted)]">{user.email}</p>
                        </div>
                        <Badge>ID {user.id}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateUserMutation.mutate({
                              id: user.id,
                              payload: { username: user.username + '_edit' },
                            })
                          }
                        >
                          Quick rename
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateUserMutation.mutate({
                              id: user.id,
                              payload: { email: `new-${user.email}` },
                            })
                          }
                        >
                          Update email
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'messages',
            label: 'API1 Messages',
            content: (
              <div className="space-y-4">
                <Card className="space-y-3">
                  <h4 className="text-sm font-semibold">Créer un message</h4>
                  <Input
                    placeholder="discussionId"
                    value={messageForm.discussionId}
                    onChange={(event) =>
                      setMessageForm({ ...messageForm, discussionId: event.target.value })
                    }
                  />
                  <Input
                    placeholder="content"
                    value={messageForm.content}
                    onChange={(event) => setMessageForm({ ...messageForm, content: event.target.value })}
                  />
                  <Button
                    onClick={() => createMessageMutation.mutate(messageForm)}
                    disabled={createMessageMutation.isPending}
                  >
                    Create message
                  </Button>
                </Card>

                <Card className="space-y-3">
                  <h4 className="text-sm font-semibold">Update / Delete message</h4>
                  <Input
                    placeholder="messageId"
                    value={updateMessageId}
                    onChange={(event) => setUpdateMessageId(event.target.value)}
                  />
                  <Input
                    placeholder="new content"
                    value={updateContent}
                    onChange={(event) => setUpdateContent(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateMessageMutation.mutate({
                          id: Number(updateMessageId),
                          content: updateContent,
                        })
                      }
                    >
                      Update
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => deleteMessageMutation.mutate(Number(updateMessageId))}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>

                <Card className="space-y-3">
                  <h4 className="text-sm font-semibold">Filtrer messages</h4>
                  <Input
                    placeholder="discussionId"
                    value={messageDiscussionId}
                    onChange={(event) => setMessageDiscussionId(event.target.value)}
                  />
                  <Input
                    placeholder="userId"
                    value={messageUserId}
                    onChange={(event) => setMessageUserId(event.target.value)}
                  />
                </Card>

                <div className="space-y-3">
                  {messages.map((message) => (
                    <Card key={message.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Message #{message.id}</p>
                        <Badge>User {message.userId}</Badge>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-[var(--color-muted)]">{formatDate(message.createdAt)}</p>
                      <p className="text-xs text-[var(--color-muted)]">Discussion {message.discussionId}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'discussions',
            label: 'API2 Discussions',
            content: (
              <div className="space-y-4">
                <Card className="space-y-3">
                  <h4 className="text-sm font-semibold">Créer une discussion (API2)</h4>
                  <Input
                    placeholder="title"
                    value={discussionForm.title}
                    onChange={(event) =>
                      setDiscussionForm({ ...discussionForm, title: event.target.value })
                    }
                  />
                  <Input
                    placeholder="userIds ex: 1,2,3"
                    value={discussionForm.userIdsText}
                    onChange={(event) =>
                      setDiscussionForm({ ...discussionForm, userIdsText: event.target.value })
                    }
                  />
                  <Button
                    onClick={() =>
                      createDiscussionMutation.mutate({
                        title: discussionForm.title,
                        userIds: parseUserIds(discussionForm.userIdsText),
                      })
                    }
                  >
                    Create discussion
                  </Button>
                </Card>

                <Card className="space-y-3">
                  <h4 className="text-sm font-semibold">Update / Delete discussion</h4>
                  <Input
                    placeholder="discussion id"
                    value={discussionForm.targetId}
                    onChange={(event) =>
                      setDiscussionForm({ ...discussionForm, targetId: event.target.value })
                    }
                  />
                  <Input
                    placeholder="new title"
                    value={discussionForm.title}
                    onChange={(event) =>
                      setDiscussionForm({ ...discussionForm, title: event.target.value })
                    }
                  />
                  <Input
                    placeholder="userIds ex: 1,2,3"
                    value={discussionForm.userIdsText}
                    onChange={(event) =>
                      setDiscussionForm({ ...discussionForm, userIdsText: event.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateDiscussionMutation.mutate({
                          id: discussionForm.targetId,
                          payload: {
                            title: discussionForm.title || undefined,
                            userIds: discussionForm.userIdsText
                              ? parseUserIds(discussionForm.userIdsText)
                              : undefined,
                          },
                        })
                      }
                    >
                      Update
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => deleteDiscussionMutation.mutate(discussionForm.targetId)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>

                <div className="space-y-3">
                  {discussions.map((discussion) => (
                    <Card key={discussion.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{discussion.title}</p>
                        <Badge>{discussion.userIds.length} users</Badge>
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">{formatDate(discussion.createdAt)}</p>
                      <p className="text-xs text-[var(--color-muted)]">ID: {discussion.id}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Admin;
