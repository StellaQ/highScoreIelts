const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  orderType: { 
    type: String, 
    required: true,
    enum: ['vip_first_subscribe', 'vip_renewal_active', 'vip_renewal_expired']
  },
  subscribeType: { 
    type: String,
    required: true,
    enum: ['season', 'yearly']
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  expireDate: { 
    type: Date, 
    required: true 
  },
  transactionId: String, // 微信支付订单号
  paidAt: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Order', OrderSchema); 