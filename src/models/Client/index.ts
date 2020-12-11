import { v4 } from "uuid";
import { ClientInterface } from "./IClient";
import { ClientSetOptions } from "./ClientSetOptions";
import { ClientCreateOptions } from "./ClientCreateOptions";
import instance from "../../database";
import utils from "../../utils";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

class Client implements ClientInterface {
  private _id: string;
  private _code: string;
  private _secret: string;
  private _ip: string;
  private _expires: number;

  constructor(client: ClientCreateOptions) {
    this._id = client.socketId;
    this._ip = client.ip;

    const code = utils.randomChar(12);

    this._code = code;
    this._secret = crypto.randomBytes(16).toString("hex");

    this._expires = 30000;
  }

  get id() {
    return this._id;
  }
  get code() {
    return this._code;
  }
  get ip() {
    return this._ip;
  }

  public validate() {
    if (!this._id) throw new Error("indvalid ID");
    if (!this._code) throw new Error("indvalid code");
    if (!this._secret) throw new Error("indvalid auth");
    if (!this._ip) throw new Error("indvalid ip");
  }

  public set(paths: ClientSetOptions): Client {
    for (let path in Object.keys(paths)) {
      this[`_${path}`] = paths[path];
    }

    return this;
  }

  public async save(): Promise<Client> {
    this.validate();
    const clientResult = await instance.set(
      this._id,
      JSON.stringify(this),
      "EX",
      86400
    );
    const idResult = await instance.set(
      this._code,
      this._id,
      "EX",
      86400
    );

    if (idResult === "OK" && clientResult === "OK") return this;

    throw new Error("failed to save");
  }

  public equals(other: Client): boolean {
    return this._id === other._id;
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  private static factory = (client: any): Client => {
    const result = new Client({ ip: client._ip, socketId: client._socketId });

    result._ip = client._ip;
    result._secret = client._secret;
    result._code = client._code;
    result._id = client._id;

    return result;
  };

  public static async findById(id: string): Promise<Client> {
    const result = await instance.get(id);
    if (result) return Client.factory(JSON.parse(result));
    else return null;
  }

  public static async findByCode(code: string): Promise<Client> {
    const result = await instance.get(code);
    if (result) return Client.findById(result);
    else return null;
  }

  public static async findByIdAndDelete(id: string): Promise<void> {
    const result = await instance.del(id);
    if (result > 0) return;

    throw new Error("client not found");
  }

  private hashCode = (code: string) => {
    const signature = this._id + code + this._secret;
    return crypto.createHash('sha256').update(signature).digest('hex');
  }

  public verify(value: string) : boolean {
    const [code, signature] = value.split(".");
    const hash = this.hashCode(code);

    return hash === signature;
  }

  public generate() : string {
    let code = utils.randomChar(16);
    const signature = this.hashCode(code);

    const result = {
      code: `${code}.${signature}`,
      expires: this._expires,
    }

    return JSON.stringify(result);
  }
}

export default Client;
