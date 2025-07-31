const OpenAI = require("openai");
const axios = require("axios");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Configuration from environment variables
    this.config = {
      model: process.env.OPENAI_MODEL || "dall-e-3",
      size: process.env.OPENAI_IMAGE_SIZE || "1024x1024",
      quality: process.env.OPENAI_IMAGE_QUALITY || "standard",
      style: process.env.OPENAI_IMAGE_STYLE || "vivid",
    };

    // Initialize S3 client
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  /**
   * Generate image using OpenAI DALL-E
   * @param {string} prompt - The text prompt for image generation
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - URL of the generated image
   */
  async generateImage(prompt, options = {}) {
    try {
      console.log("🎨 Generating image with OpenAI DALL-E...");
      console.log("Prompt:", prompt);

      // Validate API key
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
        throw new Error("OpenAI API key not configured");
      }

      const response = await this.client.images.generate({
        model: options.model || this.config.model,
        prompt: prompt,
        size: options.size || this.config.size,
        quality: options.quality || this.config.quality,
        style: options.style || this.config.style,
        n: 1, // Number of images to generate
      });

      const imageUrl = response.data[0].url;
      console.log("✅ Image generated successfully:", imageUrl);

      return imageUrl;
    } catch (error) {
      console.error("❌ Error generating image with OpenAI:", error);
      throw error;
    }
  }

  /**
   * Download image from URL and return buffer
   * @param {string} imageUrl - URL of the image to download
   * @returns {Promise<Buffer>} - Image buffer
   */
  async downloadImage(imageUrl) {
    try {
      console.log("📥 Downloading image from URL:", imageUrl);

      const response = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "arraybuffer",
        timeout: 30000, // 30 seconds timeout
      });

      console.log("✅ Image downloaded successfully");
      return Buffer.from(response.data);
    } catch (error) {
      console.error("❌ Error downloading image:", error);
      throw error;
    }
  }

  /**
   * Upload image buffer to S3
   * @param {Buffer} imageBuffer - Image buffer to upload
   * @param {string} fileName - File name for S3 object
   * @returns {Promise<string>} - S3 URL of uploaded image
   */
  async uploadToS3(imageBuffer, fileName) {
    try {
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      if (!bucketName) {
        throw new Error("AWS S3 bucket name not configured");
      }

      const key = `ai-generated-cards/${fileName}`;

      console.log(`📤 Uploading image to S3: ${key}`);

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: "image/png",
      };

      const result = await this.s3.upload(params).promise();
      console.log(`✅ Image uploaded to S3: ${result.Location}`);

      return result.Location;
    } catch (error) {
      console.error("❌ Error uploading image to S3:", error);
      throw error;
    }
  }

  /**
   * Generate image and upload to S3
   * @param {string} prompt - The text prompt for image generation
   * @param {string} fileName - File name for S3 object
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - S3 URL of uploaded image
   */
  async generateAndUploadImage(prompt, fileName, options = {}) {
    try {
      console.log("🎨 Starting AI image generation and upload process...");

      // Generate image
      const imageUrl = await this.generateImage(prompt, options);

      // Download image buffer
      const imageBuffer = await this.downloadImage(imageUrl);

      // Upload to S3
      const s3Url = await this.uploadToS3(imageBuffer, fileName);

      console.log("✅ AI image generation and upload completed successfully");
      return s3Url;
    } catch (error) {
      console.error("❌ Error in AI image generation and upload:", error);
      throw error;
    }
  }

  /**
   * Generate image and return buffer for upload
   * @param {string} prompt - The text prompt for image generation
   * @param {Object} options - Additional options
   * @returns {Promise<Buffer>} - Image buffer ready for upload
   */
  async generateImageBuffer(prompt, options = {}) {
    try {
      const imageUrl = await this.generateImage(prompt, options);
      const imageBuffer = await this.downloadImage(imageUrl);
      return imageBuffer;
    } catch (error) {
      console.error("❌ Error generating image buffer:", error);
      throw error;
    }
  }

  async describeImage(imageUrl) {
    if (!this.isConfigured()) {
      throw new Error("OpenAI service is not configured.");
    }

    try {
      console.log(`👁️‍🗨️ Analyzing image with GPT-4 Vision: ${imageUrl}`);
      const response = await this.client.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe the pet in this image in a single, concise sentence. Focus on its main colors, breed, and any notable features like accessories. For example: 'a fluffy white Samoyed with a happy expression' or 'a sleek black cat with bright green eyes'.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 60,
      });

      const description = response.choices[0].message.content;
      console.log(`✅ Image description generated: "${description}"`);
      return description;
    } catch (error) {
      console.error("❌ Error describing image with OpenAI Vision:", error);
      // Return a generic description on failure to avoid breaking the card generation
      return "a lovely pet";
    }
  }

  /**
   * Check if OpenAI service is properly configured
   * @returns {boolean} - True if configured, false otherwise
   */
  isConfigured() {
    return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-openai-api-key-here");
  }

  /**
   * Get service configuration
   * @returns {Object} - Current configuration
   */
  getConfig() {
    return {
      ...this.config,
      isConfigured: this.isConfigured(),
    };
  }
}

module.exports = new OpenAIService();
