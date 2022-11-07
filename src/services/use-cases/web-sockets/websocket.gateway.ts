import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Server } from 'ws';
import { ChatMessagesServices } from '../chat-messages/chat-messages.service';
import { ICreateChatMessage } from 'src/core/dtos/chat-messages';

@WebSocketGateway({ namespace: '/p2p-chat', cors: true })
export class WebsocketServiceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatMessageService: ChatMessagesServices
  ) {
  }

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('MessageGateway');

  @SubscribeMessage('msgToServer')
  public handleMessage(_client: Socket, payload: any): Promise<WsResponse<any>> {
    return this.server.to(payload.room).emit('msgToClient', payload);
  }

  @SubscribeMessage('joinRoom')
  public joinRoom(client: Socket, room: string): void {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  public leaveRoom(client: Socket, room: string): void {
    client.leave(room);
    client.emit('leftRoom', room);
  }

  public afterInit(_server: Server): void {
    return this.logger.log('Init');
  }

  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  public async handleConnection(client: Socket): Promise<void> {
    const { isAuthenticated } = await this.chatMessageService.authenticate(client.handshake?.headers?.authorization)
    if (!isAuthenticated) {
      client.disconnect()
    }

    return this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('sendDisputeMessage')
  public async sendDisputeMessage(client: Socket, payload: ICreateChatMessage): Promise<WsResponse<any>> {
    try {
      const { isAuthenticated, user } = await this.chatMessageService.authenticate(client.handshake?.headers?.authorization)
      if (!isAuthenticated) {
        client.disconnect()
      }
      const message = await this.chatMessageService.sendMessage({
        ...payload,
        userId: user.id
      })
      console.log("OutPut Message", message)
      return this.server.to(payload.room).emit('msgToClient', message);
    } catch (error) {
      throw new WsException(error);
    }
  }



  @SubscribeMessage('sendDashboardExchangeRate')
  public async sendDashboardExchangeRate(client: Socket, room: string): Promise<WsResponse<any>> {
    try {
      const { isAuthenticated } = await this.chatMessageService.authenticate(client.handshake?.headers?.authorization)
      if (!isAuthenticated) {
        client.disconnect()
      }
      const symbols = Object.values({
        btcusdt: 'btcusdt',
        ethusdt: 'ethusdt',
        celousdt: 'celousdt',
        xrpusdt: 'xrpusdt',
        xlmusdt: 'xlmusdt',
      });
      let binanceStreams = {} as Record<string, any>;
      let output = {} as Record<string, any>;
      symbols.forEach((_symbol: string) => {
        console.log(_symbol);
        if (binanceStreams[_symbol]) binanceStreams[_symbol].close();
        binanceStreams[_symbol] = new WebSocket(`wss://stream.binance.com:9443/ws/${_symbol}@trade`);
        binanceStreams[_symbol].onmessage = (event: any) => {
          const data = JSON.parse(event.data);
          const { e, s, p, E } = data;
          output[_symbol] = { eventType: e, symbol: s, price: p, time: E };

          // if (ws) ws.send(`${JSON.stringify(output)}`);
        };
      });
      // const streams = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@ticker`)
      return this.server.to(room).emit('sendDashboardExchangeRateRoom', output);
    } catch (error) {
      throw new WsException(error);
    }
  }

}
