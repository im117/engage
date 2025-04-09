import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/combinedSearch.scss";

// Define server URLs
let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}

let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

// User interface definition
interface User {
  id: string;
  username: string;
  role: string;
  profilePictureUrl: string;
}

// Video interface definition
interface Video {
  id: string;
  fileName: string;
  title: string;
  description?: string;
  score?: number;
}

// Search result types
type SearchResult = {
  type: "video" | "user";
  data: Video | User;
};

// Combined search component
const CombinedSearch = ({
  onVideoSelect,
}: {
  onVideoSelect?: (video: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to search for videos based on title
  async function searchVideos(searchTerm: string): Promise<Video[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      // Fetch all videos from the server
      const response = await axios.get(`${uploadServer}/video-list`);
      const allVideos = response.data;

      if (!allVideos || !allVideos.length) {
        return [];
      }

      // Score each video based on how well it matches the search term
      const scoredVideos = allVideos.map((video: Video) => {
        // Calculate match score based on various factors
        const title = video.title || "";
        const description = video.description || "";

        // Calculate basic match score - case insensitive
        const searchTermLower = searchTerm.toLowerCase();
        const titleLower = title.toLowerCase();

        let score = 0;

        // Exact match gets highest score
        if (titleLower === searchTermLower) {
          score += 100;
        }
        // Title starts with search term
        else if (titleLower.startsWith(searchTermLower)) {
          score += 75;
        }
        // Title contains search term as a whole word
        else if (new RegExp(`\\b${searchTermLower}\\b`).test(titleLower)) {
          score += 50;
        }
        // Title contains search term
        else if (titleLower.includes(searchTermLower)) {
          score += 25;
        }
        // Secondary match in description
        if (description.toLowerCase().includes(searchTermLower)) {
          score += 10;
        }

        // Additional points based on number of tokens matched
        const searchTokens = searchTermLower.split(/\s+/);
        const titleTokens = titleLower.split(/\s+/);

        for (const token of searchTokens) {
          if (token.length > 2) {
            // Ignore very short tokens
            for (const titleToken of titleTokens) {
              if (titleToken.includes(token)) {
                score += 5;
              }
            }
          }
        }

        return {
          ...video,
          score,
        };
      });

      // Filter videos with any match score and sort by score (highest first)
      const matchedVideos = scoredVideos
        .filter((video: Video) => video.score && video.score > 0)
        .sort((a: Video, b: Video) => (b.score || 0) - (a.score || 0));

      return matchedVideos;
    } catch (error) {
      console.error("Error searching videos:", error);
      return [];
    }
  }

  // Function to search for users
  async function searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await axios.get(`${loginServer}/search-users`, {
        params: { query: query.trim() },
      });

      return response.data.users || [];
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Failed to search users. Please try again.");
      return [];
    }
  }

  // Combined search function
  const performSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Search both videos and users in parallel
      const [videos, users] = await Promise.all([
        searchVideos(searchTerm),
        searchUsers(searchTerm),
      ]);

      // Combine and prepare results
      const combinedResults: SearchResult[] = [
        ...videos.map(
          (video) => ({ type: "video", data: video } as SearchResult)
        ),
        ...users.map((user) => ({ type: "user", data: user } as SearchResult)),
      ];

      setSearchResults(combinedResults);
    } catch (err) {
      console.error("Error performing search:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
      setShowResults(true);
    }
  };

  // Debounce search to prevent too many requests
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "video" && onVideoSelect) {
      onVideoSelect((result.data as Video).fileName);
      setSearchTerm("");
      setShowResults(false);
    } else if (result.type === "user") {
      navigate(`/profile/${(result.data as User).username}`);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="combined-search-container"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search videos and users..."
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
        />
        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm("")}>
            ✕
          </button>
        )}
        <i
          className={`fa-solid ${
            isSearching ? "fa-spinner fa-spin" : "fa-search"
          }`}
        ></i>
      </div>

      {error && <div className="search-error">{error}</div>}

      {showResults && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => {
            if (result.type === "video") {
              const video = result.data as Video;
              return (
                <div
                  key={`video-${video.id || index}`}
                  className="search-result-item video-result"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-icon">
                    <i className="fa-solid fa-video"></i>
                  </div>
                  <div className="result-content">
                    <div className="search-result-title">{video.title}</div>
                    {video.description && (
                      <div className="search-result-description">
                        {video.description.length > 50
                          ? `${video.description.substring(0, 50)}...`
                          : video.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              const user = result.data as User;
              return (
                <div
                  key={`user-${user.id}`}
                  className="search-result-item user-result"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="avatar">
                    <img
                      src={
                        user.profilePictureUrl ||
                        "https://via.placeholder.com/100"
                      }
                      alt="Profile"
                      className="profile-picture"
                    />
                  </div>
                  <div className="result-content">
                    <div className="search-result-title">{user.username}</div>
                    {user.role !== "user" && (
                        <div className={`${user.role}-flair flair-search search-result-description`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                    )}
                  </div>
                  <span className="arrow">&rarr;</span>
                </div>
              );
            }
          })}
        </div>
      )}

      {showResults && searchTerm && searchResults.length === 0 && (
        <div className="search-results no-results">
          <div className="no-results-message">
            No videos or users found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedSearch;
