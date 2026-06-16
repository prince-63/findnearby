import axios from 'axios';
import { ApiConfig } from './api-config';

const api = axios.create({
  baseURL: ApiConfig.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
