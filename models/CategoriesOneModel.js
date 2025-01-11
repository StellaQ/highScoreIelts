const mongoose = require('mongoose');

// 定义Schema
const CategoriesOneSchema = new mongoose.Schema({
    categoryId: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    categoryName: { 
        type: String, 
        required: true 
    },
    categoryNameInChinese: { 
        type: String, 
        required: true 
    },
    categoryDescription: { 
        type: String, 
        default: '' // 默认空字符串，可以不填
    },
    sequence: { 
        type: Number, 
        required: true, 
        default: 0 // 默认排序值为 0
    },
    tags: [
        {
          tagCode: { 
            type: String, 
            required: true 
            },
        tagName: { 
            type: String, 
            required: true 
            }
        }
    ]
},{ 
    timestamps: true // 自动生成 createdAt 和 updatedAt 字段
  });

// 创建Model
const CategoriesOne = mongoose.model('CategoriesOne', CategoriesOneSchema);

module.exports = CategoriesOne;