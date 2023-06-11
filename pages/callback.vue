<template>
  <div
    class="w-full py-24 text-white flex flex-col gap-12 justify-center items-center text-center"
  >
    <h1>Spotify Authorization Data</h1>
    <p>
      Access Token: <br />
      <code>{{ authData?.access_token || "--" }}</code>
    </p>
    <p>
      Refresh Token: <br />
      <code>{{ authData?.refresh_token || "--" }}</code>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const authData = ref<any>(null);
const route = useRoute();

onMounted(async () => {
  const code = route.query.code as string;
  if (code) {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        {
          code,
          redirect_uri: "http://localhost:3000/callback",
          grant_type: "authorization_code",
        },
        {
          headers: {
            Authorization: `Basic ${window.btoa(
              "e97d8afe2ca74a008b96d621dbe8edef:990f1c0b3af6439da225979b828893cf"
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      authData.value = response.data;
    } catch (error) {
      console.error("Error getting tokens", error);
    }
  }
});
</script>
