import Redis from "ioredis";

const instance = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export default instance;
