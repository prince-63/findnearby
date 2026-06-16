import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsers,
  getProfileImageUrl,
  createConversation,
  getConversation,
} from '../api/user-profile';
import { store } from '../store/store';
import Avatar from '../components/Avatar';

const Skeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="mx-auto mb-2 h-4 w-32 rounded bg-slate-200" />
        <div className="mx-auto mb-1 h-3 w-44 rounded bg-slate-100" />
        <div className="mx-auto h-3 w-28 rounded bg-slate-100" />
        <div className="mt-4 h-9 w-full rounded-lg bg-slate-100" />
      </div>
    ))}
  </>
);

const BrokerCard = ({ broker, onContact }) => {
  const [contacting, setContacting] = useState(false);

  const handleContact = async () => {
    if (contacting) return;
    setContacting(true);
    await onContact(broker);
    setContacting(false);
  };

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-4 flex justify-center">
        <Avatar
          src={broker.profileImageKey ? getProfileImageUrl(broker.id) : null}
          name={broker.name}
          size="lg"
        />
      </div>

      <div className="text-center">
        <h2 className="text-base font-semibold text-slate-900">{broker.name}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{broker.email}</p>
        <p className="text-sm text-slate-400">{broker.mobileNo}</p>
      </div>

      <div className="mt-3 flex justify-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {broker.status}
        </span>
      </div>

      <div className="mt-4">
        <button
          onClick={handleContact}
          disabled={contacting}
          className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 active:bg-teal-900 disabled:opacity-60"
        >
          {contacting ? 'Connecting...' : 'Contact'}
        </button>
      </div>
    </div>
  );
};

const BrokerPage = () => {
  const navigate = useNavigate();
  const currentUser = store((state) => state.user);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const data = await getUsers({
          userType: 'BROKER',
          size: 20,
          page: 0,
        });
        setBrokers(data);
      } catch (error) {
        console.error('Failed to load brokers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrokers();
  }, []);

  const handleContact = async (broker) => {
    try {
      const conv = await createConversation(currentUser.id, broker.id);
      navigate(`/conversations/${conv.conversationId}`);
    } catch {
      try {
        const conv = await getConversation(currentUser.id, broker.id);
        navigate(`/conversations/${conv.conversationId}`);
      } catch (err) {
        console.error('Failed to start conversation', err);
      }
    }
  };

  if (!currentUser) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Find Brokers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse local brokers and start a conversation
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton />
          </div>
        ) : brokers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center">
            <p className="text-sm text-slate-400">No brokers found in your area</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brokers.map((broker) => (
              <BrokerCard
                key={broker.id}
                broker={broker}
                currentUser={currentUser}
                onContact={handleContact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerPage;
