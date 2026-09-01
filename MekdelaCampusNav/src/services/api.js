import axios from 'axios';

// ባክኤንዱ በ 5030 (HTTP) ላይ ስለሚሰራ እዚህ ጋር እናስተካክላለን
const api = axios.create({
  baseURL: 'https://mekdela-amba-navigation.onrender.com/api', 
});

export default api;