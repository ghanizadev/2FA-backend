import { v4 } from "uuid";
import { ClientInterface } from "./IClient";
import { ClientSetOptions } from "./ClientSetOptions";
import { ClientCreateOptions } from "./ClientCreateOptions";
import instance from "../../database";
import utils from "../../utils";
import dotenv from "dotenv";

dotenv.config();

class Client implements ClientInterface {
  private _id: string;
  private _code: string;
  private _auth: string;
  private _ip: string;
  private _expires: number;
  private _socketId: string;

  constructor(client: ClientCreateOptions) {
    this._id = v4();
    this._ip = client.ip;
    this._socketId = client.socketId;

    const code = utils.randomChar(12);

    this._code = code;
    this._auth = utils.encrypt(code);

    this._expires = 30000;
  }

  get id() {
    return this._id;
  }
  get code() {
    return this._code;
  }
  get auth() {
    return this._auth;
  }
  get ip() {
    return this._ip;
  }
  get socketId() {
    return this._socketId;
  }

  public validate() {
    if (!this._id) throw new Error("indvalid ID");
    if (!this._code) throw new Error("indvalid code");
    if (!this._auth) throw new Error("indvalid auth");
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
      this._expires / 1000
    );
    const idResult = await instance.set(
      this._code,
      this._id,
      "EX",
      this._expires / 1000
    );

    if (idResult === "OK" && clientResult === "OK") return this;

    throw new Error("failed to save");
  }

  public equals(other: Client): boolean {
    return this.id === other.id;
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  private static factory = (client: any): Client => {
    const result = new Client({ ip: client._ip, socketId: client._socketId });

    result._ip = client._ip;
    result._auth = client._auth;
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
}

export default Client;
