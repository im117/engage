import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { loginServer, uploadServer } from "../App";

export interface CommentType {
    id: number;
    username: string;
    comment: string;
    created_at: string;
    replies?: ReplyType[];
    replyCount?: number;
}
export interface ReplyType {
    id: number;
    username: string;
    reply: string;
    created_at: string;
}

// TODO port some of the state sharing over to context
export default function CommentSection({ comments, handleUsernameClick, displayComments, userID, setUserID, currentVideo, setNotification, replyLiked, setReplyLiked }:
    {
        comments: CommentType[],
        handleUsernameClick: (username: string) => void,
        userID: number,
        setUserID: Dispatch<SetStateAction<number>>
        displayComments: () => void,
        currentVideo: string,
        setNotification: Dispatch<SetStateAction<string>>,
        replyLiked: { [key: number]: boolean },
        setReplyLiked: Dispatch<SetStateAction<{ [key: number]: boolean }>>,
    }) {

    // state
    const [commentLiked, setCommentLiked] = useState<{ [key: number]: boolean }>({});
    const [commentLikeCount, setCommentLikeCount] = useState<{ [key: number]: number }>({});
    const [repliesVisible, setRepliesVisible] = useState<{ [key: number]: boolean }>({});
    const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
    const [replyVisible, setReplyVisible] = useState<{ [key: number]: boolean }>({});
    const [comment, setComment] = useState("");
    const [replyLikeCount, setReplyLikeCount] = useState<{ [key: number]: number }>({});


    useEffect(() => {
        const fetchCommentLikes = async () => {
            if (!comments.length) return;
            const token = localStorage.getItem("authToken");
            const initialLikedState = { ...commentLiked };
            const initialLikeCountState = { ...commentLikeCount };

            for (const comment of comments) {
                if (initialLikeCountState[comment.id] === undefined) {
                    try {
                        const likeCountResponse = await axios.get(
                            `${loginServer}/comment-like-count`,
                            {
                                params: { comment_id: comment.id },
                            }
                        );
                        initialLikeCountState[comment.id] =
                            likeCountResponse.data.like_count;
                    } catch (err) {
                        console.error(
                            `Error fetching like count for comment ${comment.id}:`,
                            err
                        );
                        initialLikeCountState[comment.id] = 0;
                    }
                }
                if (userID != undefined && token && initialLikedState[comment.id] === undefined) {
                    try {
                        const likeStatusResponse = await axios.get(
                            `${loginServer}/fetch-comment-liked`,
                            {
                                params: { auth: token, comment_id: comment.id },
                            }
                        );
                        initialLikedState[comment.id] = likeStatusResponse.data.liked;
                    } catch (err) {
                        console.error(
                            `Error fetching like status for comment ${comment.id}:`,
                            err
                        );
                        initialLikedState[comment.id] = false;
                    }
                }
            }
            if (userID != undefined) {
                setCommentLiked(initialLikedState);
            }
            setCommentLikeCount(initialLikeCountState);
        };
        fetchCommentLikes();
    }, [comments]);

    useEffect(() => {
        const fetchReplyLikes = async () => {
            if (!comments.length) return;
            const token = localStorage.getItem("authToken");
            const initialLikedState = { ...replyLiked };
            const initialLikeCountState = { ...replyLikeCount };

            for (const comment of comments) {
                if (Array.isArray(comment.replies)) {
                    for (const reply of comment.replies) {
                        if (initialLikeCountState[reply.id] === undefined) {
                            try {
                                const likeCountResponse = await axios.get(
                                    `${loginServer}/reply-like-count`,
                                    {
                                        params: { reply_id: reply.id },
                                    }
                                );
                                initialLikeCountState[reply.id] =
                                    likeCountResponse.data.like_count;
                            } catch (err) {
                                console.error(
                                    `Error fetching like count for reply ${reply.id}:`,
                                    err
                                );
                                initialLikeCountState[reply.id] = 0;
                            }
                        }
                        if (
                            userID &&
                            token &&
                            initialLikedState[reply.id] === undefined
                        ) {
                            try {
                                const likeStatusResponse = await axios.get(
                                    `${loginServer}/fetch-reply-liked`,
                                    {
                                        params: { auth: token, reply_id: reply.id },
                                    }
                                );
                                initialLikedState[reply.id] = likeStatusResponse.data.liked;
                            } catch (err) {
                                console.error(
                                    `Error fetching like status for reply ${reply.id}:`,
                                    err
                                );
                                initialLikedState[reply.id] = false;
                            }
                        }
                    }
                }
            }
            if (userID) {
                setReplyLiked(initialLikedState);
            }
            setReplyLikeCount(initialLikeCountState);
        };
        fetchReplyLikes();
    }, [comments, userID]);

    const formatDate = (dateString: string | number | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            hour: "numeric",
            day: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
        });
    };

    // Toggle visibility of replies for a specific comment.
    const toggleRepliesVisible = (commentId: number) => {
        setRepliesVisible((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    async function postReply(commentId: number) {
        const replyText = replyInputs[commentId];
        if (!replyText || replyText.trim() === "") return;
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(
                `${uploadServer}/post-reply`,
                { comment_id: commentId, reply: replyText },
                { headers: { Authorization: token } }
            );
            setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
            displayComments();
        } catch (error) {
            console.error("Error posting reply:", error);
        }
        toggleReplyInput(commentId);
    }

    // Toggle the reply input for a specific comment.
    const toggleReplyInput = (commentId: number) => {
        setReplyVisible((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    async function handleCommentLike(comment_id: number) {
        if (!userID) {
            alert("You must be logged in to like comments.");
            return;
        }
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Authentication error. Please log in again.");
            setUserID(0);
            return;
        }
        const fileName = currentVideo.split("/").pop();
        if (!fileName) {
            console.error("Error: fileName is missing.");
            return;
        }
        try {
            const response = await axios.post(
                `${loginServer}/like-comment`,
                { fileName, comment_id },
                { params: { auth: token } }
            );
            setCommentLiked((prev) => {
                const newState = { ...prev, [comment_id]: !prev[comment_id] };
                setCommentLikeCount((prevCounts) => {
                    const currentCount = prevCounts[comment_id] || 0;
                    return {
                        ...prevCounts,
                        [comment_id]: newState[comment_id]
                            ? currentCount + 1
                            : Math.max(0, currentCount - 1),
                    };
                });
                return newState;
            });
        } catch (error) {
            console.error("Error liking/unliking comment:", error);
            alert("Failed to process like. Please try again.");
        }
    }

    const postComment = async () => {
        if (comment.trim() === "") return;
        try {
            const token = localStorage.getItem("authToken");
            const fileName = currentVideo.split("/").pop();
            const videoRes = await axios.get(`${uploadServer}/video`, {
                params: { fileName },
            });
            if (!videoRes.data || !videoRes.data.id) {
                setNotification("⚠️ Video not found.");
                setTimeout(() => setNotification(""), 3000);
                return;
            }
            const videoId = videoRes.data.id;
            await axios.post(
                `${uploadServer}/post-comment`,
                { video_id: videoId, comment },
                { headers: { Authorization: token } }
            );
            setComment("");
            setNotification("✅ Successfully commented!");
            setTimeout(() => setNotification(""), 3000);

            displayComments();
        } catch (error) {
            console.error("Error posting comment:", error);
            setNotification("⚠️ Failed to post comment.");
            setTimeout(() => setNotification(""), 3000);
        }
    };

    async function handleReplyLike(reply_id: number) {
        if (!userID) {
            alert("You must be logged in to like replies.");
            return;
        }
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Authentication error. Please log in again.");
            setUserID(0);
            return;
        }
        const fileName = currentVideo.split("/").pop();
        if (!fileName) {
            console.error("Error: fileName is missing.");
            return;
        }
        try {
            const response = await axios.post(
                `${loginServer}/like-reply`,
                { fileName, reply_id },
                { params: { auth: token } }
            );
            setReplyLiked((prev) => {
                const newState = { ...prev, [reply_id]: !prev[reply_id] };
                setReplyLikeCount((prevCounts) => {
                    const currentCount = prevCounts[reply_id] || 0;
                    return {
                        ...prevCounts,
                        [reply_id]: newState[reply_id]
                            ? currentCount + 1
                            : Math.max(0, currentCount - 1),
                    };
                });
                return newState;
            });
        } catch (error) {
            console.error("Error liking/unliking reply:", error);
            alert("Failed to process like. Please try again.");
        }
    }


    return (
        <>
            <div className="comment-section-container">
                <div className="comment-section">
                    <div className="comments-list">
                        {comments.map((c) => (
                            <div
                                key={c.id}
                                className="comment-box"
                                style={{ /*color: "black", */ textAlign: "left" }}
                            >
                                <strong>
                                    <a
                                        onClick={() => handleUsernameClick(c.username)}
                                        className="username-link"
                                    >
                                        {c.username}
                                    </a>
                                </strong>
                                : <span>{c.comment}</span>
                                <br />
                                <span className="comment-date">
                                    ({formatDate(c.created_at)})
                                </span>
                                <div
                                    className="comment-like-section"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                    }}
                                >
                                    <button
                                        onClick={() => handleCommentLike(c.id)}
                                        style={{
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px",
                                            transition: "background-color 0.2s ease",
                                            color: commentLiked[c.id] ? "red" : "black",
                                        }}
                                    >
                                        <i className="fa-regular fa-thumbs-up"></i>
                                    </button>
                                    <div id={`comment-count-${c.id}`}>
                                        {commentLikeCount[c.id] !== undefined
                                            ? commentLikeCount[c.id]
                                            : ""}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        width: "100%",
                                    }}
                                >
                                    {/* Row for reply count and toggle button */}
                                    {c.replies && c.replies.length > 0 && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                color: "black",
                                            }}
                                        >
                                            <button
                                                onClick={() => toggleRepliesVisible(c.id)}
                                                style={{
                                                    border: "none",
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {repliesVisible[c.id] ? (
                                                    <i
                                                        className="fa-solid fa-chevron-up"
                                                        style={{ fontSize: "1.2em", color: "#333" }}
                                                    ></i>
                                                ) : (
                                                    <i
                                                        className="fa-solid fa-chevron-down"
                                                        style={{ fontSize: "1.2em", color: "#333" }}
                                                    ></i>
                                                )}
                                            </button>
                                            <span className="reply-count">
                                                {c.replyCount}{" "}
                                                {c.replyCount === 1 ? "reply" : "replies"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Reply button on its own line */}
                                    {userID && (
                                        <div style={{ width: "100%" }}>
                                            <div style={{ marginBottom: "8px" }}>
                                                <button onClick={() => toggleReplyInput(c.id)}>
                                                    <i className="fa-regular fa-comment-dots"></i>
                                                </button>
                                            </div>

                                            {/* Input and send button */}
                                            {replyVisible[c.id] && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        width: "100%",
                                                        gap: "8px",
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={replyInputs[c.id] || ""}
                                                        onChange={(e) =>
                                                            setReplyInputs((prev) => ({
                                                                ...prev,
                                                                [c.id]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Write a reply..."
                                                        style={{
                                                            padding: "8px",
                                                            width: "80%",
                                                            boxSizing: "border-box",
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "flex-end",
                                                        }}
                                                    >
                                                        <button onClick={() => postReply(c.id)}>
                                                            <i className="fa-regular fa-paper-plane"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {repliesVisible[c.id] &&
                                    c.replies &&
                                    c.replies.length > 0 && (
                                        <div style={{ marginLeft: "20px" }}>
                                            {c.replies.map((r) => (
                                                <div>
                                                    <div>
                                                        <p key={r.id}>
                                                            <strong>
                                                                <a
                                                                    onClick={() =>
                                                                        handleUsernameClick(r.username)
                                                                    }
                                                                    className="username-link"
                                                                >
                                                                    {r.username}
                                                                </a>
                                                            </strong>
                                                            : {r.reply}
                                                            <br />
                                                            <span className="comment-date">
                                                                ({formatDate(r.created_at)})
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "3px",
                                                            position: "relative",
                                                            top: "-10px",
                                                            marginBottom: "-10px",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleReplyLike(r.id)}
                                                            style={{
                                                                backgroundColor: "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                color: replyLiked[r.id]
                                                                    ? "red"
                                                                    : "black",
                                                            }}
                                                        >
                                                            <i className="fa-regular fa-thumbs-up"></i>
                                                        </button>
                                                        <div id={`like-count-${r.id}`}>
                                                            {replyLikeCount[r.id] !== undefined
                                                                ? replyLikeCount[r.id]
                                                                : ""}
                                                        </div>{" "}
                                                        {/* Unique ID for like count */}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                    {userID && (
                        <div
                            //className="comment-input-div"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                gap: "8px",
                            }}
                        >
                            <input
                                //id="comment-input"
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                style={{
                                    padding: "5px",
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            ></input>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button onClick={postComment}>
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="overlay-top"></div>
                <div className="overlay-bottom"></div>
            </div>
        </>

    );
}