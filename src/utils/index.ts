import crypto from "crypto";
import path from "path";
import fs from "fs";

const char = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_!@#$%&*()=+";
const PRIVATE_KEY = "./src/keys/rsa_4096_priv.pem";
const PUBLIC_KEY = "./src/keys/rsa_4096_pub.pem";

const randomChar = (length: number) => {
  const arr = [];

  for (let i = 0; i < length; i++) {
    arr.push(char[Math.round(Math.random() * char.length)]);
  }

  return arr.join("");
};

const encrypt = (
  toEncrypt: string,
  publicKeyPath: string = PUBLIC_KEY
): string => {
  const absolutePath = path.resolve(publicKeyPath);
  const publicKey = fs.readFileSync(absolutePath, "utf8");

  const buffer = Buffer.from(toEncrypt, "utf8");

  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
};

const decrypt = (
  toDecrypt: string,
  privateKeyPath: string = PRIVATE_KEY
): string => {
  const absolutePath = path.resolve(privateKeyPath);
  const privateKey = fs.readFileSync(absolutePath, "utf8");

  const buffer = Buffer.from(toDecrypt, "base64");

  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: "",
    },
    buffer
  );

  return decrypted.toString("utf-8");
};



export default { randomChar, encrypt, decrypt };
