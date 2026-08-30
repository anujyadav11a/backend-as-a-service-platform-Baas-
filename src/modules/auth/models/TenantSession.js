import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Tenant User Session Model
 * 
 * Tracks active sessions for tenant users across different devices/browsers.
 * Helps with security, analytics, and session management.
 * 
 * Use Cases:
 * - Track user login sessions
 * - Implement "logout from all devices"
 * - Monitor suspicious login activity
 * - Analytics on user engagement
 */

const tenantSessionSchema = new Schema({
    // User Reference
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TenantUser',
        required: true
    },
    
    // Project Reference (for quick filtering)
    project_id: {
        type: String,
        required: true
    },
    
    
    
    // JWT Token Information
    refresh_token: {
        type: String,
        required: true
    },
   
    
    // Session Metadata
    device_info: {
        user_agent: {
            type: String,
            maxlength: 500
        },
        browser: {
            type: String,
            maxlength: 100
        },
        os: {
            type: String,
            maxlength: 100
        },
        device_type: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown'
        }
    },
    
    // Location Information (optional)
    location: {
        ip_address: {
            type: String,
            required: true
        },
        country: {
            type: String,
            maxlength: 100
        },
        city: {
            type: String,
            maxlength: 100
        },
        timezone: {
            type: String,
            maxlength: 50
        }
    },
    
    // Session Status
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked', 'suspicious'],
        default: 'active'
    },
    
    // Session Timing
    login_time: {
        type: Date,
        default: Date.now,
        required: true
    },
    last_activity: {
        type: Date,
        default: Date.now,
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    logout_time: {
        type: Date  // Set when user logs out
    },
    
    
    
   
    
}, {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'production'
});

// Virtual for session duration
tenantSessionSchema.virtual('duration_minutes').get(function() {
    const endTime = this.logout_time || this.last_activity || new Date();
    const startTime = this.login_time;
    return Math.round((endTime - startTime) / (1000 * 60)); // Duration in minutes
});

// Virtual for checking if session is still valid
tenantSessionSchema.virtual('is_valid').get(function() {
    return this.status === 'active' && this.expires_at > new Date();
});

// Pre-save Middleware
tenantSessionSchema.pre('save', async function() {
    // Update last_activity when session is modified
    if (this.isModified() && !this.isModified('last_activity')) {
        this.last_activity = new Date();
    }
   
    // Hash refresh_token if modified
    if (this.isModified("refresh_token") && this.refresh_token) {
        this.refresh_token = await bcrypt.hash(this.refresh_token, 10);
    }
});

// Instance Methods

/**
 * Check if session has expired
 * @returns {boolean} - True if session is expired
 */
tenantSessionSchema.methods.isExpired = function() {
    return this.expires_at < new Date() || this.status !== 'active';
};

/**
 * Update last activity timestamp
 */
tenantSessionSchema.methods.updateActivity = async function() {
    this.last_activity = new Date();
    return await this.save();
};

/**
 * Compare refresh token with hashed value
 * @param {string} refreshToken - Plain refresh token to compare
 * @returns {boolean} - True if matches
 */
tenantSessionSchema.methods.compareRefreshToken = async function(refreshToken) {
    if (!this.refresh_token) return false;
    return await bcrypt.compare(refreshToken, this.refresh_token);
};

/**
 * Generate unique session ID
 * @returns {string} - Unique session identifier
 */
tenantSessionSchema.methods.generateSessionId = function() {
    return crypto.randomBytes(32).toString('hex');
};








// Static Methods


tenantSessionSchema.statics.createSession = async function(sessionData) {
    const session = new this({
        user_id: sessionData.user_id,
        project_id: sessionData.project_id,
        refresh_token: sessionData.refresh_token,
        device_info: sessionData.device_info || {},
        location: sessionData.location || {},
        expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days default
    });
    
    return await session.save();
};


tenantSessionSchema.statics.findActiveSessions = function(userId) {
    return this.find({
        user_id: userId,
        status: 'active',
        expires_at: { $gt: new Date() }
    }).sort({ last_activity: -1 });
};




/**
 * Clean up expired sessions (for scheduled cleanup)
 * @param {number} daysOld - Remove sessions older than X days (default: 30)
 */
tenantSessionSchema.statics.cleanupExpiredSessions = async function(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
    
    return await this.deleteMany({
        $or: [
            { expires_at: { $lt: new Date() } }, // Expired sessions
            { 
                status: { $in: ['revoked', 'expired'] },
                updatedAt: { $lt: cutoffDate }
            }
        ]
    });
};



// Export the model
export const TenantSession = mongoose.model('TenantSession', tenantSessionSchema);