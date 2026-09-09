import axios from 'axios';

const api = axios.create({
  baseURL: 'https://maumap.runasp.net/api',
});

export default api;
