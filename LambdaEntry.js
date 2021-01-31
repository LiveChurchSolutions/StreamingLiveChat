
const { AwsDeliveryProvider } = require('./dist/delivery/AwsDeliveryProvider');
const { WinstonLogger } = require('./dist/Logger');
const dotenv = require('dotenv');
const { Router } = require("./dist/Router")

module.exports.handleMessage = async function handleMessage(event) {
    const rc = event.requestContext;
    const eventType = rc.eventType;
    const connectionId = rc.connectionId;
    //NOTE: When not using a custom domain name you need domain+stage;
    //const apiUrl = rc.domainName + '/' + rc.stage;
    const apiUrl = rc.domainName;
    AwsDeliveryProvider.apiUrl = apiUrl;
    dotenv.config();

    try {
        if (eventType == "DISCONNECT") await Router.routeChat(connectionId, "disconnect", null, null, null);
        else {
            const body = JSON.parse(event.body);
            await Router.routeChat(connectionId, body.action, body.room, body, null);
        }
    } catch (e) {
        const wl = new WinstonLogger();
        wl.error(e);
        await wl.flush();
        console.log(e);
    }

    return { statusCode: 200, body: 'success' }
}
