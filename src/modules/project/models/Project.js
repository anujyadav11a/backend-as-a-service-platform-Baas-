import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import config from '../../../shared/config/env.js';

const projectSchema = new Schema({
    // Basic Project Information
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Project Owner
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
       
    },

    // Project ID for SDK (unique identifier)
    project_id: {
        type: String,
        
    },

    // API Key for authentication
    api_key: {
        type: String,
        
    },

    // Project Status
    status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active',
       
    },

    // Basic Configuration
    config: {
        // Database Configuration
        max_databases: {
            type: Number,
            default: 3,
            min: 1,
            max: 50,
            validate: {
                validator: Number.isInteger,
                message: 'max_databases must be an integer'
            }
        },
        max_tables_per_db: {
            type: Number,
            default: 10,
            min: 1,
            max: 500,
            validate: {
                validator: Number.isInteger,
                message: 'max_tables_per_db must be an integer'
            }
        },
        max_documents_per_table: {
            type: Number,
            default: 1000,
            min: 1,
            max: 100000,
            validate: {
                validator: Number.isInteger,
                message: 'max_documents_per_table must be an integer'
            }
        },
        
        // API Configuration
        cors_origins: [{
            type: String,
            validate: {
                validator: function(v) {
                    return v === '*' || /^https?:\/\/.+/.test(v);
                },
                message: 'Invalid CORS origin format'
            }
        }]
    },

    // Usage Statistics (simple)
    usage_stats: {
        api_requests_count: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: 'api_requests_count must be an integer'
            }
        },
        storage_used_mb: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: 'storage_used_mb must be an integer'
            }
        }
    }

}, {
    timestamps: true
});

// Indexes for performance
projectSchema.index({ owner_id: 1, status: 1 });
projectSchema.index({ createdAt: -1 });
// Unique name per owner (case-insensitive)
projectSchema.index({ owner_id: 1, name: 1 }, { 
    unique: true, 
    partialFilterExpression: { status: { $ne: 'deleted' } }
});


// Virtual for SDK config info
projectSchema.virtual('sdk_config').get(function() {
    return {
        project_id: this.project_id,
        api_key: this.api_key,
        api_endpoint: `${config.api.baseUrl}/api/v1/${this.project_id}`
    };
});

// Methods
projectSchema.methods.generateProjectId = function() {
    // Generate a unique project ID (8 characters)
    return crypto.randomBytes(4).toString('hex');
};

projectSchema.methods.generateApiKey = function() {
    // Generate a secure API key (32 characters)
    return crypto.randomBytes(16).toString('hex');
};

projectSchema.methods.updateUsage = function(type, amount = 1) {
    switch (type) {
        case 'api_request':
            this.usage_stats.api_requests_count += amount;
            break;
        case 'storage':
            this.usage_stats.storage_used_mb += amount;
            break;
    }
    return this.save();
};

projectSchema.methods.isWithinLimits = function() {
    const config = this.config || {};
    const usage = this.usage_stats || {};

    const maxApiRequests = (config.max_databases || 3) * (config.max_tables_per_db || 10) * 100;
    const maxStorageMb = (config.max_databases || 3) * 50;

    return {
        api_requests: usage.api_requests_count < maxApiRequests,
        storage: usage.storage_used_mb < maxStorageMb,
        limits: {
            max_api_requests: maxApiRequests,
            max_storage_mb: maxStorageMb
        }
    };
};

// Static methods
projectSchema.statics.findByProjectId = function(project_Id) {
    return this.findOne({ project_id: project_Id, status: 'active' }).lean();
};

projectSchema.statics.findByApiKey = function(api_Key) {
    return this.findOne({ api_key: api_Key, status: 'active' }).lean();
};

projectSchema.statics.findByOwner = function(owner_Id) {
    return this.find({ owner_id: owner_Id, status: { $ne: 'deleted' } }).lean();
};

projectSchema.statics.searchByName = function(owner_Id, searchQuery) {
    return this.find({ 
        owner_id: owner_Id, 
        status: { $ne: 'deleted' },
        name: { $regex: searchQuery, $options: 'i' }
    }).lean();
};

projectSchema.statics.findByName = function(owner_Id, projectName) {
    return this.findOne({ 
        owner_id: owner_Id, 
        name: projectName,
        status: { $ne: 'deleted' }
    }).lean();
};

// Pre-validate middleware: enforce usage <= config limits
projectSchema.pre('validate', function(next) {
    const config = this.config || {};
    const usage = this.usage_stats || {};

    // API requests limit: config.max_databases * config.max_tables_per_db * 100 (arbitrary factor)
    const maxApiRequests = (config.max_databases || 3) * (config.max_tables_per_db || 10) * 100;
    if (usage.api_requests_count > maxApiRequests) {
        this.invalidate('usage_stats.api_requests_count', 
            `API requests (${usage.api_requests_count}) exceed limit (${maxApiRequests})`);
    }

    // Storage limit: config.max_databases * 50 MB per database
    const maxStorageMb = (config.max_databases || 3) * 50;
    if (usage.storage_used_mb > maxStorageMb) {
        this.invalidate('usage_stats.storage_used_mb',
            `Storage used (${usage.storage_used_mb}MB) exceeds limit (${maxStorageMb}MB)`);
    }

    next();
});

// Pre-save middleware
projectSchema.pre('save', function() {
    if (this.isNew) {
        if (!this.project_id) {
            this.project_id = this.generateProjectId();
        }
        if (!this.api_key) {
            this.api_key = this.generateApiKey();
        }
    }
});

export const Project = mongoose.model("Project", projectSchema);