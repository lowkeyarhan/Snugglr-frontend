import { api } from "./http";

export type InstitutionRef =
  | string
  | {
      _id: string;
      name?: string;
    };

export type MyProfile = {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: "user" | "admin" | "superadmin";

  profilePicture?: string;
  phoneNumber?: string;
  collegeName?: string;
  institution: InstitutionRef;
  birthday?: string;
  gender?: "male" | "female" | "non-binary" | "other" | "prefer-not-to-say";
  pronouns?: string;

  favArtists?: string[];
  favMovies?: string[];
  favAlbums?: string[];
  favSpotOnCampus?: string;
  loveLanguage?: string;
  quirkyFacts?: string;
  idealDate?: string;
  fantasies?: string;

  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// update the user profile
export const updateUserProfile = async (
  data: {
    name?: string;
    profilePicture?: string;
    phoneNumber?: string;
    birthday?: string;
    pronouns?: string;
    gender?: string;
    hint?: string;
    community?: string;
    interests?: string[];
    musicPreferences?: string;
    favoriteShows?: string;
    memeVibe?: string;
    favArtists?: string[];
    favMovies?: string[];
    favAlbums?: string[];
    favSpotOnCampus?: string;
    loveLanguage?: string;
    quirkyFacts?: string;
    idealDate?: string;
    fantasies?: string;
  },
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: MyProfile;
}> => {
  try {
    const response = await api.put("/api/profile/update", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message ||
          "Failed to update profile. Please try again."
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// get the current user profile
export const getMyProfile = async (
  token: string
): Promise<{
  success: boolean;
  data: MyProfile;
}> => {
  try {
    const response = await api.get("/api/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message ||
          "Failed to fetch profile. Please try again."
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
