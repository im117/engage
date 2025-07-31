import "../styles/topbar.scss";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationBell from "../notificationBell";
import axios from "axios";
import { getLoggedInUserId, getUserInfo } from "../userUtils";

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081";

if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

export default function TopBar() {
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState(0);
  const [profilePicture, setProfilePicture] = useState("");
  const navigate = useNavigate();

  // const authButtons = async ()=>{
  //   let button = "";
  //   const userId = await getLoggedInUserId()

  //    if (userId !== null) {

  //     const username = await getUsername(userId);
  //     button = "<button className='control-button' onClick={() => navigate('/user')}" + username + " <i className='fa-solid fa-user'></i> </button>"

  //   } else {
  //     button = "<button className='control-button' onClick={handleBackToLogin}>Log In <i className='fa solid fa-right-to-bracket'></i></button>"
  //   }
  //   const sanitizedHTML = DOMPurify.sanitize(button);
  //   return (
  //     <div className="login-button-section" dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
  //   )
  // }

  getLoggedInUserId().then((userID) => {
    setUserID(userID);
    
  });

async function assignUsername() {
  if (userID !== 0) {
    const { username } = await getUserInfo(userID);
    setUsername(username);
  }
}
assignUsername();
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${loginServer}/user-profile-by-username/${username}`
      );
      if (response.data.profile.profilePictureUrl) {
        setProfilePicture(response.data.profile.profilePictureUrl);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  if (username) {
    fetchUserProfile();
  }
}, [username]);

  return (
    <nav className="topbar">
      <div className="topbar__container">
        <div className="topbar__logo">
          <a onClick={() => navigate("/")}>
            <img
              className="topbar__icon"
              src="/src/assets/icon.svg"
              alt="Engage Logo"
            />
            <h1 className="desktop__text">Engage</h1>
          </a>
        </div>
        <div className="topbar__menu">
          <ul className="link__items">
          <li>
                <a className="button" onClick={() => navigate('/about')}>
                  <i className="fa-solid fa-circle-info persist"></i>{" "} 
                  <span className="desktop__text">About</span></a>
              </li>
            <li>
              <a className="button" onClick={() => navigate("/upload")}>
                <i className="fa-solid fa-upload persist"></i>{" "}
                <span className="desktop__text">Upload</span>
              </a>
            </li>
            {/* Added Search button */}
            {/* <li>
              <a className="button" onClick={() => navigate("/search")}>
                <i className="fa-solid fa-search persist"></i>{" "}
                <span className="desktop__text">Search</span>
              </a>
            </li> */}
            <li>
              <a
                className={userID !== 0 ? "user" : "button"}
                onClick={
                  userID !== 0 ? () => navigate("/user") : () => navigate("/login")
                }
              >
                {userID !== 0 ? (
                  <>
                  <img
              src={
                profilePicture
              }
              alt="Profile"
              className="profile-picture-bar"
            />
                  </>
                ) : (
                  <>
                    <i className="fa solid fa-right-to-bracket persist"></i>{" "}
                    <span className="desktop__text">Log In</span>
                  </>
                )}
              </a>
            </li>
            <li>
              <NotificationBell />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
