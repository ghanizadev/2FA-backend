import Redis from "ioredis";

const instance = new Redis(process.env.REDIS_HOST || "redis://localhost:6379");

export default instance;
