import crypto from 'crypto';
import config from '../config/env.js';

/**
 * Validates and returns the encryption key for OAuth token encryption
 * Throws error if key is missing or invalid
 * @returns {Buffer} 32-byte key for AES-256
 */
export function getEncryptionKey() {
    const secretKey = config.oauth.encryptionKey;
    
    if (!secretKey) {
        throw new Error('OAUTH_ENCRYPTION_KEY environment variable is required but not set');
    }
    
    if (secretKey.length !== 32) {
        throw new Error(`OAUTH_ENCRYPTION_KEY must be exactly 32 characters, got ${secretKey.length}`);
    }
    
    // Derive a 32-byte key using scrypt (consistent with existing implementation)
    return crypto.scryptSync(secretKey, 'salt', 32);
}

/**
 * Encrypts text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format: iv:authTag:encrypted
 */
export function encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('oauth-identity', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts text encrypted with encrypt()
 * @param {string} encryptedText - Encrypted text in format: iv:authTag:encrypted
 * @returns {string} Decrypted text
 */
export function decrypt(encryptedText) {
    const algorithm = 'aes-256-gcm';
    const key = getEncryptionKey();
    
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('oauth-identity', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

/**
 * Validates encryption configuration on startup
 * Call this during application initialization
 */
export function validateEncryptionConfig() {
    try {
        getEncryptionKey();
        console.log('[Security] OAUTH_ENCRYPTION_KEY validation passed');
        return true;
    } catch (error) {
        console.error('[Security] OAUTH_ENCRYPTION_KEY validation failed:', error.message);
        throw error;
    }
}