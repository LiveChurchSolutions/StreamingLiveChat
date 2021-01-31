import { Utils } from './Utils';
import { DeliveryHelper } from './delivery/DeliveryHelper';
import { DBHelper } from './db/DBHelper';
import { MessageInterface } from './Interfaces';

export class Message {

    static send = async (room: string, message: MessageInterface) => {
        const canSend = (room.indexOf("_host") === -1) ? true : Utils.isHost(message.token, room);
        if (canSend) {
            message.msg = Utils.replaceBadWords(message.msg);
            message.token = null;
            message.ts = parseInt(Date.now().toString(), 0);
            await DeliveryHelper.sendMessages(room, message);
            await DBHelper.storeCatchup(room, message);
        }
    }

    static requestPrayer = async (room: string, message: MessageInterface) => {
        message.token = null;
        message.ts = parseInt(Date.now().toString(), 0);
        await DeliveryHelper.sendMessages(room + '.host', message);
        await DBHelper.storeCatchup(room + '.host', message);
    }

    static setCallout = async (room: string, message: MessageInterface) => {
        if (Utils.isHost(message.token, room)) {
            message.token = null;
            message.ts = parseInt(Date.now().toString(), 0);
            await DeliveryHelper.sendMessages(room, message);
            await DBHelper.storeCatchup(room, message);
        }
    }

    static delete = async (room: string, message: MessageInterface) => {
        if (Utils.isHost(message.token, room)) {
            message.token = null;
            await DeliveryHelper.sendMessages(room, message);
            await DBHelper.storeCatchup(room, message);
        }
    }

    static updateConfig = async (room: string, message: any) => { DeliveryHelper.sendMessages(room, message); }
}