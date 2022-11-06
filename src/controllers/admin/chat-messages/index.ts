import { Controller, Get, Res, Query, Param, Req, Put } from "@nestjs/common";
import { Response, Request } from "express"
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";
import { IGetChatMessages, IGetSingleChatMessage } from "src/core/dtos/chat-messages";
import { ChatMessagesServices } from "src/services/use-cases/chat-messages/chat-messages.service";

@Controller('admin/chat-messages')
export class AdminChatMessageController {

  constructor(private services: ChatMessagesServices) { }


  @isAuthenticated('strict')
  @Get('/')
  async getAllChatMessages(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      const admin = req?.user
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, read, tradeDisputeId } = query

      const payload: IGetChatMessages = {
        perpage,
        adminId: admin._id,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        userId,
        email: admin.email,
        read,
        tradeDisputeId
      }

      const response = await this.services.getAllChatMessages(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAuthenticated('strict')
  @Put('/:id')
  async readMessage(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params: FindByIdDto
  ) {
    try {

      const { id } = params
      const user = req?.user
      const payload: IGetSingleChatMessage = {
        id,
        email: user.email
      }
      const response = await this.services.readMessage(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }




}