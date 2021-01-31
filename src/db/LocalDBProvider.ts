import { DBProviderInterface } from "./DBProviderInterface";
import { MessageInterface, ConnectionInterface, CatchupInterface } from "../Interfaces";
import WebSocket from "ws";


export class LocalDBProvider implements DBProviderInterface {

    chats: CatchupInterface[] = [];
    connections: ConnectionInterface[] = [];

    public deleteCatchup = async (room: string) => { this.getChatRoom(room).messages = []; }

    public loadCatchup = async (room: string) => {
        let messages: MessageInterface[] = [];
        messages = this.getChatRoom(room).messages;
        const expiration = Date.now() - (1000 * 60 * 15);
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].ts < expiration) messages.splice(i, 1);
        }
        return messages;
    }

    public storeCatchup = async (room: string, msg: MessageInterface) => {
        const messages: MessageInterface[] = await this.loadCatchup(room);
        msg.ts = parseInt(Date.now().toString(), 0);
        messages.push(msg);
        const record: CatchupInterface = { room, messages };
        this.chats.push(record);
    }

    public checkStoreConnection = async (room: string, connectionId: string) => {
        const results: string[] = [];
        this.connections.forEach(item => {
            if (item.connectionId === connectionId && item.room === room) results.push(item.connectionId);
        });
        return results.length === 0;
    }

    public loadAttendance = async (room: string) => {
        const data = this.connections.filter((c) => { return c.room === room });
        const result: string[] = [];
        data.forEach(item => result.push(item.displayName));
        return result;
    }

    public getConnectionIds = async (room: string) => {
        const data: ConnectionInterface[] = this.scanRoom("room", room);
        const result: string[] = [];
        data.forEach(item => { result.push(item.connectionId); });
        return result;
    }

    public cleanupCatchup = async () => {
        const threshold = new Date(Date.now());
        threshold.setMinutes(threshold.getMinutes() - 30);
        this.chats.forEach(c => {
            for (let i = c.messages.length - 1; i >= 0; i--) {
                if (c.messages[i].ts < threshold.getDate()) c.messages.splice(i, 1);
            }
        })
    }


    // connections
    public loadRooms = async (connectionId: string) => {
        const data: ConnectionInterface[] = this.scanRoom("connectionId", connectionId);
        const result: string[] = [];
        data.forEach(item => result.push(item.room));
        return result;
    }

    public storeConnection = async (room: string, connectionId: string, name: string, ws: WebSocket) => {
        const data: ConnectionInterface = {
            room,
            connectionId,
            displayName: name,
            joinTime: Date.now(),
            prettyJoinTime: Date.now().toString(),
            ws,
        }
        this.connections.push(data);
    }

    public setUserName = async (room: string, connectionId: string, name: string) => {
        const data = this.connections.filter((c) => { return c.room === room && c.connectionId === connectionId });
        data.forEach(d => { d.displayName = name; });
    }

    public loadExpiredConnections = async (threshold: number) => {
        return this.connections.filter((c) => { return c.joinTime <= threshold });
    }

    private storeData = (type: string, record: any) => {
        const data: any = JSON.stringify(record);
        if (type === 'chat') this.chats.push(data);
    }

    public scanRoom = (filter: string, value: any) => {
        const result: ConnectionInterface[] = [];
        this.connections.forEach((c) => {
            if ((c.connectionId === value) || (c.room === value)) result.push(c);
        });
        return result;
    }

    public deleteConnection = async (room: string, connectionId: string) => {
        this.connections = this.connections.filter(c => c.connectionId !== connectionId || c.room !== room);
    }

    private getChatRoom(room: string) {
        let result: CatchupInterface = { room, messages: [] };
        this.chats.forEach(c => { if (c.room === room) result = c; })
        return result;
    }


}