import { useState, useEffect } from "react";

const useFetchRecord = (isAuthenticated) => {
  const [fetchRecord, setFetchRecord] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setFetchRecord(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [isAuthenticated]);

  return fetchRecord; // Return the fetched data so it can be used by components
};

export default useFetchRecord;
