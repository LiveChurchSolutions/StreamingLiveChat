import WebSocket from "ws";
import { ConnectionInterface, MessageInterface } from "../Interfaces";

export interface DBProviderInterface {
    deleteCatchup(room: string): Promise<any>,
    loadCatchup(room: string): Promise<MessageInterface[]>,
    storeCatchup(room: string, msg: MessageInterface): Promise<void>,
    cleanupCatchup(): Promise<any>

    loadRooms(connectionId: string): Promise<string[]>,
    storeConnection(room: string, connectionId: string, name: string, ws: WebSocket): Promise<any>,
    checkStoreConnection(room: string, connectionId: string): Promise<boolean>,
    deleteConnection(room: string, connectionId: string): Promise<any>,
    loadAttendance(room: string): Promise<string[]>,
    getConnectionIds(room: string): Promise<string[]>,
    loadExpiredConnections(threshold: number): Promise<ConnectionInterface[]>,
    setUserName(room: string, connectionId: string, name: string): Promise<any>,
    scanRoom?(filter: string, value: string): ConnectionInterface[]
}