const crypto = require('crypto');
const algorithm = 'aes-192-cbc';
const { ENCRYPTION_KEY } = require('../.env');
const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24);
const spl = 'áéíóú';

const munge = (res, stringify) => {
  const spt = spl.split('')[Math.floor(Math.random() * spl.length)]
  if (stringify === true) res = JSON.stringify(res);
  if (typeof res === 'string') {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(res, 'utf8', 'hex');
    res = [
      Buffer.from(iv).toString('hex'),
      encrypted + cipher.final('hex'),
    ].join(spt);
  }
  return res;
}

const demunge = (res, stringify) => {
  if (typeof res === 'string') {
    const [iv, encrypted] = res.split(new RegExp(`[${spl}]`));
    if (!encrypted) {
      return stringify ? [] : '';
    }
    const decipher = crypto.createDecipheriv(
      algorithm, key, Buffer.from(iv, 'hex')
    );
    res = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
  if (stringify === true) res = JSON.parse(res);
  return res;
}

module.exports = { munge, demunge }
