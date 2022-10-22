import { Injectable } from "@nestjs/common";
import { Activity } from "src/core/entities/Activity";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class ActivityFactoryService {
  create(data: OptionalQuery<Activity>) {
    const activity = new Activity();
    if (data.userId) activity.userId = data.userId;
    if (data.action) activity.action = data.action;
    if (data.image) activity.image = data.image;
    if (data.type) activity.type = data.type;
    if (data.description) activity.description = data.description;
    return activity;
  }
}
