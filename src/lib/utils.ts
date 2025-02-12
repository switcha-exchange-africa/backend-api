import {  PRIVATE_KEY_ALGORITHM, PRIVATE_KEY_PASSWORD, WALLET_ENCRYPTION_ALGORITHM, WALLET_ENCRYPTION_PRIVATE_KEY, WALLET_ENCRYPTION_PUBLIC_KEY } from './../configuration/index';
import * as  moment from "moment";
import { hash as bcryptHash, compare } from "bcrypt";
import slugify from "slugify";
import { env } from "src/configuration";
import { createCipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";
// import { google } from "googleapis";
import * as crypto from "crypto";

export const convertDate = (date: any) => {
  return new Date(date).toISOString();
};

export const getDaysDate = (startDate: any, stopDate: any) => {
  var dateArray = [];
  var currentDate = moment(startDate);
  var stopDatee = moment(stopDate);
  while (currentDate <= stopDatee) {
    dateArray.push(moment(currentDate).format("YYYY-MM-DD"));
    currentDate = moment(currentDate).add(1, "days");
  }
  return dateArray;
};
export const isEmpty = (value: any) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

const saltRound = 10;
export const hash = async (password: string) => {
  const hash = await bcryptHash(password, saltRound);
  return hash;
};
/** compare hash password */

export const compareHash = async (password: string, hashedPassword: string) => {
  const bool = await compare(password, hashedPassword);
  return bool;
};

export const generateCryptographicSecret = async (
  password: string,
  secretText: string
) => {
  const iv = randomBytes(16);

  const key = (await promisify(scrypt)(password, "salt", 32)) as Buffer;
  const cipher = createCipheriv("aes-256-ctr", key, iv);
  const encryptedText = Buffer.concat([
    cipher.update(secretText),
    cipher.final(),
  ]).toString();
  return encryptedText;
};

export const maybePluralize = (count: number, noun: string, suffix = "s") =>
  `${noun}${count !== 1 ? suffix : ""}`;

/** generate random number */
export const randomFixedInteger = (length: number) => {
  const power10minus1 = 10 ** (length - 1);
  const power10 = 10 ** length;
  let rand = Math.floor(
    power10minus1 + Math.random() * (power10 - power10minus1 - 1)
  );
  if (String(rand).slice(0, 1) === "0") {
    rand = Math.floor(Math.random() * 899999 + 100000);
  }
  return rand;
};

export const secondsToDhms = (secs: number | string) => {
  const seconds = Number(secs);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  let dhms = dDisplay + hDisplay + mDisplay + sDisplay;
  dhms = String(dhms).trim();
  if (dhms.endsWith(",")) dhms = String(dhms).slice(0, dhms.length - 1);
  return dhms;
};

/** checks if both verification fields are true then returns true */
export const isVerified = (
  emailVerified: boolean,
  phoneVerified: boolean
): boolean => {
  return emailVerified && phoneVerified;
};

export const createSlug = (word: string) => {
  return slugify(word, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: false, // convert to lower case, defaults to `false`
    strict: false, // strip special characters except replacement, defaults to `false`
    locale: "vi", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });
};

const generateRef = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateWalletRef = () => {
  const key = env.isProd ? "SWITCH_LIVE_" : "SWITCH_TEST_";
  const reference = key + generateRef(6);
  return reference;
};

export const generateTXRef = () => {
  const key = env.isProd ? "SWITCH_REF_LIVE_" : "SWITCH_REF_TEST_";
  const reference = key + generateRef(6);
  return reference;
};

export const generateTXHash = () => {
  const key = env.isProd ? "SWITCH_HASH_LIVE_" : "SWITCH_HASH_TEST_";
  const reference = key + generateRef(6);
  return reference;
};
export const generateReference = (type: string) => {
  let ref = '';
  const mode = env.isProd ? 'LIVE-' : 'TEST-';

  switch (type) {
    case 'general':
      ref = `SWITCHA-REF-${mode}${generateRef(10)}`.toLowerCase();
      break;

    case 'credit':
      ref = `SWITCHA-REF-${mode}CREDIT-${generateRef(10)}`.toLowerCase();
      break;

    case 'debit':
      ref = `SWITCHA-REF-${mode}DEBIT-${generateRef(10)}`.toLowerCase();
      break;
  }
  return ref;
};

