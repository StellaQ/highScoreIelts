const express = require('express');
const router = express.Router();
const multer = require('multer');
const qiniu = require('qiniu');
const path = require('path');
const fs = require('fs');

// 配置七牛云
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET;
const domain = process.env.QINIU_DOMAIN;

// 配置七牛云上传区域
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_as0; // 修改为东南亚区域
config.useHttpsDomain = true; // 使用HTTPS域名
config.useCdnDomain = true; // 使用CDN加速域名

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

// 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 上传图片到七牛云
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const localFile = req.file.path;
    const key = Date.now() + path.extname(req.file.originalname);
    
    // 修改上传策略
    const options = {
      scope: bucket, // 只指定 bucket，不指定 key
      expires: 7200, // 上传凭证有效期，单位秒
      returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    // 设置上传重试次数
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        await new Promise((resolve, reject) => {
          formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr, respBody, respInfo) {
            if (respErr) {
              console.error('上传错误详情:', respErr);
              reject(respErr);
              return;
            }
            if (respInfo.statusCode == 200) {
              resolve(respBody);
            } else {
              console.error('上传失败详情:', {
                statusCode: respInfo.statusCode,
                body: respBody,
                info: respInfo
              });
              reject(new Error(`上传失败，状态码: ${respInfo.statusCode}`));
            }
          });
        });

        // 上传成功，返回结果
        const imageUrl = `https://${domain}/${key}`;
        // 删除本地临时文件
        fs.unlinkSync(localFile);
        
        return res.json({ 
          success: true, 
          url: imageUrl,
          key: key
        });
      } catch (error) {
        lastError = error;
        retryCount++;
        console.error(`上传失败，第 ${retryCount} 次重试:`, error);
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // 所有重试都失败
    console.error('上传失败，已达到最大重试次数:', lastError);
    // 删除本地临时文件
    fs.unlinkSync(localFile);
    return res.status(500).json({ 
      error: '上传失败',
      message: lastError.message
    });
  } catch (error) {
    console.error('上传错误:', error);
    // 确保删除本地临时文件
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('删除临时文件失败:', unlinkError);
      }
    }
    res.status(500).json({ 
      error: '服务器错误',
      message: error.message
    });
  }
});

// 获取已上传的图片列表
router.get('/images', async (req, res) => {
  try {
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    const options = {
      limit: 100,
      prefix: '',
    };

    bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
      if (err) {
        console.error('获取图片列表错误:', err);
        return res.status(500).json({ error: '获取图片列表失败' });
      }
      if (respInfo.statusCode == 200) {
        const items = respBody.items.map(item => ({
          key: item.key,
          url: `https://${domain}/${item.key}`,
          uploadTime: new Date(item.putTime / 10000).toISOString()
        }));
        res.json({ success: true, images: items });
      } else {
        console.error('获取图片列表失败，状态码:', respInfo.statusCode);
        res.status(500).json({ error: '获取图片列表失败' });
      }
    });
  } catch (error) {
    console.error('获取图片列表错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: error.message
    });
  }
});

module.exports = router;