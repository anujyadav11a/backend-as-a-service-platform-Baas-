import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

const identitySchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    provider: {
        type: String,
        required: true,
        enum: ['google', 'github', 'microsoft', 'facebook', 'linkedin', 'custom'],
        index: true
    },
    provider_id: {
        type: String,
        required: true,
        index: true
    },
    provider_email: {
        type: String,
        required: true
    },
    provider_name: {
        type: String,
        required: true
    },
   
    // OAuth 2.0 Credentials
    access_token: {
        type: String,
        required: true
    },
    refresh_token: {
        type: String
    },
    token_type: {
        type: String,
        default: 'Bearer'
    },
    expires_at: {
        type: Date,
        index: true
    },
    scope: {
        type: [String],
        default: []
    },
    // OAuth 2.0 Client Information
    client_id: {
        type: String,
        required: true
    },
    // Additional OAuth metadata
    id_token: {
        type: String // For OpenID Connect
    },
    token_endpoint: {
        type: String
    },
    authorization_endpoint: {
        type: String
    },
    // Connection status
    is_active: {
        type: Boolean,
        default: true
    },
    is_primary: {
        type: Boolean,
        default: false
    },
    last_used: {
        type: Date,
        default: Date.now
    },
    // Security and audit
    connection_metadata: {
        ip_address: String,
        user_agent: String,
        location: {
            country: String,
            city: String
        }
    },
    // Provider-specific data
    provider_data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    }
}, {
    timestamps: true
});

// Compound indexes for performance and uniqueness
identitySchema.index({ provider: 1, provider_id: 1 }, { unique: true });
identitySchema.index({ user_id: 1, provider: 1 });
identitySchema.index({ user_id: 1, is_primary: 1 });
identitySchema.index({ expires_at: 1 });

// Virtual for checking if token is expired
identitySchema.virtual('is_token_expired').get(function() {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
});

// Methods
identitySchema.methods.isTokenValid = function() {
    return this.is_active && !this.is_token_expired;
};

identitySchema.methods.updateLastUsed = function() {
    this.last_used = new Date();
    return this.save();
};

identitySchema.methods.refreshAccessToken = async function(newTokenData) {
    this.access_token = newTokenData.access_token;
    if (newTokenData.refresh_token) {
        this.refresh_token = newTokenData.refresh_token;
    }
    if (newTokenData.expires_in) {
        this.expires_at = new Date(Date.now() + (newTokenData.expires_in * 1000));
    }
    if (newTokenData.scope) {
        this.scope = Array.isArray(newTokenData.scope) ? newTokenData.scope : newTokenData.scope.split(' ');
    }
    this.last_used = new Date();
    return this.save();
};

identitySchema.methods.revoke = function() {
    this.is_active = false;
    return this.save();
};

identitySchema.methods.encryptSensitiveData = function() {
    // Encrypt access_token and refresh_token before saving
    if (this.access_token && !this.access_token.startsWith('enc:')) {
        this.access_token = 'enc:' + this.encrypt(this.access_token);
    }
    if (this.refresh_token && !this.refresh_token.startsWith('enc:')) {
        this.refresh_token = 'enc:' + this.encrypt(this.refresh_token);
    }
};

identitySchema.methods.decryptSensitiveData = function() {
    // Decrypt access_token and refresh_token after retrieval
    if (this.access_token && this.access_token.startsWith('enc:')) {
        this.access_token = this.decrypt(this.access_token.substring(4));
    }
    if (this.refresh_token && this.refresh_token.startsWith('enc:')) {
        this.refresh_token = this.decrypt(this.refresh_token.substring(4));
    }
};

identitySchema.methods.encrypt = function(text) {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.OAUTH_ENCRYPTION_KEY || 'default-key-change-in-production';
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('oauth-identity', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

identitySchema.methods.decrypt = function(encryptedText) {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.OAUTH_ENCRYPTION_KEY || 'default-key-change-in-production';
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('oauth-identity', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

// Static methods
identitySchema.statics.findByProvider = function(provider, providerId) {
    return this.findOne({ provider, provider_id: providerId, is_active: true });
};

identitySchema.statics.findByUser = function(userId) {
    return this.find({ user_id: userId, is_active: true });
};

identitySchema.statics.findPrimaryIdentity = function(userId) {
    return this.findOne({ user_id: userId, is_primary: true, is_active: true });
};

identitySchema.statics.setPrimaryIdentity = async function(userId, identityId) {
    // Remove primary flag from all identities for this user
    await this.updateMany(
        { user_id: userId },
        { is_primary: false }
    );
    
    // Set the specified identity as primary
    return this.findByIdAndUpdate(
        identityId,
        { is_primary: true },
        { new: true }
    );
};

identitySchema.statics.cleanupExpiredTokens = function() {
    return this.updateMany(
        { 
            expires_at: { $lt: new Date() },
            is_active: true 
        },
        { is_active: false }
    );
};

identitySchema.statics.revokeAllUserIdentities = function(userId) {
    return this.updateMany(
        { user_id: userId, is_active: true },
        { is_active: false }
    );
};

// Pre-save middleware for encryption
identitySchema.pre('save', function(next) {
    if (this.isModified('access_token') || this.isModified('refresh_token')) {
        this.encryptSensitiveData();
    }
    next();
});

// Post-find middleware for decryption
identitySchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
    if (!docs) return;
    
    const decrypt = (doc) => {
        if (doc && typeof doc.decryptSensitiveData === 'function') {
            doc.decryptSensitiveData();
        }
    };
    
    if (Array.isArray(docs)) {
        docs.forEach(decrypt);
    } else {
        decrypt(docs);
    }
});

export const Identity = mongoose.model("Identity", identitySchema);