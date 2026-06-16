import { useEffect, useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { store } from '../store/store';
import {
  getPosts,
  createPost,
  updateLocation,
  createConversation,
  getConversation,
  getProfileImageUrl,
} from '../api/user-profile';
import Avatar from '../components/Avatar';

const RADIUS_KM = 50;

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const PinIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RupeeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 8h6m-6 4h6m-1.5-8H7.5A1.5 1.5 0 006 5.5v1A1.5 1.5 0 007.5 8h9A1.5 1.5 0 0118 6.5v-1A1.5 1.5 0 0016.5 4H12"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v12" />
  </svg>
);

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString();
};

const PostCard = ({ post, currentUser, onContact, onClose }) => {
  const isOwnPost = currentUser?.id === post.finderId;
  const isOpen = post.status === 'OPEN';
  let distance = null;
  if (
    currentUser?.latitude != null &&
    currentUser?.longitude != null &&
    post.latitude != null &&
    post.longitude != null
  ) {
    distance = haversineKm(
      currentUser.latitude,
      currentUser.longitude,
      post.latitude,
      post.longitude
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <Avatar
          src={post.finderProfileImageKey ? getProfileImageUrl(post.finderId) : null}
          name={post.finderName}
          size="md"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">{post.finderName}</p>
          <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      <h3 className="mb-1 text-lg font-bold text-slate-900">{post.title}</h3>
      <p className="mb-3 text-sm whitespace-pre-wrap text-slate-600">{post.description}</p>

      <div className="mb-3 flex flex-wrap gap-4 text-xs text-slate-500">
        {post.location && (
          <span className="inline-flex items-center gap-1">
            <PinIcon />
            {post.location}
          </span>
        )}
        {post.budgetMin != null && post.budgetMax != null && (
          <span className="inline-flex items-center gap-1">
            <RupeeIcon />₹{post.budgetMin.toLocaleString()} – ₹{post.budgetMax.toLocaleString()}
          </span>
        )}
        {distance != null && (
          <span className="inline-flex items-center gap-1 text-slate-400">
            {distance < 1 ? '< 1 km' : `${Math.round(distance)} km`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isOpen ? '● Open' : '● Closed'}
        </span>

        <div className="flex gap-2">
          {isOwnPost && isOpen && (
            <button
              onClick={() => onClose(post.id)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Close
            </button>
          )}
          {currentUser?.profileType === 'BROKER' && isOpen && (
            <button
              onClick={() => onContact(post)}
              className="rounded-md bg-teal-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-teal-700"
            >
              Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const postsReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'LOADED':
      return { posts: action.posts, loading: false };
    default:
      return state;
  }
};

const FeedPage = () => {
  const navigate = useNavigate();
  const currentUser = store((s) => s.user);
  const [{ posts, loading }, dispatch] = useReducer(postsReducer, {
    posts: [],
    loading: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    const init = async () => {
      dispatch({ type: 'LOADING' });
      let lat = currentUser?.latitude;
      let lng = currentUser?.longitude;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
            })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          if (currentUser && (currentUser.latitude !== lat || currentUser.longitude !== lng)) {
            const updated = await updateLocation(currentUser.id, {
              latitude: lat,
              longitude: lng,
            });
            store.getState().login(updated);
          }
        } catch {
          // location unavailable, use stored location
        }
      }

      try {
        const data = await getPosts(0, 20, lat, lng, RADIUS_KM);
        dispatch({ type: 'LOADED', posts: data });
      } catch {
        dispatch({ type: 'LOADED', posts: [] });
      }
    };
    init();
  }, []);

  const handleContact = async (post) => {
    try {
      const conv = await createConversation(post.finderId, currentUser.id);
      navigate(`/conversations/${conv.conversationId}`);
    } catch {
      try {
        const conv = await getConversation(post.finderId, currentUser.id);
        navigate(`/conversations/${conv.conversationId}`);
      } catch (err) {
        console.error('Failed to contact finder', err);
      }
    }
  };

  const reloadPosts = async () => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await getPosts(0, 20, currentUser?.latitude, currentUser?.longitude, RADIUS_KM);
      dispatch({ type: 'LOADED', posts: data });
    } catch {
      dispatch({ type: 'LOADED', posts: [] });
    }
  };

  const handleClose = async (postId) => {
    try {
      await api.post(`/api/v1/posts/${postId}/close?finderId=${currentUser.id}`);
      reloadPosts();
    } catch {
      console.error('Failed to close post');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let lat = currentUser.latitude;
      let lng = currentUser.longitude;
      await createPost({
        finderId: currentUser.id,
        title: form.title,
        description: form.description,
        location: form.location || null,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        latitude: lat,
        longitude: lng,
      });
      setForm({ title: '', description: '', location: '', budgetMin: '', budgetMax: '' });
      setShowForm(false);
      reloadPosts();
    } catch {
      console.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const isFinder = currentUser.profileType === 'FINDER';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {isFinder && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex w-full items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-left text-sm text-slate-400 transition hover:border-slate-400 hover:text-slate-500"
            >
              <Avatar
                src={currentUser.profileImageKey ? getProfileImageUrl(currentUser.id) : null}
                name={currentUser.name}
                size="sm"
              />
              What are you looking for?
            </button>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3 flex items-center gap-3">
                <Avatar
                  src={currentUser.profileImageKey ? getProfileImageUrl(currentUser.id) : null}
                  name={currentUser.name}
                  size="sm"
                />
                <span className="text-sm font-semibold text-slate-900">{currentUser.name}</span>
              </div>
              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <textarea
                placeholder="Describe what you're looking for... *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                className="mb-2 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <div className="mb-2 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Location (e.g. Mumbai)"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min budget"
                    value={form.budgetMin}
                    onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max budget"
                    value={form.budgetMax}
                    onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-teal-600 px-5 py-1.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <h2 className="mb-4 text-lg font-bold text-slate-900">
        {isFinder ? 'Nearby Requests' : 'Browse Requests'}
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-2.5 w-16 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mb-1 h-3 w-full rounded bg-slate-100" />
              <div className="mb-3 h-3 w-2/3 rounded bg-slate-100" />
              <div className="mb-3 h-3 w-1/3 rounded bg-slate-100" />
              <div className="h-8 w-1/4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-400">
            {isFinder ? "You haven't created any posts yet." : 'No nearby requests found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onContact={handleContact}
              onClose={handleClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
