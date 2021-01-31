import { ChatInterface } from "../Interfaces";
import { DeliveryProviderInterface } from "./DeliveryProviderInterface";
import { AwsDeliveryProvider } from "./AwsDeliveryProvider"
import { LocalDeliveryProvider } from "./LocalDeliveryProvider"
import { DBHelper } from '../db/DBHelper';
import WebSocket from "ws";

export class DeliveryHelper {

    static provider: DeliveryProviderInterface;

    static getProvider = () => {
        if (DeliveryHelper.provider === undefined) DeliveryHelper.provider = (process.env.DELIVERY_PROVIDER === "aws") ? new AwsDeliveryProvider() : new LocalDeliveryProvider();
        return DeliveryHelper.provider;
    }

    static sendMessages = async (room: string, message: ChatInterface) => { DeliveryHelper.getProvider().sendMessages(room, message); }
    static sendMessage = async (connectionId: string, message: ChatInterface, socket?: WebSocket) => { DeliveryHelper.getProvider().sendMessage(connectionId, message, socket); }

    static sendAttendance = async (room: string) => {
        let names: string[] = await DBHelper.loadAttendance(room);
        names = names.sort();
        const consolidated = [];
        let lastName = null;
        for (let i = 0; i <= names.length; i++) {
            if (names[i] === lastName) consolidated[consolidated.length - 1].count++;
            else {
                consolidated.push({ displayName: names[i], count: 1 });
                lastName = names[i];
            }
        }

        const message = { action: "updateAttendance", room, viewers: consolidated, totalViewers: consolidated.length };
        await DeliveryHelper.sendMessages(room, message);
    }
    static deleteConnection = async (connectionId: string) => {
        const rooms = await DBHelper.loadRooms(connectionId);
        const promises: Promise<any>[] = [];
        rooms.forEach(room => { promises.push(DeliveryHelper.deleteRoom(room, connectionId, false)); });
        await Promise.all(promises);
    }
    static deleteRoom = async (room: string, connectionId: string, silent: boolean) => {
        await DBHelper.deleteConnection(room, connectionId);
        if (!silent) DeliveryHelper.sendAttendance(room);
    }

}