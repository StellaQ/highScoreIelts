const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return v.startsWith('/uploads/');
      },
      message: '无效的图片路径'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved'],
    default: 'pending'
  },
  response: {
    type: String,
    trim: true
  }
});

// 添加索引以便于查询
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { Feedback }; 