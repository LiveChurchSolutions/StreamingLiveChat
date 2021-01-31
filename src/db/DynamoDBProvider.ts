import AWS from 'aws-sdk';
import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { DBProviderInterface } from "./DBProviderInterface"
import { ConnectionInterface, MessageInterface, CatchupInterface } from "../Interfaces";

let ddb: AWS.DynamoDB.DocumentClient;

if (process.env.IS_OFFLINE === 'true') {
    ddb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: process.env.DYNAMO_LOCAL_ENDPOINT,
    });
}
else {
    ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
}


export class DynamoDBProvider implements DBProviderInterface {
    // *** Catchup
    public deleteCatchup = (room: string) => {
        return this.delete(process.env.CATCHUP_TABLE, { room });
    }

    public loadCatchup = async (room: string) => {
        const data = await this.loadData(process.env.CATCHUP_TABLE, "room = :room", { ":room": room }, "messages");
        let messages: MessageInterface[] = [];
        if (data.Items.length > 0) {
            messages = data.Items[0].messages;
            const expiration = Date.now() - (1000 * 60 * 15);
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].ts < expiration) messages.splice(i, 1);
            }
        }
        return messages;
    }

    public storeCatchup = async (room: string, msg: MessageInterface) => {
        const messages: MessageInterface[] = await this.loadCatchup(room);
        messages.push(msg);
        const record: CatchupInterface = {
            room,
            messages
        };
        await this.storeData(process.env.CATCHUP_TABLE, record);
    }

    public cleanupCatchup = async () => {
        const threshold = new Date(Date.now());
        threshold.setMinutes(threshold.getMinutes() - 30);
        const data = await this.loadData(process.env.CATCHUP_TABLE, "ts < :ts", { ":ts": threshold }, "room");
        const promises: Promise<any>[] = [];
        data.Items.forEach(item => { promises.push(this.deleteCatchup(item.room)) });
        return Promise.all(promises);
    }


    // *** Connections
    public loadRooms = async (connectionId: string) => {
        const data = await this.scan(process.env.CONNECTIONS_TABLE, "connectionId = :connectionId", { ":connectionId": connectionId }, "room");
        const items = data.Items;
        const result: string[] = [];
        items.forEach(item => result.push(item.room));
        return result;
    }


    public storeConnection = async (room: string, connectionId: string, name: string) => {
        const record: ConnectionInterface = {
            room,
            connectionId,
            displayName: name,
            joinTime: Date.now(),
            prettyJoinTime: Date.now().toString()
        };
        await this.storeData(process.env.CONNECTIONS_TABLE, record);
    }

    public checkStoreConnection = async (room: string, connectionId: string) => {
        const data = await this.loadData(process.env.CONNECTIONS_TABLE, "room = :room and connectionId = :connectionId", { ":room": room, ":connectionId": connectionId }, "connectionId");
        const result: any[] = [];
        data.Items.forEach(item => { result.push(item.connectionId); });
        return result.length === 0;
    }


    public loadAttendance = async (room: string) => {
        const data = await this.loadData(process.env.CONNECTIONS_TABLE, "room = :room", { ":room": room }, "displayName");
        const result: any[] = [];
        data.Items.forEach(item => { result.push(item.displayName); });
        return result;
    }

    public getConnectionIds = async (room: string) => {
        const data = await this.loadData(process.env.CONNECTIONS_TABLE, "room = :room", { ":room": room }, "connectionId");
        const result: string[] = [];
        data.Items.forEach(item => { result.push(item.connectionId); });
        return result;
    }

    public deleteConnection = async (room: string, connectionId: string) => {
        const key: AWS.DynamoDB.DocumentClient.Key = { "room": room, "connectionId": connectionId };
        await this.delete(process.env.CONNECTIONS_TABLE, key);
    }


    public setUserName = async (room: string, connectionId: string, name: string) => {
        const key: AWS.DynamoDB.DocumentClient.Key = { "room": room, "connectionId": connectionId };
        const expression = "set displayName = :displayName"
        const values = { ":displayName": name };
        return this.updateData(process.env.CONNECTIONS_TABLE, key, expression, values);
    }

    public loadExpiredConnections = async (threshold: number) => {
        const data = await this.loadData(process.env.CONNECTIONS_TABLE, "joinTime < :ts", { ":ts": threshold }, "room, connectionId");
        const result: ConnectionInterface[] = [];
        data.Items.forEach(item => {
            result.push({ connectionId: item.connectionId, room: item.room, displayName: item.displayName, joinTime: item.joinTime, prettyJoinTime: item.prettyJoinTime });
        });
        return result;
    }



    // ***Generic
    private scan = async (tableName: string, filter: string, values: any, projection: string) => {
        return ddb.scan({
            TableName: tableName,
            FilterExpression: filter,
            ExpressionAttributeValues: values,
            ProjectionExpression: projection
        }).promise();
    }


    private loadData = async (tableName: string, key: string, values: any, projection: string) => {
        return ddb.query({
            TableName: tableName,
            KeyConditionExpression: key,
            ExpressionAttributeValues: values,
            ProjectionExpression: projection,
            ConsistentRead: true
        }).promise();
    }

    private storeData = async (tableName: string, item: any) => {
        const putParams = {
            TableName: tableName,
            Item: item
        };
        return ddb.put(putParams).promise();
    }

    private updateData = async (tableName: string, key: AWS.DynamoDB.DocumentClient.Key, expression: string, values: any) => {
        const updateParams: UpdateItemInput = {
            TableName: tableName,
            Key: key,
            UpdateExpression: expression,
            ExpressionAttributeValues: values
        };
        return ddb.update(updateParams).promise();
    }

    private delete = async (tableName: string, key: AWS.DynamoDB.DocumentClient.Key) => {
        const delParams: AWS.DynamoDB.DocumentClient.DeleteItemInput = { TableName: tableName, Key: key };
        return ddb.delete(delParams).promise();
    }
}