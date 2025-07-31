import axios from "axios";
import { uploadServer, loginServer } from "./App";

export interface UserType {
  username: string;
  profilePictureUrl: string;
  dateCreated: string;
}

export async function getUserInfo(userid: number) {
    let user: UserType = {
      username: "",
      profilePictureUrl: "https://via.placeholder.com/100",
      dateCreated: "1970-01-01",
    };
    await axios
      .get(`${uploadServer}/user`, {
        params: { userID: userid },
      })
      .then((response) => {
        user.username = response.data.username;
        user.profilePictureUrl = response.data.profilePictureUrl;
        user.dateCreated = response.data.dateCreated;
      });
    
    return user;
  }

export async function getLoggedInUserId() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await axios.get(`${loginServer}/current-user-id`, {
          params: { auth: token ? token : "" },
        });
        return response.data.userId;
      } catch (error) {
        console.error("Error fetching user ID:", error);
        return 0;
      }
    } else {
      return 0;
    }
  }