export const generateReferencePrefix = (type: string) => {
  let ref = '';
  const mode = env.isProd ? 'LIVE-' : 'TEST-';

  switch (type) {
    case 'general':
      ref = `SWITCHA-REF-${mode}`.toLowerCase();
      break;

    case 'credit':
      ref = `SWITCHA-REF-${mode}CREDIT-`.toLowerCase();
      break;

    case 'debit':
      ref = `SWITCHA-REF-${mode}DEBIT-`.toLowerCase();
      break;
  }
  return ref;
};

// export const generateGoogleAuthUrl = () => {
//   const oauth2Client = new google.auth.OAuth2(
//     GOOGLE_CLIENT_ID,
//     GOOGLE_CLIENT_SECRET,
//     /*
//      * This is where Google will redirect the user after they
//      * give permission to your application
//      */
//     `https://localhost:${PORT}/auth/google`,
//   );
//   const scopes = [
//     'https://www.googleapis.com/auth/userinfo.profile',
//     'https://www.googleapis.com/auth/userinfo.email',
//   ];

//   return oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     prompt: 'consent',
//     scope: scopes, // If you only need one scope you can pass it as string
//   });
// }


export const generateEncryptionKey = (payload: { username: string, userId: string, pin: string }) => {
  const { username, userId, pin } = payload
  const key = `+${userId}+${WALLET_ENCRYPTION_PRIVATE_KEY}+${username}+${pin}+${WALLET_ENCRYPTION_PUBLIC_KEY}`
  return crypto.scryptSync(key, "salt", 24);
};

export const generateEncryptionIV = () => {
  return Buffer.alloc(16, 0); // Initialization vector.
};

export const encryptData = (payload: { text: string, username: string, userId: string, pin: string }) => {
  try {
    const { text, username, userId, pin } = payload
    const key = generateEncryptionKey({ username, userId, pin });
    const iv = generateEncryptionIV();
    const cipher = crypto.createCipheriv(WALLET_ENCRYPTION_ALGORITHM, key, iv);

    let encrypted;
    encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (e) {
    throw new Error(e);
  }
};

export const decryptData = (payload: { text: string, username: string, userId: string, pin: string }) => {
  try {
    const { text, username, userId, pin } = payload
    const key = generateEncryptionKey({ username, userId, pin });
    const iv = generateEncryptionIV();

    const decipher = crypto.createDecipheriv(WALLET_ENCRYPTION_ALGORITHM, key, iv);

    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    throw new Error(e);
  }
};

export const specificTimePeriod = (payload: { date: Date, period: 'days' | 'weeks' | 'years' }) => {
  const { date, period } = payload
  const now = moment()
  return now.diff(date, period)
}





export const generateEncryptionKeyForPrivateKey = () => {
  return crypto.scryptSync(PRIVATE_KEY_PASSWORD, "salt", 24);
};

export const generateEncryptionIVForPrivateKey = () => {
  return Buffer.alloc(16, 0); // Initialization vector.
};


export const encryptPrivateKey = (text: string) => {
  try {
    const key = generateEncryptionKeyForPrivateKey();
    const iv = generateEncryptionIVForPrivateKey();
    const cipher = crypto.createCipheriv(PRIVATE_KEY_ALGORITHM, key, iv);

    let encrypted;
    encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (e) {
    throw new Error(e);
  }
};

export const decryptPrivateKey = (text: string) => {
  try {
    const key = generateEncryptionKeyForPrivateKey();
    const iv = generateEncryptionIVForPrivateKey();
    const decipher = crypto.createDecipheriv(PRIVATE_KEY_ALGORITHM, key, iv);

    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    throw new Error(e);
  }
};