// frontend/src/hooks/useObtenerId.js
import { useState, useEffect } from "react";

const useObtenerId = (id, obtenerItem) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerData = async () => {
      try {
        setLoading(true);
        const data = await obtenerItem(id);
        setItem(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      obtenerData();
    }
  }, [id, obtenerItem]);

  return { item, loading, error };
};

export default useObtenerId;
