import api from '../config/api';
import { ApiConfig } from '../config/api-config';

export const signup = async (payload) => {
  const response = await api.post(ApiConfig.ENDPOINTS.SIGNUP, payload);

  return response.data;
};

export const login = async (payload) => {
  const response = await api.post(ApiConfig.ENDPOINTS.LOGIN, payload);

  return response.data;
};

export const userDetails = async (userId) => {
  const response = await api.get(`${ApiConfig.ENDPOINTS.GET_USER}/${userId}`);

  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await api.patch(`${ApiConfig.ENDPOINTS.UPDATE_USER}/${userId}`, payload);

  return response.data;
};

export const changePassword = async (userId, payload) => {
  const response = await api.patch(
    `${ApiConfig.ENDPOINTS.CHANGE_PASSWORD}/${userId}/password`,
    payload
  );

  return response.data;
};

export const activateUser = async (userId) => {
  const response = await api.patch(`${ApiConfig.ENDPOINTS.ACTIVATE_USER}/${userId}/activate`);

  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.patch(`${ApiConfig.ENDPOINTS.DEACTIVATE_USER}/${userId}/deactivate`);

  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`${ApiConfig.ENDPOINTS.DELETE_USER}/${userId}`);

  return response.data;
};

export const uploadProfileImage = async (userId, file) => {
  const formData = new FormData();

  formData.append('file', file);

  const response = await api.post(
    `${ApiConfig.ENDPOINTS.UPLOAD_PROFILE_IMAGE}/${userId}/profile-picture/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const getProfileImageUrl = (userId) => {
  return `${api.defaults.baseURL}/api/v1/users/${userId}/profile-image`;
};

export const getUsers = async ({ userType, size = 10, page = 0, lat, lng, radius }) => {
  const params = { userType, size, page };
  if (lat != null) params.lat = lat;
  if (lng != null) params.lng = lng;
  if (radius != null) params.radius = radius;
  const response = await api.get(ApiConfig.ENDPOINTS.GET_USERS, { params });

  return response.data;
};

export const updateLocation = async (userId, { latitude, longitude }) => {
  const response = await api.patch(`${ApiConfig.ENDPOINTS.GET_USER}/${userId}/location`, {
    latitude,
    longitude,
  });
  return response.data;
};

export const createConversation = async (finderId, brokerId) => {
  const response = await api.post(ApiConfig.ENDPOINTS.CREATE_CONVERSATION, {
    finderId,
    brokerId,
  });
  return response.data;
};

export const getConversation = async (finderId, brokerId) => {
  const response = await api.post(ApiConfig.ENDPOINTS.GET_CONVERSATION, {
    finderId,
    brokerId,
  });
  return response.data;
};

export const getUserConversations = async (userId) => {
  const response = await api.get(`${ApiConfig.ENDPOINTS.USER_CONVERSATIONS}/${userId}`);
  return response.data;
};

export const getMessages = async (conversationId, page = 0, size = 50) => {
  const response = await api.get(ApiConfig.ENDPOINTS.GET_MESSAGES, {
    params: { conversationId, page, size },
  });
  return response.data;
};

export const getPresence = async (userId) => {
  const response = await api.get(`${ApiConfig.ENDPOINTS.PRESENCE}/${userId}`);
  return response.data;
};

export const createPost = async (payload) => {
  const response = await api.post(ApiConfig.ENDPOINTS.POSTS, payload);
  return response.data;
};

export const getPosts = async (page = 0, size = 20, lat, lng, radius) => {
  const params = { page, size };
  if (lat != null) params.lat = lat;
  if (lng != null) params.lng = lng;
  if (radius != null) params.radius = radius;
  const response = await api.get(ApiConfig.ENDPOINTS.POSTS, { params });
  return response.data;
};
