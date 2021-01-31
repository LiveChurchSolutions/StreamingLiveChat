import WebSocket from "ws";
import { CatchupInterface } from "../Interfaces";
import { DBProviderInterface } from "./DBProviderInterface"
import { DynamoDBProvider } from "./DynamoDBProvider"
import { LocalDBProvider } from "./LocalDBProvider"

export class DBHelper {

    static provider: DBProviderInterface;

    static getProvider = () => {
        if (DBHelper.provider === undefined) DBHelper.provider = (process.env.DB_PROVIDER === "dynamo") ? new DynamoDBProvider() : new LocalDBProvider();
        return DBHelper.provider;
    }

    static deleteCatchup = (room: string) => { return DBHelper.getProvider().deleteCatchup(room); }
    static loadCatchup = async (room: string) => { return DBHelper.getProvider().loadCatchup(room); }
    static storeCatchup = async (room: string, msg: CatchupInterface) => { return DBHelper.getProvider().storeCatchup(room, msg); }
    static cleanupCatchup = async () => { return DBHelper.getProvider().cleanupCatchup(); }

    static loadRooms = async (connectionId: string) => { return DBHelper.getProvider().loadRooms(connectionId); }
    static storeConnection = async (room: string, connectionId: string, name: string, ws?: WebSocket) => { return DBHelper.getProvider().storeConnection(room, connectionId, name, ws); }
    static checkStoreConnection = async (room: string, connectionId: string) => { return DBHelper.getProvider().checkStoreConnection(room, connectionId); }
    static deleteConnection = async (room: string, connectionId: string) => { return DBHelper.getProvider().deleteConnection(room, connectionId); }
    static setUserName = async (room: string, connectionId: string, name: string) => { return DBHelper.getProvider().setUserName(room, connectionId, name); }
    static scanRoom = (filter: string, value: string) => { return DBHelper.getProvider().scanRoom(filter, value) }
    static loadExpiredConnections = async () => {
        const threshold = new Date(Date.now());
        threshold.setHours(threshold.getHours() - 6);
        return DBHelper.getProvider().loadExpiredConnections(threshold.getDate());
    };



    static loadAttendance = async (room: string) => { return DBHelper.getProvider().loadAttendance(room); }
    static getConnectionIds = async (room: string) => { return DBHelper.getProvider().getConnectionIds(room); }


}