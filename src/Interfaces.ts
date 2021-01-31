import WebSocket from "ws";


export interface PayloadInterface {
    action?: string,
    room?: string,
}
export interface MessageInterface extends PayloadInterface {
    userGuid?: string,
    name?: string,
    msg?: string,
    ts?: number,
    token?: string,
}

export interface CatchupInterface extends PayloadInterface {
    messages?: MessageInterface[],
}

interface ViewerInterface {
    displayName: string,
    count: number
}

export interface AttendanceInterface extends PayloadInterface {
    viewers?: ViewerInterface[],
    totalViewers?: number,
}
export interface SetNameInterface extends PayloadInterface {
    displayName?: string,
    userGuid?: string
}
export interface ConnectionInterface {
    room: string,
    connectionId: string,
    displayName: string,
    joinTime: number,
    prettyJoinTime: string
    ws?: WebSocket
}

export type ChatInterface = MessageInterface & CatchupInterface & AttendanceInterface & SetNameInterface;
