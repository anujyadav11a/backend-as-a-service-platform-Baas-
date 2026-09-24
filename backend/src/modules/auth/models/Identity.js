import mongoose from "mongoose";
import { createIdentitySchema } from './baseIdentitySchema.js';
import { encrypt, decrypt } from '../../../shared/utils/cryptoUtils.js';

const identitySchema = createIdentitySchema('User', true, { encrypt, decrypt });

export const Identity = mongoose.model("Identity", identitySchema);