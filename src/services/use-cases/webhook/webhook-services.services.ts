import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express"

Injectable()
export class WebhookServices {
  constructor(

  ) { }

  async tatum(req: Request) {
    try {
      const body = req.body
      Logger.log("---- webhook data- ---")
      Logger.log(body)
      Logger.log("---- webhook data- ---")

      return { message: "Webhook received successfully", status: 200, body }
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  async incomingTransactions(payload: Record<string, any>) {
    try {
      const { } = payload
      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  async incomingPendingTransactions(payload: Record<string, any>) {
    try {
      const { } = payload
      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }
}


