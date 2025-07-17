# OpenAI API Setup Guide

## 1. Environment Variables

Add the following variables to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=dall-e-3
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=standard
OPENAI_IMAGE_STYLE=vivid
```

## 2. Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## 3. Configuration Options

- **OPENAI_MODEL**: `dall-e-3` (recommended) or `dall-e-2`
- **OPENAI_IMAGE_SIZE**: 
  - For DALL-E 3: `1024x1024`, `1024x1792`, `1792x1024`
  - For DALL-E 2: `256x256`, `512x512`, `1024x1024`
- **OPENAI_IMAGE_QUALITY**: `standard` or `hd`
- **OPENAI_IMAGE_STYLE**: `vivid` or `natural`

## 4. AWS S3 Configuration (Required for Image Storage)

Add these AWS variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
```

## 5. Cost Considerations

- DALL-E 3: $0.040 per image (1024×1024, standard quality)
- DALL-E 3: $0.080 per image (1024×1024, HD quality)
- DALL-E 2: $0.020 per image (1024×1024)
- AWS S3: ~$0.023 per GB/month + request costs

## 6. Rate Limits

- Default: 5 requests per minute
- Can be increased by contacting OpenAI support

## 7. Testing

1. **Basic OpenAI Test**: `node test-openai.js`
2. **Prompt Generation Test**: `node test-prompt.js`
3. **Complete AI Image Generation**: `node test-ai-image-generation.js`
4. **Card Generation with AI**: `node test-card-ai-generation.js`

## 8. Integration Status

✅ **Completed Features:**
- OpenAI API integration
- Prompt generation service
- Image generation and S3 upload
- Card generation logic integration
- Fallback mechanism (user pet images → default images)

🔄 **Next Steps:**
1. Add your API keys to `.env` file
2. Test the complete pipeline
3. Monitor costs and performance in production 