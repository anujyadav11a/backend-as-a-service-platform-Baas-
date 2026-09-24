import mongoose, { Schema } from "mongoose";

export const createIdentitySchema = (userRef, encryptTokens = false, cryptoUtils = null) => {
    const identitySchema = new Schema({
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: userRef,
            required: true
        },
        provider: {
            type: String,
            required: true,
            enum: ['google', 'github', 'microsoft', 'facebook', 'linkedin']
        },
        provider_id: {
            type: String,
            required: true
        },
        provider_email: {
            type: String,
            required: true
        },
        provider_name: {
            type: String
        },

        refresh_token: {
            type: String
        },
        expires_at: {
            type: Date
        },
        scope: {
            type: [String],
            default: []
        },

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

        provider_data: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        }

    }, { timestamps: true, autoIndex: process.env.NODE_ENV !== 'production' });


    // Virtual for checking if refresh token is expired
    identitySchema.virtual('is_token_expired').get(function() {
        if (!this.expires_at) return false;
        return new Date() > this.expires_at;
    });

    // Methods
    identitySchema.methods.isRefreshTokenValid = function() {
        return this.is_active && !this.is_token_expired && this.refresh_token;
    };

    identitySchema.methods.updateLastUsed = function() {
        this.last_used = new Date();
        return this.save();
    };

    identitySchema.methods.getAccessToken = async function() {
        if (!this.isRefreshTokenValid()) {
            throw new Error('Invalid or expired refresh token');
        }
        
        return {
            refresh_token: this.refresh_token,
            provider: this.provider,
            expires_at: this.expires_at
        };
    };

    identitySchema.methods.updateTokenData = async function(newTokenData) {
        if (newTokenData.refresh_token) {
            this.refresh_token = newTokenData.refresh_token;
        }
        if (newTokenData.expires_in) {
            this.expires_at = new Date(Date.now() + (newTokenData.expires_in * 1000));
        }
        if (newTokenData.scope) {
            this.scope = Array.isArray(newTokenData.scope) ? newTokenData.scope : newTokenData.scope.split(' ');
        }
        this.updatedAt = new Date();
        return this.save();
    };

    identitySchema.methods.revoke = function() {
        this.is_active = false;
        return this.save();
    };

    // Encryption methods (only added when encryptTokens is true and cryptoUtils provided)
    if (encryptTokens && cryptoUtils) {
        const { encrypt, decrypt } = cryptoUtils;

        identitySchema.methods.encryptSensitiveData = function() {
            if (this.refresh_token && !this.refresh_token.startsWith('enc:')) {
                this.refresh_token = 'enc:' + encrypt(this.refresh_token);
            }
        };

        identitySchema.methods.decryptSensitiveData = function() {
            if (this.refresh_token && this.refresh_token.startsWith('enc:')) {
                this.refresh_token = decrypt(this.refresh_token.substring(4));
            }
        };

        // Pre-save middleware for encryption
        identitySchema.pre('save', function(next) {
            if (this.isModified('refresh_token')) {
                this.encryptSensitiveData();
            }
            next();
        });

        // Post-find middleware for decryption
        identitySchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
            if (!docs) return;
            
            const decryptDoc = (doc) => {
                if (doc && typeof doc.decryptSensitiveData === 'function') {
                    doc.decryptSensitiveData();
                }
            };
            
            if (Array.isArray(docs)) {
                docs.forEach(decryptDoc);
            } else {
                decryptDoc(docs);
            }
        });
    }

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
        await this.updateMany(
            { user_id: userId },
            { is_primary: false }
        );
        
        return this.findByIdAndUpdate(
            identityId,
            { is_primary: true },
            { new: true }
        );
    };

    identitySchema.statics.cleanupExpiredRefreshTokens = function() {
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

    return identitySchema;
};