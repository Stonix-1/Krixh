const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "admin",
    aliases: ["owner", "creator"],
    version: "1.0",
    author: "Krishhb",
    role: 0,
    shortDescription: { en: "Displays information about the bot's creator." },
    longDescription: { en: "Provides details about the bot's creator, including name, Facebook link, photo, and video." },
    category: "owner",
    guide: { en: "Use {p}admin to reveal the creator's details." },
    creatorDetails: {
      name: "Krishhh",
      fbLink: "https://www.facebook.com/profile.php?id=100086734771592",
      photoLink: "https://i.ibb.co/0rp7psR/image.jpg", // Replace with a valid photo URL
      videoLink: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1735136541503-149.mp4" // Replace with a valid video URL
    }
  },
  onStart: async function ({ api, event }) {
    try {
      const { creatorDetails } = this.config;

      // Fetch the creator's photo
      const photoResponse = await axios.get(creatorDetails.photoLink, { responseType: "arraybuffer" });
      const photoPath = path.join(__dirname, "cache", `creator_photo.jpg`);
      await fs.outputFile(photoPath, photoResponse.data);

      // Prepare message
      const message = `Meet the Creator!\n\nName: ${creatorDetails.name}\nFacebook: ${creatorDetails.fbLink}`;

      // Send photo with message
      await api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(photoPath),
        },
        event.threadID,
        async () => {
          // Optionally, send a video after the photo
          const videoResponse = await axios.get(creatorDetails.videoLink, { responseType: "arraybuffer" });
          const videoPath = path.join(__dirname, "cache", `creator_video.mp4`);
          await fs.outputFile(videoPath, videoResponse.data);

          await api.sendMessage(
            {
              body: "Here's a short video of the creator!",
              attachment: fs.createReadStream(videoPath),
            },
            event.threadID
          );

          // Clean up cache
          await fs.unlink(photoPath);
          await fs.unlink(videoPath);
        }
      );
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in Admin Command:`, error);
      await api.sendMessage("An error occurred while fetching the creator's details.", event.threadID);
    }
  },
  monitor: async function ({ api, event }) {
    try {
      const t = Date.now();
      const keywords = ["Ichigo", "Krish", "Krishey", "Krixh", "Krixhh", "Kira", "death note", "bleach", "your name"];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

      const url = `https://pin-kshitiz.vercel.app/pin?search=${encodeURIComponent(randomKeyword)}`;
      const result = await axios.get(url);
      const images = result.data.result;
      const randomImage = images[Math.floor(Math.random() * images.length)];

      const imageResponse = await axios.get(randomImage, { responseType: "arraybuffer" });
      const imagePath = path.join(__dirname, "cache", `monitor_image.jpg`);
      await fs.outputFile(imagePath, imageResponse.data);

      const uptimeSeconds = process.uptime();
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);

      const uptimeMessage = `Bot has been running for:\n${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
      const ping = Date.now() - t;

      const message = `${uptimeMessage}\nCurrent Ping: ${ping}ms`;

      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imagePath),
      }, event.threadID, event.messageID);

      await fs.unlink(imagePath);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Monitor Error:`, error);
      api.sendMessage("An error occurred while fetching monitor data.", event.threadID);
    }
  }
};
