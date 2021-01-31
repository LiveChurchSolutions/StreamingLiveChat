import WebSocket from 'ws';
import { DBHelper } from './db/DBHelper';
import { DeliveryHelper } from './delivery/DeliveryHelper';
import { CatchupInterface } from './Interfaces';

export class Catchup {

    static cleanup = async () => {
        await DBHelper.cleanupCatchup();
    }

    static sendCatchup = async (connectionId: string, room: string, socket?: WebSocket) => {
        const messages = await DBHelper.loadCatchup(room);
        if (messages.length > 0) {
            const postData: CatchupInterface = { action: "catchup", room, messages };
            await DeliveryHelper.sendMessage(connectionId, postData, socket);
        }
    }
}