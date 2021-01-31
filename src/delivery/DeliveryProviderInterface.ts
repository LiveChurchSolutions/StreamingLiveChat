import WebSocket from "ws";
import { ChatInterface } from "../Interfaces";

export interface DeliveryProviderInterface {
    sendMessages(room: string, message: ChatInterface): Promise<void>,
    sendMessage(connectionId: string, message: ChatInterface, socket?: WebSocket): Promise<void>,
}