import mongoose, { Schema } from "mongoose";

const tenantIdentitySchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TenantUser",
        required: true,
        index: true
    },
    provider: {
        type: String,
        required: true,
        enum: ['google', 'github', 'microsoft', 'facebook', 'linkedin'],
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

}, { timestamps: true });


// Compound indexes for performance and uniqueness
tenantIdentitySchema.index({ provider: 1, provider_id: 1 }, { unique: true });
tenantIdentitySchema.index({ user_id: 1, provider: 1 });
tenantIdentitySchema.index({ user_id: 1, is_primary: 1 });
tenantIdentitySchema.index({ expires_at: 1 });

// Virtual for checking if refresh token is expired
tenantIdentitySchema.virtual('is_token_expired').get(function() {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
});

// Methods
tenantIdentitySchema.methods.isRefreshTokenValid = function() {
    return this.is_active && !this.is_token_expired && this.refresh_token;
};

tenantIdentitySchema.methods.updateLastUsed = function() {
    this.last_used = new Date();
    return this.save();
};

tenantIdentitySchema.methods.getAccessToken = async function() {
    if (!this.isRefreshTokenValid()) {
        throw new Error('Invalid or expired refresh token');
    }
    
    return {
        refresh_token: this.refresh_token,
        provider: this.provider,
        expires_at: this.expires_at
    };
};

tenantIdentitySchema.methods.updateTokenData = async function(newTokenData) {
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

tenantIdentitySchema.methods.revoke = function() {
    this.is_active = false;
    return this.save();
};

// Static methods
tenantIdentitySchema.statics.findByProvider = function(provider, providerId) {
    return this.findOne({ provider, provider_id: providerId, is_active: true });
};

tenantIdentitySchema.statics.findByUser = function(userId) {
    return this.find({ user_id: userId, is_active: true });
};

tenantIdentitySchema.statics.findPrimaryIdentity = function(userId) {
    return this.findOne({ user_id: userId, is_primary: true, is_active: true });
};

tenantIdentitySchema.statics.setPrimaryIdentity = async function(userId, identityId) {
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

tenantIdentitySchema.statics.cleanupExpiredRefreshTokens = function() {
    return this.updateMany(
        { 
            expires_at: { $lt: new Date() },
            is_active: true 
        },
        { is_active: false }
    );
};

tenantIdentitySchema.statics.revokeAllUserIdentities = function(userId) {
    return this.updateMany(
        { user_id: userId, is_active: true },
        { is_active: false }
    );
};

export const TenantIdentity = mongoose.model("TenantIdentity", tenantIdentitySchema);