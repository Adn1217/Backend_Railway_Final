import mongoose from 'mongoose';
import { usersCollection } from '../utils/variables.js';

// const usersCollection = 'users';
const usersSchema = new mongoose.Schema({
        username: {type: String, required: true},
        mail: {type: String, required: false},
        tel: {type: String, required: false},
        edad: {type: Number, required: false},
        avatar: {type: String, required: false},
        password: {type: String, required: true}
});

export const usersModel = mongoose.model(usersCollection, usersSchema);