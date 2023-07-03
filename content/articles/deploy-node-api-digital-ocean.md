---
title: Deploying a Node.js API on Digital Ocean
description: A guide for deploying a Node app to Digital Ocean including LetsEncrypt and PM2.
createdAt: 2023-07-03
updatedAt: 2023-07-03
tags: ['hosting', 'api', 'express', 'nodejs', 'digital-ocean']
---

## Getting Started
At the top of the page, you should see a green Create button. Click on that and then click the Droplets option.

## Creating a Droplet
I'm not going to go too in-depth in this section, but some general guidelines to follow when creating your Droplet:
1. Pick a region that is geographically close to to your users. For example if your users primarily live in Germany, pick the Frankfurt region instead of something like San Francisco.
2. A general rule is that you should pick the newest Ubuntu LTS available unless your app require features found in non-LTS releases.
3. Unless you are anticipating a lot of traffic, the $6/mo Regular should be fine to start. If you plan to run multiple apps off of the same Droplet, consider bumping up to the $12/mo Regular option.
4. Best practice for authentication is to use SSH and NOT a Password. Select your existing key(s) or add a new one.
5. Next, give your droplet a better Hostname instead of the pre-generated one.
6. Lastly, click the blue Create Droplet button at the bottom
7. You'll be redirected back to your projects page and you will see your Droplet getting set up. Once that is finished, move onto the next section.

## Connecting with SSH
You should now see your Droplet in your projects page with the Hostname you gave it in the last step. For brevity, I will just be using the root user and not creating a separate user. If planning on deploying something more serious than a side project, I highly advise you to create a dedicated user for that.

### Connect to the Droplet:
Open a terminal (or Powershell on Windows) and ssh into the droplet as a root user using the Droplet's IP address:

```bash
ssh root@0.0.0.0
```

The first time you connect to any server via ssh, you will need to accept the authenticity of the host. Type `yes` when prompted.

<br>

Next, install any updates for your system by running:

```bash
sudo apt update
```

### Install Node and NPM

By default, the version of Node.js in the Ubuntu repositories is 8.x which is not the latest version. To get the latest version, we will install it from the [NodeSource](https://nodesource.com/) repository. If you're reading this in the future, you may need to update the version number in the command below.

```bash
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install nodejs

# Check it installed correctly
node --version
```

## Clone your project from Github
There are a few ways to get your files on to the server, I would suggest using Git. You may need to log into Github via the cli if you are using 2FA or are pulling a private repo. If you have not already, set your username and email:

```bash
git config --global user.name "yourusername"
git config --global user.email "youremail"
```

```bash
git clone <GITHUB_PROJECT_URL>
```

### Install dependencies and test app

```bash
cd yourproject
npm install
npm start (or whatever your start command)
```
At this stage, you should be able to access your app using your IP and port. For example, if your Droplet IP is
`1.1.1.1` and your app is running on port 3000, you would access it by going to `http://1.1.1.1:3000` in your browser.
<br>

After confirming your app is working, stop it by pressing `ctrl+C`. Notice how when the app was running, you couldn't do anything else in the terminal? We will fix this in the next section.

## Configure PM2
[PM2](https://pm2.io/) is a process manager for Node.js applications. It allows you to keep your apps running in the background, restart them, and much more:

```bash
sudo npm i pm2 -g
pm2 start server.js (or whatever your start command)

# Other pm2 commands
pm2 status

# 0 being the id of the app given in the status command
pm2 monit 0
```

One last thing to do with PM2 is to set it to start on boot. To do this, run the following command:
```sh
# To make sure app starts when reboot
pm2 startup ubuntu

```

You should now be able to access your app using your IP and port. Now we want to setup a firewall blocking that port and setup NGINX as a reverse proxy so we can access it directly using port 80 (http)

## Setup ufw firewall
[ufw](https://help.ubuntu.com/community/UFW) is a firewall that is installed by default on Ubuntu. We want to block all ports except for 22 (ssh), 80 (http), and 443 (https). If you are using a different port for your app, you will need to allow that port as well.

```sh
sudo ufw enable
sudo ufw status
sudo ufw allow ssh (Port 22)
sudo ufw allow http (Port 80)
sudo ufw allow https (Port 443)
```

## Install NGINX and configure

First, install [NGINX](https://www.nginx.com/):

```bash
sudo apt install nginx
```

Next, the sites-available configuration needs to be updated to [reverse-proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) our app. Open the default file:

```sh
sudo nano /etc/nginx/sites-available/default
```

Add the following to the location part of the server block. Be sure to replace `yourdomain.com` with your actual domain name, as well as the port if you are not using 3000.

```sh
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

### Check NGINX config
Let's verify everything is working so far by checking the NGINX config:
```sh
sudo nginx -t
```
### Apply Changes
Assuming there are no errors, restart NGINX to apply the changes:
```sh
sudo service nginx restart
```

 You should now be able to visit your IP with no port (port 80) and see your app. Now let's add a domain

## Add a domain

Add an `A` record for your domain name and point it to your Droplet's IP address.

It is import to wait for your DNS to propagate before continuing and setting up SSL - it will fail if you don't. You can check the status of your DNS propagation using a tool like [this](https://www.whatsmydns.net/).


## (Optional) Cloudflare SSL Config
If you do not use Cloudflare Domains as your registrar, ignore this section and proceed with the LetsEncrypt setup.

<br/>
<br/>

If you do use Cloudflare Domains, you will need to update your SSL mode in the dashboard from Flexible to Full. If you don't you will get an error in browsers when accessing the site complaining about too many redirects. If you change your SSL mode from "Flexible" to "Full" (or higher), it should stop looping.

<br/>

![image alt text](/img/deploy-node/cloudflare_ssl.webp)


## Add SSL with LetsEncrypt

[Let's Encrypt](https://letsencrypt.org/) is a free, automated, and open certificate authority (CA), run for the public's benefit. It is a service provided by the [Internet Security Research Group (ISRG)](https://www.abetterinternet.org/).

To get your cert set up, run the following commands. These are taken from the [certbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx) website. Be sure to replace `yourdomain.com` with your actual domain name.

```sh
sudo install snapd
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d yourdomain.com

# Only valid for 90 days but will auto-renew; test the renewal process with
certbot renew --dry-run
```

Now visit https://yourdomain.com and you should see your Node app!
<!--more-->
<br/>