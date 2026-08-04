export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  console.log("TOKEN:", token);

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
