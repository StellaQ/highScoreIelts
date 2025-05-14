const crypto = require('crypto');
const xml2js = require('xml2js');

class WXPay {
  constructor() {
    this.appid = process.env.WX_APP_ID;
    this.mchid = process.env.WX_MCH_ID;
    this.key = process.env.WX_PAY_KEY;
    this.notify_url = process.env.WX_PAY_NOTIFY_URL;
  }

  // 生成随机字符串
  getNonceStr() {
    return Math.random().toString(36).substr(2, 15);
  }

  // 生成签名
  getSign(params) {
    let stringA = Object.keys(params)
      .sort()
      .map(key => key + '=' + params[key])
      .join('&');
    
    let stringSignTemp = stringA + '&key=' + this.key;
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  }

  // 将对象转换为XML
  async objectToXML(obj) {
    const builder = new xml2js.Builder({ rootName: 'xml', cdata: true, headless: true });
    return builder.buildObject(obj);
  }

  // 将XML转换为对象
  async xmlToObject(xml) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, { trim: true, explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result.xml);
      });
    });
  }

  // 统一下单
  async unifiedOrder(params) {
    const nonce_str = this.getNonceStr();
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // 组装参数
    const signParams = {
      appid: this.appid,
      mch_id: this.mchid,
      nonce_str,
      body: params.body,
      out_trade_no: params.out_trade_no,
      total_fee: params.total_fee,
      spbill_create_ip: '127.0.0.1',
      notify_url: this.notify_url,
      trade_type: params.trade_type,
      openid: params.openid
    };

    // 生成签名
    signParams.sign = this.getSign(signParams);

    // 将参数转换为XML
    const xmlData = await this.objectToXML(signParams);

    // 调用统一下单接口
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      body: xmlData
    });

    const responseText = await response.text();
    const result = await this.xmlToObject(responseText);

    return result;
  }

  // 生成支付参数
  getPayParams(params) {
    const signParams = {
      appId: params.appId,
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType
    };

    // 生成签名
    const paySign = this.getSign(signParams);

    return {
      ...signParams,
      paySign
    };
  }

  // 解析支付结果通知
  async parseNotify(xmlData) {
    // 将XML转换为对象
    const result = await this.xmlToObject(xmlData);

    // 验证签名
    const sign = result.sign;
    delete result.sign;
    const calculatedSign = this.getSign(result);

    if (calculatedSign !== sign) {
      throw new Error('签名验证失败');
    }

    return result;
  }
}

module.exports = new WXPay(); 