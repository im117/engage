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