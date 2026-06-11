import crypto from 'crypto';

export const MYPOS_CHECKOUT_URL =
  process.env.MYPOS_MODE === 'live'
    ? 'https://www.mypos.com/vmp/checkout'
    : 'https://www.mypos.com/vmp/checkout-test';

interface MyPOSConfig {
  sid:    string;
  cn:     string;
  pk:     string;
  pc:     string;
  idx:    string;
  appid?: string;
  pid?:   string;
}

export function getMyPOSConfig(): MyPOSConfig {
  const pack = process.env.MYPOS_CONFIG_PACK;
  if (!pack) throw new Error('MYPOS_CONFIG_PACK is not set.');
  const decoded = Buffer.from(pack, 'base64').toString('utf-8');
  return JSON.parse(decoded) as MyPOSConfig;
}

export function buildMyPOSParams(opts: {
  amount:             string;
  currency:           string;
  orderId:            string;
  urlOk:              string;
  urlCancel:          string;
  urlNotify:          string;
  customerEmail?:     string;
  customerFirstName?: string;
  customerLastName?:  string;
}): Record<string, string> {
  const cfg = getMyPOSConfig();

  const params: Record<string, string> = {
    IPCmethod:                 'IPCPurchase',
    IPCVersion:                '1.4',
    IPCLanguage:               'EN',
    SID:                       cfg.sid,
    WalletNumber:              cfg.cn,
    Amount:                    opts.amount,
    Currency:                  opts.currency,
    OrderID:                   opts.orderId,
    URL_OK:                    opts.urlOk,
    URL_Cancel:                opts.urlCancel,
    URL_Notify:                opts.urlNotify,
    CardTokenRequest:          '0',
    KeyIndex:                  cfg.idx,
    PaymentParametersRequired: '2',
    PaymentMethod:             '1',
  };

  if (opts.customerEmail)     params.CustomerEmail      = opts.customerEmail;
  if (opts.customerFirstName) params.CustomerFirstNames = opts.customerFirstName;
  if (opts.customerLastName)  params.CustomerFamilyName = opts.customerLastName;

  return params;
}

// Official myPOS signing algorithm per https://developers.mypos.com/apis/checkout-api/checkout-getting-started/authentication
// PHP reference: $concData = base64_encode(implode('-', $postData));
// 1. Join all param values with '-' separator
// 2. Base64 encode the joined string
// 3. Sign with RSA private key using SHA-256
// 4. Base64 encode the resulting signature bytes
export function signMyPOSParams(params: Record<string, string>): string {
  const cfg          = getMyPOSConfig();
  const concatenated = Buffer.from(Object.values(params).join('-')).toString('base64');

  const sign = crypto.createSign('SHA256');
  sign.update(concatenated);
  sign.end();

  return sign.sign(cfg.pk, 'base64');
}

export function verifyMyPOSSignature(body: Record<string, string>): boolean {
  try {
    const cfg = getMyPOSConfig();
    const { Signature: signature, ...rest } = body;
    if (!signature) return false;

    const concatenated = Buffer.from(Object.values(rest).join('-')).toString('base64');

    const verify = crypto.createVerify('SHA256');
    verify.update(concatenated);
    verify.end();

    return verify.verify(cfg.pc, signature, 'base64');
  } catch {
    return false;
  }
}
