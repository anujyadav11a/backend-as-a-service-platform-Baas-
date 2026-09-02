import mongoose from "mongoose";
import { createIdentitySchema } from './baseIdentitySchema.js';
import { encrypt, decrypt } from '../../../shared/utils/cryptoUtils.js';

const tenantIdentitySchema = createIdentitySchema('TenantUser', true, { encrypt, decrypt });

export const TenantIdentity = mongoose.model("TenantIdentity", tenantIdentitySchema);