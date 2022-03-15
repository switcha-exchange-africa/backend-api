import moment from "moment";
import { hash as bcryptHash, compare } from "bcrypt";
import slugify from "slugify";

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
