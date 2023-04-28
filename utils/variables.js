import MongoStore from 'connect-mongo';
import { getURL } from './functions.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
})

const userName = process.env.DB_MONGO_USER;
const pwd = process.env.DB_MONGO_PWD;
const mongoAtlasDb = process.env.DB_MONGOATLAS;
export const usersCollection = process.env.DB_USERS_COLLECTION;
const sessionsCollection = process.env.DB_SESSIONS_COLLECTION;
export const productsCollection = process.env.DB_PRODUCTS_COLLECTION;
export const cartsCollection = process.env.DB_CARTS_COLLECTION;
export const messagesCollection = process.env.DB_MESSAGES_COLLECTION;
export const normMessagesCollection = process.env.DB_NORM_MESSAGES_COLLECTION;
const sessionSecret = process.env.SESSION_SECRET;
export const twilioAccountSID = process.env.TWILIO_ACCOUNT_SID;
export const twilioMsgSID = process.env.TWILIO_MSG_SERVICE_SID;
export const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
export const twilioWappNumber = process.env.TWILIO_WAPP_NUMBER;
export const personalWappNumber = process.env.PERSONAL_WAPP_NUMBER;
export const personalMail = process.env.PERSONAL_MAIL;
export const gmailMail = process.env.GMAIL_MAIL;
export const gmailAppPass = process.env.GMAIL_APP_PASS;
const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
export const sessionOpts = {
    name: 'loggedUser',
    store: MongoStore.create({
        mongoUrl: getURL(mongoAtlasDb, userName, pwd),
        mongoOptions: advancedOptions,
        collectionName: sessionsCollection,
        ttl: 600,
    }),
    secret: sessionSecret,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000,
        // httpOnly: false
    }
};
export const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);