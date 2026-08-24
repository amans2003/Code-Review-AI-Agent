let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}
const API_BASE_URL = `${API_URL}/api`;

/**
 * Custom request helper that handles fetching with auth headers
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  auth: {
    loginWithGithubUrl: (profileUrl) => request('/auth/github-url', {
      method: 'POST',
      body: JSON.stringify({ profileUrl })
    }),
    demoLogin: () => request('/auth/demo', { method: 'POST' }),
    getMe: () => request('/auth/me')
  },
  github: {
    getRepos: (username) => request(`/github/repos/${username}`)
  },
  repos: {
    submit: (payload) => request('/repos', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    get: () => request('/repos'),
    quickAudit: (payload) => request('/repos/quick-audit', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  reviews: {
    getAll: () => request('/reviews'),
    getDetails: (id) => request(`/reviews/${id}`),
    explain: (payload) => request('/reviews/explain', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    getDownloadUrl: (id, format) => `${API_BASE_URL}/reviews/${id}/${format}?token=${localStorage.getItem('token')}`
  }
};
