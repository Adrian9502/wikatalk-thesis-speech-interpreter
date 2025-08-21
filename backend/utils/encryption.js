const crypto = require('crypto');

// Encryption algorithm - using standard AES-256-CBC for broader compatibility
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits for CBC

class EncryptionService {
  constructor() {
    // Get encryption key from environment variable
    this.encryptionKey = this.getEncryptionKey();
  }

  /**
   * Get or generate encryption key from environment variable
   */
  getEncryptionKey() {
    const envKey = process.env.ENCRYPTION_KEY;

    if (envKey) {
      // Convert hex string to buffer
      const key = Buffer.from(envKey, 'hex');
      if (key.length !== KEY_LENGTH) {
        // If wrong length, generate a new key from the string
        return crypto.createHash('sha256').update(envKey).digest();
      }
      return key;
    }

    // Generate a new key if not provided
    console.warn('⚠️  No ENCRYPTION_KEY found in environment variables');
    console.warn('⚠️  Generating temporary encryption key for this session');

    const newKey = crypto.randomBytes(KEY_LENGTH);
    console.warn(`⚠️  Add this to your .env file:`);
    console.warn(`ENCRYPTION_KEY=${newKey.toString('hex')}`);

    return newKey;
  }

  /**
   * Encrypt text using AES-256-CBC
   * @param {string} text - Plain text to encrypt
   * @returns {object} - Object containing encrypted data and IV
   */
  encrypt(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(IV_LENGTH);

      // CORRECT: Use crypto.createCipheriv with algorithm, key, and IV
      const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);

      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        algorithm: ALGORITHM
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt text using AES-256-CBC
   * @param {object} encryptedData - Object containing encrypted data and IV
   * @returns {string} - Decrypted plain text
   */
  decrypt(encryptedData) {
    if (!encryptedData || !encryptedData.encrypted) {
      return null;
    }

    try {
      const { encrypted, iv, algorithm } = encryptedData;

      // Verify algorithm (optional)
      if (algorithm && algorithm !== ALGORITHM) {
        console.warn(`Different algorithm detected: ${algorithm}, using ${ALGORITHM}`);
      }

      // Convert IV back to buffer
      const ivBuffer = Buffer.from(iv, 'hex');

      // CORRECT: Use crypto.createDecipheriv with algorithm, key, and IV
      const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, ivBuffer);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt multiple fields of an object
   * @param {object} data - Object with fields to encrypt
   * @param {string[]} fieldsToEncrypt - Array of field names to encrypt
   * @returns {object} - Object with encrypted fields
   */
  encryptFields(data, fieldsToEncrypt) {
    const encryptedData = { ...data };

    fieldsToEncrypt.forEach(field => {
      if (data[field]) {
        encryptedData[field] = this.encrypt(data[field]);
      }
    });

    return encryptedData;
  }

  /**
   * Decrypt multiple fields of an object
   * @param {object} data - Object with encrypted fields
   * @param {string[]} fieldsToDecrypt - Array of field names to decrypt
   * @returns {object} - Object with decrypted fields
   */
  decryptFields(data, fieldsToDecrypt) {
    const decryptedData = { ...data };

    fieldsToDecrypt.forEach(field => {
      if (data[field]) {
        try {
          decryptedData[field] = this.decrypt(data[field]);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          decryptedData[field] = '[Decryption Failed]';
        }
      }
    });

    return decryptedData;
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;