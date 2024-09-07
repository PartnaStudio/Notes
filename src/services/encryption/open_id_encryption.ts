import optionService from "../options.js";
import myScryptService from "./my_scrypt.js";
import utils from "../utils.js";
import dataEncryptionService from "./data_encryption.js";
import sql from "../sql.js";
import sqlInit from "../sql_init.js";

function saveSubjectIdentifier(subjectIdentifier: string) {
  if (isUserSaved()) return false;

  // Allows setup with existing instances of trilium
  sql.execute(`
    CREATE TABLE IF NOT EXISTS "user_data"
    (
        tmpID INT,
        userIDEcnryptedDataKey TEXT,
        userIDVerificationHash TEXT,
        salt TEXT,
        derivedKey TEXT,
        isSetup TEXT DEFAULT "false",
        UNIQUE (tmpID),
        PRIMARY KEY (tmpID)
    );`);

  const verificationSalt = utils.randomSecureToken(32);
  const derivedKeySalt = utils.randomSecureToken(32);

  const verificationHash = myScryptService.getSubjectIdentifierVerificationHash(
    subjectIdentifier,
    verificationSalt
  );
  if (verificationHash === undefined) {
    console.log("Verification hash undefined!");
    return undefined;
  }

  const userIDEncryptedDataKey = setDataKey(
    subjectIdentifier,
    utils.randomSecureToken(16),
    verificationSalt
  );

  if (userIDEncryptedDataKey === undefined || userIDEncryptedDataKey === null) {
    console.log("USERID ENCRYPTED DATA KEY NULL");
    return undefined;
  }

  const data = {
    tmpID: 0,
    userIDVerificationHash: utils.toBase64(verificationHash),
    salt: verificationSalt,
    derivedKey: derivedKeySalt,
    userIDEcnryptedDataKey: userIDEncryptedDataKey,
    isSetup: "true",
  };

  console.log("Saved data: " + data);
  sql.upsert("user_data", "tmpID", data);
  return true;
}

function isSubjectIdentifierSaved() {
  const value = sql.getValue("SELECT userIDEcnryptedDataKey FROM user_data;");
  if (value === undefined || value === null || value === "") return false;
  return true;
}

function isUserSaved() {
  const isSaved = sql.getValue<string>("SELECT isSetup FROM user_data;");
  return isSaved === "true" ? true : false;
}
 
function verifyOpenIDSubjectIdentifier(subjectIdentifier: string) {
  if (!sqlInit.isDbInitialized()) {
    console.log("Database not initialized!");
    return undefined;
  }

  if (!isUserSaved()) {
    console.log("DATABASE NOT SETUP");
    return undefined;
  }

  const salt = sql.getValue("SELECT salt FROM user_data;");
  if (salt == undefined) {
    console.log("Salt undefined");
    return undefined;
  }

  const givenHash = myScryptService
    .getSubjectIdentifierVerificationHash(subjectIdentifier)
    ?.toString("base64");
  if (givenHash === undefined) {
    console.log("Sub id hash undefined!");
    return undefined;
  }

  const savedHash = sql.getValue(
    "SELECT userIDVerificationHash FROM user_data"
  );
  if (savedHash === undefined) {
    console.log("verification hash undefined");
    return undefined;
  }

  console.log("Matches: " + givenHash === savedHash);
  return givenHash === savedHash;
}

function setDataKey(
  subjectIdentifier: string,
  plainTextDataKey: string | Buffer,
  salt: string
) {
  console.log("Subject Identifier: " + subjectIdentifier);
  const subjectIdentifierDerivedKey =
    myScryptService.getSubjectIdentifierDerivedKey(subjectIdentifier, salt);

  if (subjectIdentifierDerivedKey === undefined) {
    console.log("SOMETHING WENT WRONG SAVING USER ID DERIVED KEY");
    return undefined;
  }
  const newEncryptedDataKey = dataEncryptionService.encrypt(
    subjectIdentifierDerivedKey,
    plainTextDataKey
  );

  return newEncryptedDataKey;
}

function getDataKey(subjectIdentifier: string) {
  console.log("Subject Identifier: " + subjectIdentifier);
  const subjectIdentifierDerivedKey =
    myScryptService.getSubjectIdentifierDerivedKey(subjectIdentifier);

  const encryptedDataKey = sql.getValue(
    "SELECT userIDEcnryptedDataKey FROM user_data"
  );

  if (encryptedDataKey === undefined || encryptedDataKey === null) {
    console.log("Encrypted data key empty!");
    return undefined;
  }

  if (subjectIdentifierDerivedKey === undefined) {
    console.log("SOMETHING WENT WRONG SAVING USER ID DERIVED KEY");
    return undefined;
  }
  const decryptedDataKey = dataEncryptionService.decrypt(
    subjectIdentifierDerivedKey,
    encryptedDataKey.toString()
  );

  return decryptedDataKey;
}

export default {
  verifyOpenIDSubjectIdentifier,
  getDataKey,
  setDataKey,
  saveSubjectIdentifier,
  isSubjectIdentifierSaved,
};