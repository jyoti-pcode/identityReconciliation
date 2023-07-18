export const config = {
    PORT: parseInt(process.env.PORT),
    MONGO: {
        MONGO_STAGING_URI: process.env.MONGODB_URI
    },
    RDB: {
        RDB_STAGING_URI: process.env.RDB_URI
    }
}