// Function to search for videos based on title
async function searchVideos(searchTerm: string) {
  if (!searchTerm.trim()) {
    return []; // Return empty array for empty search
  }

  try {
    // Fetch all videos from the server
    const response = await axios.get(`${uploadServer}/video-list`);
    const allVideos = response.data;

    if (!allVideos || !allVideos.length) {
      return [];
    }
    // Score each video based on how well it matches the search term
    const scoredVideos = allVideos.map((video: any) => {
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
      .filter((video: any) => video.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    return matchedVideos;
  } catch (error) {
    console.error("Error searching videos:", error);
    return [];
  }
}

// Component for video search functionality
const VideoSearch = ({ onResultSelect }: { onResultSelect: (video: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

// Debounce search to prevent too many requests
useEffect(() => {
  const delayDebounceFn = setTimeout(async () => {
    if (searchTerm) {
      setIsSearching(true);
      const results = await searchVideos(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
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

const handleResultClick = (fileName: string) => {
  onResultSelect(fileName);
  setSearchTerm("");
  setShowResults(false);
};

// Close search results when clicking outside
useEffect(() => {
  const handleClickOutside = () => {
    setShowResults(false);
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, []);