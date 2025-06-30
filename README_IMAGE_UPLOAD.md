# PawPawMate 图片上传功能说明

## 功能概述

PawPawMate 现在支持用户在评论时上传图片，图片将存储在 AWS S3 中，并在 MongoDB 中保存图片 URL。

## 技术栈

- **后端**: Node.js + Express + MongoDB
- **图片存储**: AWS S3
- **图片上传**: Multer + Multer-S3
- **前端**: React + 自定义图片上传组件

## 后端配置

### 1. 环境变量设置

在 `backend-app/.env` 文件中添加以下配置：

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-west-2
AWS_S3_BUCKET_NAME=pawpawmate-uploads
```

### 2. AWS S3 Bucket 设置

1. 创建 S3 Bucket
2. 设置 Bucket 权限，允许公共读取
3. 配置 CORS 政策：

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. API 接口

#### 上传评论图片
- **URL**: `POST /api/reviews/upload-images`
- **Content-Type**: `multipart/form-data`
- **参数**: `images` (支持最多5张图片)
- **返回**: `{ imageUrls: [string] }`

#### 添加评论（含图片）
- **URL**: `POST /api/reviews`
- **参数**: 
  ```json
  {
    "placeId": "string",
    "userId": "string",
    "rating": 1-5,
    "comment": "string",
    "tags": ["string"],
    "photos": ["image_url_1", "image_url_2"]
  }
  ```

## 前端使用

### 1. 组件结构

- `ReviewForm.js`: 评论表单组件，支持图片上传
- `ReviewList.js`: 评论列表组件，支持图片展示
- `PlaceDetail.js`: 地点详情页面，集成评论功能

### 2. 使用示例

```jsx
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

// 在地点详情页面中使用
<ReviewForm
  placeId={placeId}
  placeData={place}
  userId={mongoUser._id}
  onReviewSubmitted={handleReviewSubmitted}
  onCancel={() => setShowReviewForm(false)}
/>

<ReviewList reviews={reviews} />
```

### 3. 图片上传流程

1. 用户选择图片文件（最多5张）
2. 前端验证文件类型和大小
3. 显示图片预览
4. 提交评论时先上传图片到 S3
5. 获取图片 URL 后提交评论数据

## 功能特性

### 后端特性
- ✅ 支持多张图片上传（最多5张）
- ✅ 文件类型验证（JPEG, PNG, GIF, WebP）
- ✅ 文件大小限制（5MB per file）
- ✅ 自动生成唯一文件名
- ✅ S3 公共读取权限
- ✅ 错误处理和日志记录

### 前端特性
- ✅ 拖拽式文件选择
- ✅ 图片预览功能
- ✅ 移除单张图片
- ✅ 上传进度提示
- ✅ 图片点击放大查看
- ✅ 响应式设计

## 数据库结构

### Review 模型更新
```javascript
const reviewSchema = new mongoose.Schema({
  // ... 其他字段
  photos: [String], // 图片URL数组
  // ... 其他字段
});
```

## 安全考虑

1. **文件类型验证**: 只允许图片文件
2. **文件大小限制**: 单文件最大5MB
3. **数量限制**: 最多5张图片
4. **用户验证**: 需要登录才能上传
5. **S3 权限**: 仅允许读取，不允许直接写入

## 错误处理

### 常见错误及解决方案

1. **AWS 配置错误**
   - 检查环境变量是否正确设置
   - 验证 AWS 凭证权限

2. **文件上传失败**
   - 检查网络连接
   - 验证文件格式和大小

3. **图片显示异常**
   - 检查 S3 Bucket 公共读取权限
   - 验证 CORS 设置

## 部署注意事项

1. 确保生产环境 AWS 凭证安全
2. 设置适当的 S3 Bucket 权限
3. 配置 CDN 加速图片加载
4. 定期清理未使用的图片文件

## 未来优化

- [ ] 图片压缩和优化
- [ ] 图片懒加载
- [ ] 批量删除功能
- [ ] 图片水印添加
- [ ] 更多图片格式支持 