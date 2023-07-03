---
title: Downloading Twitch Clips Using the Twitch API
description: Learn how to get Twitch Clip download links using the Node, Typescript, and the official Twitch API.
createdAt: 2023-05-26
updatedAt: 2023-05-26
tags: ['twitch', 'api', 'typescript', 'nodejs']
---
## Prerequisites:

Before we get started, you'll need the following:

1.  A basic understanding of Node.js and TypeScript.
2.  Node.js >= 18 installed on your machine.
3.  A <a href="https://dev.twitch.tv/console" target="_blank">Twitch Developer account</a> and API credentials (Client ID and Client Secret) for your registered app.

## Getting Started
First, let's set up our project directory and initialize a new Node.js project. Create a new folder for this project and navigate to it in your terminal, then run the following command to initialize a new Node.js project:

```bash
npm init -y
```

This command will create a `package.json` file with default values. The `-y` flag will automatically accept all the default values.

Next, create a new `index.ts` file in your project's folder. This will be our main file where we will write our code.



### Dependencies:
Next, install TypeScript and the required libraries using your package manager of choice:

```bash
yarn add ts-node axios dotenv
````

### Environment Variables:
Set up environment variables. Create a `.env` file in your project root directory with your Twitch API credentials. They can be found in the Twitch Developer Dashboard.

```env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

## Getting an Access Token:
In the `main.ts` file, import the required libraries and write the `getAccessToken` function. This function sends a POST request to the Twitch API to obtain an access token so we can make requests to other endpoints.

```ts
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const getAccessToken = async () => {
  const response = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  );
  return response.data.access_token;
};
```

## Getting Clip Information:
Next, implement the `getClipInformation` function. This function sends a GET request to the Twitch API to retrieve clip information using the clip slug and access token.

```typescript
const getClipInformation = async (clipSlug: string, accessToken: string) => {
  const response = await axios.get(`https://api.twitch.tv/helix/clips?id=${clipSlug}`, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return response.data.data[0];
};
```

## Creating the MP4 Link:
The Twitch API does not provide direct links to the Clip's video file so we need to get a little creative. Essentially we are going to use the preview thumbnail image URL and modify it to get a working `.mp4` URL like so:

```ts
const getRawMp4Link = async (clipSlug: string) => {
    try {
        const accessToken = await getAccessToken();
        const clipInfo = await getClipInformation(clipSlug, accessToken);
        return clipInfo.thumbnail_url.replace('-preview-480x272.jpg', '.mp4');
    } catch (error) {
        console.error('Failed to get the raw MP4 link:', error.message);
    }
};
```

## Testing and Running the App:
And that's the hard part done! Now we just need to test our code. Let's add a clip slug and call the `getRawMp4Link` function to get the raw MP4 link.

```ts
const clipSlug = 'your_clip_slug_here';

getRawMp4Link(clipSlug).then((mp4Link) => {
  console.log('Raw MP4 Link:', mp4Link);
});
```

In the end, our file should look like this:
```ts
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const getAccessToken = async () => {
  const response = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  );
  return response.data.access_token;
};

const getClipInformation = async (clipSlug: string, accessToken: string) => {
  const response = await axios.get(
    `https://api.twitch.tv/helix/clips?id=${clipSlug}`,
    {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log(response.headers["ratelimit-remaining"]);
  return response.data.data[0];
};

const getRawMp4Link = async (clipSlug: string) => {
  try {
    const accessToken = await getAccessToken();
    const clipInfo = await getClipInformation(clipSlug, accessToken);
    return clipInfo.thumbnail_url.replace("-preview-480x272.jpg", ".mp4");
  } catch (error) {
    console.error("Failed to get the raw MP4 link:", error);
  }
};

/*
Example: https://www.twitch.tv/theprimeagen/clip/ExcitedCrazySquirrelPraiseIt-giTnEC-D9SXb0-nA

Your clip slug for this url would be 'ExcitedCrazySquirrelPraiseIt-giTnEC-D9SXb0-nA'

*/
const clipSlug = "your_clip_slug_here";

getRawMp4Link(clipSlug).then((mp4Link) => {
  console.log(mp4Link);
});
```

Now, run the file with `ts-node`:

```bash
ts-node ./index.ts
```

If everything is set up correctly, you should see the raw MP4 link printed to the console.

Keep in mind that the Twitch API may change over time, so you may need to update your code to work with newer versions of the API. Happy coding!
<!--more-->
<br/>