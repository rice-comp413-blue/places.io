db_auth = {   
    user: 'comp413',
    host: 'placesdb.c575iz0ooov1.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'comp413-blueteam-places',
    port: 5432,
}

s3_auth = {
    accessKeyId: "AKIA5T7WFZYA2DYICGVR",
    secretAccessKey: "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"
}

module.exports = { db_auth, s3_auth }

