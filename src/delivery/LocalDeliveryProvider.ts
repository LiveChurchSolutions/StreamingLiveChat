import WebSocket from "ws";
import { DBHelper } from '../db/DBHelper';
import { DeliveryProviderInterface } from "./DeliveryProviderInterface";
import { DeliveryHelper } from "./DeliveryHelper";
import { ConnectionInterface, ChatInterface } from "../Interfaces";



export class LocalDeliveryProvider implements DeliveryProviderInterface {
    public sendMessages = async (room: string, message: ChatInterface) => {
        const connections: ConnectionInterface[] = DBHelper.scanRoom("room", room);
        const promises: Promise<any>[] = [];
        connections.forEach(c => { promises.push(this.sendMessage(c.connectionId, message, c.ws)); });
        await Promise.all(promises);
    }

    public sendMessage = async (connectionId: string, message: ChatInterface, socket?: WebSocket) => {
        try {
            if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
            else DeliveryHelper.deleteConnection(connectionId);
        } catch (e) {
            console.log(e);
        }
    }

}