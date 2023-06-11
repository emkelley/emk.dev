import axios from "axios";
import { URLSearchParams } from "url";

const getAccessToken = async () => {
  const config = useRuntimeConfig();
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", config.spotifyRefreshToken);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(config.spotifyClient + ":" + config.spotifySecret).toString(
          "base64"
        ),
    },
    body: params,
  });

  if (!response.ok) {
    console.log(response.status, response.statusText);

    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  return data.access_token;
};

export default defineEventHandler(async (event) => {
  const accessToken = await getAccessToken();

  if (!accessToken) return "No access token";

  console.log(`Access token: ${accessToken}`);

  try {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(data);

    return data;
  } catch (error: any) {
    console.log(error.response.data);

    return error;
  }
});
