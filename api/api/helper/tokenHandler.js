const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const b62 = require('base-x')(BASE62);
// eslint-disable-next-line object-curly-newline
const { JWE, JWK, JWT, errors } = require('jose');
const { v4: uuidv4 } = require('uuid');
const tokenKey = require('../tokenKey.json');

// Generate an EC P-521 key pair in JWK format
// const privateKey = JWK.generateSync('EC', 'P-521');
// console.log(privateKey.toJWK(true)); // export private key

const privateKey = JWK.asKey(tokenKey);

const tokenStatus = {
  valid: 0,
  invalid: 1,
  refresh: 2
};

module.exports = {
  tokenStatus,
  generateToken: (userId) => {
    const payload = {
      userId,
      refreshToken: b62.encode(Buffer.from(uuidv4(), 'utf8'))
    };

    const token = JWT.sign(payload, privateKey, {
      audience: 'Swift API',
      issuer: 'Swift API',
      expiresIn: '1 hour',
      iat: true,
      header: {
        typ: 'JWT'
      }
    });

    return { token: JWE.encrypt(token, privateKey), refreshToken: payload.refreshToken };
  },
  validateToken: (token, decodeToken = false) => {
    let decryptedToken = null;
    try {
      decryptedToken = JWE.decrypt(token, privateKey).toString('utf8');
      const tokenData = JWT.verify(decryptedToken, privateKey, {
        audience: 'Swift API',
        issuer: 'Swift API'
      });

      // Token valid
      if (!decodeToken) {
        return tokenStatus.valid;
      }
      return [tokenStatus.valid, tokenData];
    } catch (err) {
      if (err instanceof errors.JOSEError && err.code === 'ERR_JWT_EXPIRED') {
        // Token expired, request refresh token
        if (!decodeToken) {
          return tokenStatus.refresh;
        }
        return [tokenStatus.refresh, JWT.decode(decryptedToken)];
      }

      // Token invalid - reject
      if (!decodeToken) {
        return tokenStatus.invalid;
      }
      return [tokenStatus.invalid, null];
    }
  }
};
