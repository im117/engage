import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  interface User {
    id: string;
    username: string;
    role: string;
  }

  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/search-users`, {
        params: { query: query.trim() },
      });

      setResults(response.data.users);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const viewUserProfile = (userId: any) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Search Users</h2>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
          />
          {query && (
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => setQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      {error && <div className="text-red-500 py-2">{error}</div>}

      {results.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {results.map((user) => (
              <li key={user.id} className="hover:bg-gray-50">
                <button
                  onClick={() => viewUserProfile(user.id)}
                  className="w-full px-4 py-3 flex items-center text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold mr-3">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        query.trim() &&
        !loading && (
          <div className="text-center py-8 text-gray-500">
            No users found matching "{query}"
          </div>
        )
      )}
    </div>
  );
};

export default UserSearch;
