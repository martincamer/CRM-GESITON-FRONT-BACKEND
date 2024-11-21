const getConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  return config;
};

export default getConfig;
