const aws = require('aws-sdk')

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_USER_ACCESS_ID,
    secretAccessKey: process.env.AWS_USER_SECRET_ACCESS_KEY,
    Bucket: "carousell-scraper-bucket"
})

exports.readFile = async (params) => {
    return new Promise((resolve, reject) => {
        s3.createBucket({
            Bucket: params.Bucket       /* Put your bucket name */
        }, function () {
            s3.getObject(params, function (err, data) {
                if (err) {
                    console.log("File not found: " + params.Key)
                    resolve({});
                } else {
                    console.log("Successfully dowloaded file: " + params.Key);
                    const body = JSON.parse(data.Body.toString())
                    resolve(body);
                }
            });
        });
    });

}

exports.writeFile = async (params) => {
    return new Promise((resolve, reject) => {
        s3.createBucket({
            Bucket: params.bucket        /* Put your bucket name */
        }, function () {
            s3.putObject(params, function (err, data) {
                if (err) {
                    console.error("Error when writing file: " + params.Key)
                    console.error(err.message)
                    resolve(data)
                } else {
                    console.log("Successfully uploaded file: " + params.Key);
                    resolve(data);
                }
            });
        });
    });
}