import axios from 'axios';

// ባክኤንዱ በ 5030 (HTTP) ላይ ስለሚሰራ እዚህ ጋር እናስተካክላለን
const api = axios.create({
  baseURL: 'http://localhost:5030/api', 
});

export default api;