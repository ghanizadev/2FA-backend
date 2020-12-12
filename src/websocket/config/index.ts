const origin = {
  development: ["http://localhost:3030"],
  production: ["https://2-fa-frontend.vercel.app"]
}

export default {
    cors: {
        origin: origin[process.env.NODE_ENV],
        methods: ["GET", "POST"],
        allowedHeaders: ["*"]
      }
}