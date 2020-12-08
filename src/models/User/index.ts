import { v4 } from "uuid";
import bcrypt, { hash } from "bcryptjs";
import instance from "../../database";
import { UserSetOptions } from "./UserSetOptions";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import ms from "ms";

dotenv.config();

class User {
  private _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _avatar: string;

  constructor(name: string, email: string, password: string, avatar: string) {
    if (!process.env.PW_SALT) throw new Error("PW_SALT not defined");

    const hashed = bcrypt.hashSync(password, process.env.PW_SALT);
    
    this._id = v4();
    this._name = name;
    this._email = email;
    this._password = hashed
    this._avatar = avatar;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get email() {
    return this._email;
  }

  get avatar() {
    return this._avatar;
  }

  public comparePassword(other: string): boolean {
    if (!process.env.PW_SALT) throw new Error("PW_SALT not defined");
    const hashed = bcrypt.hashSync(other, process.env.PW_SALT);
    
    return hashed === this._password;
  }

  public toString(): string {
    const keys = Object.keys(this);
    const result = {};

    keys.forEach((key) => {
      if (key.startsWith("_")) {
        result[key.substring(1)] = this[key];
        return;
      }
    });

    return JSON.stringify(result);
  }

  public toObject(){
    const keys = Object.keys(this);
    const result = {};

    keys.forEach((key) => {
      if(key === "_password") return;

      if (key.startsWith("_")) {
        result[key.substring(1)] = this[key];
        return;
      }
    });

    return result;
  }

  public equals(other: User) {
    return this._id === other.id;
  }

  public validate() {
    if(!this._name) throw new Error("name is not valid");
    if(!this._password) throw new Error("password is not valid");
    if(!this._email) throw new Error("email is not valid");
    if(!this._avatar) throw new Error("avatar is not valid");
    if(!this._id) throw new Error("id is not valid");
  }

  public set(paths: UserSetOptions): User {
    for (let path in Object.keys(paths)) {
      this[`_${path}`] = paths[path];
    }

    return this;
  }

  public issueAccessToken() {
    const body = {
      email: this._email,
      name: this._name,
      avatar: this._avatar,
    }

    const expires_in = process.env.TOKEN_EXPIRATION;
    const access_token = jwt.sign(body, process.env.ACCESS_KEY, {expiresIn: expires_in, subject: "login"});

    return({access_token, expires_in: ms(expires_in)})
  }

  public issueAuthorizationToken() {
    const body = {
      email: this._email,
      name: this._name,
      avatar: this._avatar,
    }

    const expires_in = process.env.TOKEN_EXPIRATION;
    const authorization_token = jwt.sign(body, process.env.AUTHORIZATION_KEY, {expiresIn: expires_in, subject: "permit_app"});

    return({authorization_token, expires_in: ms(expires_in)})
  }

  public static async findByJwt(token: string) : Promise<User> {
    const payload : any = jwt.verify(token, process.env.AUTHORIZATION_KEY);

    const user = await User.findByEmail(payload.email);
    if(!user) throw new Error("user not found");

    return user;
  }

  public async save() {
    const body = this.toString();

    this.validate();

    const resultBody = await instance.set(
      this._id,
      body
    );

    const resultEmail = await instance.set(
      this._email,
      this._id
    );

    if (resultBody === "OK" && resultEmail === "OK") return this;

    throw new Error("failed to save");
  }

  private static factory(user: any): User {
    const result = new User(user.name, user.email, user.password, user.avatar);
    result._id = user.id;
    result._password = user.password;
    return result;
  }

  public static async findById(id: string): Promise<User> {
    const result = await instance.get(id);
    if (result) return User.factory(JSON.parse(result));
    else return null;
  }

  
  public static async findByEmail(email: string): Promise<User> {
    const id = await instance.get(email);
    if(!id) return null;

    const result = await instance.get(id);
    
    if(!result) return null;
    const user = User.factory(JSON.parse(result));

    if(user) return user;
    else return null;
  }

  public static async findByIdAndDelete(id: string): Promise<void> {
    const result = await instance.del(id);
    if (result > 0) return;

    throw new Error("client not found");
  }
}

export default User;
