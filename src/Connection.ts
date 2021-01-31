import { DBHelper } from './db/DBHelper';
import { Catchup } from './Catchup';
import { DeliveryHelper } from './delivery/DeliveryHelper';
import { Utils } from './Utils';
import WebSocket from 'ws';

export class Connection {
    static join = async (connectionId: string, room: string, data: any, socket?: WebSocket) => {
        const name = data.displayName === undefined ? "Anonymous" : data.displayName;
        const canJoin = (room.indexOf("_host") === -1) ? true : Utils.isHost(data.token, room);
        if (canJoin) {
            const doStore = await DBHelper.checkStoreConnection(room, connectionId);
            if (doStore) {
                await DBHelper.storeConnection(room, connectionId, name, socket);
                await Catchup.sendCatchup(connectionId, room, socket);
                await DeliveryHelper.sendAttendance(room);
            }
        }
    }

    static cleanup = async () => {
        const threshold = new Date(Date.now());
        threshold.setHours(threshold.getHours() - 6);
        const connections = await DBHelper.loadExpiredConnections();
        const promises: Promise<any>[] = [];
        connections.forEach(connection => promises.push(DeliveryHelper.deleteRoom(connection.room, connection.connectionId, true)));
        return Promise.all(promises);
    }

    static setNameRoom = async (room: string, connectionId: string, name: string) => {
        await DBHelper.setUserName(room, connectionId, name).then(async () => {
            await DeliveryHelper.sendAttendance(room)
        });
    }

    static setName = async (connectionId: string, name: string) => {
        const rooms = await DBHelper.loadRooms(connectionId);
        const promises: Promise<any>[] = [];
        rooms.forEach(room => { promises.push(Connection.setNameRoom(room, connectionId, name)); });
        await Promise.all(promises);
    }
}