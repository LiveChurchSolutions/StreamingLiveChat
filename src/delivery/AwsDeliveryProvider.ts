import { ApiGatewayManagementApi } from 'aws-sdk';
import { ChatInterface } from '../Interfaces';
import { DBHelper } from '../db/DBHelper';
import { DeliveryProviderInterface } from "./DeliveryProviderInterface";
import { DeliveryHelper } from './DeliveryHelper';

export class AwsDeliveryProvider implements DeliveryProviderInterface {

    public static apiUrl = "";


    public sendMessages = async (room: string, message: ChatInterface) => {
        const connectionIds = await DBHelper.getConnectionIds(room);
        const promises: Promise<any>[] = [];
        connectionIds.forEach(id => { promises.push(this.sendMessage(id, message)); });
        await Promise.all(promises);
    }

    public sendMessage = (connectionId: string, message: ChatInterface) => {
        const localApiUrl = "http://localhost:8201";

        const promise = new Promise<void>(async (resolve, reject) => {
            const apigwManagementApi = new ApiGatewayManagementApi({ apiVersion: '2020-04-16', endpoint: process.env.IS_OFFLINE ? localApiUrl : AwsDeliveryProvider.apiUrl });
            try {
                await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(message) }).promise();
            } catch {
                try {
                    await DeliveryHelper.deleteConnection(connectionId)
                } catch (e) {
                    reject(e)
                }
            }
            resolve();
        });
        return promise;
    }


}