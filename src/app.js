const LambdaEntry = require('../LambdaEntry');

exports.handler = async event => {
    try {
        return LambdaEntry.handleMessage(event);
    } catch (e) {
        return { statusCode: 500, body: e.stack };
    }
}
