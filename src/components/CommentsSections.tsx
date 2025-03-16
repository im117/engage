import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Define props interface for the CommentSection component
interface CommentSectionProps {
  videoId: string;
  userId: number;
  isLoggedIn: boolean;
}

// Define the Comment interface
interface Comment {
  id?: number;
  userId?: number;
  username: string;
  text: string;
  createdAt?: string;
}

// Store comments for each video separately
const globalLocalComments: Record<string, Comment[]> = {};

const CommentSection: React.FC<CommentSectionProps> = ({ videoId, userId, isLoggedIn }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Track per-video local comments
  const [useLocalMode, setUseLocalMode] = useState(false);
  
  // Use the same server URLs as in App.tsx
  const loginServer = import.meta.env.VITE_LOGIN_SERVER || "http://localhost:8081";
  const uploadServer = import.meta.env.VITE_UPLOAD_SERVER || "http://localhost:3001";

  // Function to get stored comments from localStorage
  const getStoredComments = (videoId: string): Comment[] => {
    try {
      const storedData = localStorage.getItem(`comments_${videoId}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error loading comments from localStorage:', error);
    }
    return [];
  };

  // Function to save comments to localStorage
  const saveCommentsToStorage = (videoId: string, comments: Comment[]) => {
    try {
      localStorage.setItem(`comments_${videoId}`, JSON.stringify(comments));
    } catch (error) {
      console.error('Error saving comments to localStorage:', error);
    }
  };

  // Initialize local comments for this video if needed
  useEffect(() => {
    if (!globalLocalComments[videoId]) {
      globalLocalComments[videoId] = [];
    }
    
    // Reset state when videoId changes
    setComments([]);
    setNewComment('');
    setUseLocalMode(false);
    
    // Fetch comments for the new video
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const fetchComments = async () => {
    if (!videoId) return;
    
    setIsLoading(true);
    try {
      // Try the login server first 
      try {
        const response = await axios.get(`${loginServer}/video-comments/${videoId}`);
        console.log(`Fetched comments for video ${videoId}:`, response.data);
        setComments(response.data || []);
        return;
      } catch (error) {
        console.error('First attempt failed:', error);
      }
      
      // Try second endpoint pattern
      try {
        const response = await axios.get(`${loginServer}/comments/${videoId}`);
        console.log("Fetched comments from second endpoint:", response.data);
        setComments(response.data || []);
        return;
      } catch (error) {
        console.error('Second attempt failed:', error);
      }
      
      // Try the upload server as a fallback
      try {
        const fallbackResponse = await axios.get(`${uploadServer}/comments/${videoId}`);
        console.log("Fetched comments from upload server:", fallbackResponse.data);
        setComments(fallbackResponse.data || []);
        return;
      } catch (fallbackError) {
        console.error('Upload server fallback failed:', fallbackError);
      }
      
      // If all attempts fail, use local comments for this specific video
      console.log("All server attempts failed, using local comments for video:", videoId);
      setUseLocalMode(true);
      const storedComments = getStoredComments(videoId);
      setComments(storedComments);
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      setUseLocalMode(true);
      const storedComments = getStoredComments(videoId);
      setComments(storedComments);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!isLoggedIn) {
      alert('Please log in to post a comment.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }

    setIsLoading(true);
    
    // If previous attempts failed, just use local mode immediately
    if (useLocalMode) {
      handleLocalComment();
      return;
    }
    
    try {
      console.log(`Attempting to post comment for video: ${videoId}, text: ${newComment}`);
      
      // Expanded list of potential endpoint patterns
      const endpoints = [
        // Format 1: RESTful API pattern with token in header
        {
          url: `${loginServer}/comments/${videoId}`,
          data: { text: newComment },
          config: { headers: { Authorization: `Bearer ${token}` } }
        },
        // Format 2: Query parameter for auth
        {
          url: `${loginServer}/comment`,
          data: { videoId: videoId, text: newComment },
          config: { params: { auth: token } }
        },
        // Format 3: Using fileName instead of videoId
        {
          url: `${loginServer}/comment`,
          data: { fileName: videoId, text: newComment },
          config: { headers: { Authorization: `Bearer ${token}` } }
        },
        // Format 4: Upload server endpoint
        {
          url: `${uploadServer}/comments`,
          data: { videoId: videoId, text: newComment },
          config: { headers: { Authorization: `Bearer ${token}` } }
        },
        // Format 5: API prefix pattern
        {
          url: `${loginServer}/api/comments/${videoId}`,
          data: { text: newComment },
          config: { headers: { Authorization: `Bearer ${token}` } }
        },
        // Format 6: Different verb (add-comment)
        {
          url: `${loginServer}/add-comment`,
          data: { videoId: videoId, commentText: newComment },
          config: { headers: { Authorization: `Bearer ${token}` } }
        },
        // Format 7: Different parameter structure
        {
          url: `${loginServer}/post-comment`,
          data: { video: { id: videoId }, content: newComment },
          config: { headers: { Authorization: `Bearer ${token}` } }
        }
      ];

      let succeeded = false;
      let lastError = null;

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint.url}`);
          const response = await axios.post(endpoint.url, endpoint.data, endpoint.config);
          console.log("Comment posted successfully:", response.data);
          succeeded = true;
          break;
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.log(`Endpoint ${endpoint.url} failed:`, error.message);
          } else {
            console.log(`Endpoint ${endpoint.url} failed with an unknown error`);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          lastError = error;
        }
      }

      if (succeeded) {
        setNewComment('');
        fetchComments(); // Refresh comments after posting
      } else {
        // If all server attempts failed, use local comment mode as a fallback
        console.log("All server attempts failed, using local comment mode");
        handleLocalComment();
      }
    } catch (error: unknown) {
      console.error('All comment posting attempts failed:', error);
      handleLocalComment();
    }
  };
  
  // Function to handle storing comments locally when the API fails
  const handleLocalComment = () => {
    const username = localStorage.getItem('username') || "You";
    
    // Create a new local comment
    const newLocalComment: Comment = {
      username: username,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    
    // Get existing stored comments for this video
    const storedComments = getStoredComments(videoId);
    
    // Add new comment
    const updatedComments = [...storedComments, newLocalComment];
    
    // Save to localStorage
    saveCommentsToStorage(videoId, updatedComments);
    
    // Update the displayed comments
    setComments(updatedComments);
    setNewComment('');
    setIsLoading(false);
    console.log(`Comment saved locally for video: ${videoId}`);
    
    // Set mode to local for future comments
    setUseLocalMode(true);
  };

  // Add function to manually handle textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("Textarea change detected:", e.target.value);
    setNewComment(e.target.value);
  };

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (isLoggedIn && textareaRef.current) {
      // Small timeout to ensure rendering is complete
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isLoggedIn]);

  return (
    <div className="comment-section">
      <h3>Comments for {videoId}</h3>
      {isLoggedIn ? (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextareaChange}
            placeholder="Write a comment..."
            className="comment-textarea"
            style={{ pointerEvents: 'auto' }}
          />
          <button type="submit" className="comment-submit-btn" disabled={isLoading || !newComment.trim()}>
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="login-prompt">Please log in to post a comment.</p>
      )}
      <div className="comments-list">
        {isLoading && comments.length === 0 ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <p><strong>{comment.username}</strong>: {comment.text}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;