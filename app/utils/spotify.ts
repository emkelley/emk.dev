import axios from "axios";

export const getSpotifyNowPlaying = async () => {
  try {
    const { data } = await axios.get("/api/spotify");
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

export const authorize = () => {
  const clientId = "e97d8afe2ca74a008b96d621dbe8edef";
  const redirectUri = `${window.location.origin}/callback`;
  const scopes = "user-read-currently-playing";

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}${
    scopes ? "&scope=" + encodeURIComponent(scopes) : ""
  }&redirect_uri=${encodeURIComponent(redirectUri)}`;

  window.location.href = authUrl;
};
