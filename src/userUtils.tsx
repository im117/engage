import axios from "axios";
import { uploadServer } from "./App";

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