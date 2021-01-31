import { ChatInterface } from "./Interfaces";
import { Connection } from "./Connection";
import { Message } from "./Message";
import { DeliveryHelper } from "./delivery/DeliveryHelper";
import WebSocket from "ws";


export class Router {
    public static async routeChat(connectionId: string, action: string, room: string, data: ChatInterface, socket: WebSocket) {
        if (action === "keepAlive") return;
        if (action === "joinRoom") await Connection.join(connectionId, room, data, socket);
        else if (action === "setName") await Connection.setName(connectionId, data.displayName);
        else if (action === "disconnect") await DeliveryHelper.deleteConnection(connectionId);
        else if (action === "sendMessage") await Message.send(room, data);
        else if (action === "requestPrayer") await Message.requestPrayer(room, data);
        else if (action === "setCallout") await Message.setCallout(room, data);
        else if (action === "deleteMessage") await Message.delete(room, data);
        else if (action === "updateConfig") await Message.updateConfig(room, data);
        else if (action === "cleanup") await Router.cleanup();
        else throw (action);
    }

    public static async cleanup() {
        const promises = [];
        promises.push(Connection.cleanup());
        promises.push(Connection.cleanup());
        await Promise.all(promises);
    }
}