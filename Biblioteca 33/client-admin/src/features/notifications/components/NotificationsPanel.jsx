import { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { getNotifications, markAsRead } from '../../../shared/api/notifications';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { PageHeader } from '../../../shared/components/ui/PageHeader.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { ErrorBanner } from '../../../shared/components/ui/ErrorBanner.jsx';
import { formatDateTime } from '../../../shared/utils/formatter.js';
import { parseApiError } from '../../../shared/utils/apiError.js';
import { showError } from '../../../shared/utils/toast.js';

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications;
  return [];
};

export const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications({ limit: 50 });
      setNotifications(extractList(res));
    } catch (err) {
      const message = parseApiError(err, 'Error al cargar notificaciones');
      setError(message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item))
      );
    } catch {
      showError('No se pudo marcar la notificación');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        subtitle={`Tienes ${unreadCount} sin leer`}
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      <ErrorBanner message={error} />

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <p className="text-center text-[var(--text-muted)]">Sin notificaciones</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n._id}
              className={n.read ? '' : 'border-[var(--accent)] bg-[rgba(232,132,43,0.06)]'}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-[var(--text-h)]">{n.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{n.message}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => handleRead(n._id)}
                    className="text-sm font-medium text-[var(--accent)] underline"
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
