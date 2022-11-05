const aws = require('aws-sdk')

const ssmClient = new aws.SSM({
    apiVersion: '2014-11-06',
    region: 'ap-southeast-1'
});

const params = {
    Name: 'TELEGRAM_BOT_TOKEN',
    WithDecryption: true,
}


exports.fetchParameterStore = async () => {
    console.log('Fetching from parameter store')
    let result = null
    const getParam = ssmClient.getParameter(params).promise();
    try {
        const data = await getParam
        return data.Parameter.Value
    } catch (err) {
        console.log(err, err.stack)
        return null;
    }
}