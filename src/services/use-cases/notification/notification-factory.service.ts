import { Injectable } from "@nestjs/common";
import { Notification } from "src/core/entities/notification.entity";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class NotificationFactoryService {
  create(data: OptionalQuery<Notification>) {
    const notification = new Notification();
    if (data.message) notification.message = data.message;
    if (data.link) notification.link = data.link;
    if (data.title) notification.title = data.title;
    if (data.image) notification.image = data.image;
    if (data.video) notification.video = data.video;
    if (data.sentTo) notification.sentTo = data.sentTo;
    if (data.author) notification.author = data.author;
    if (data.github) notification.github = data.github;
    if (data.processedBy) notification.processedBy = data.processedBy;

    notification.createdAt = new Date();
    notification.updatedAt = new Date();
    return notification;
  }
}