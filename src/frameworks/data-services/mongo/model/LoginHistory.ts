import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export type LoginHistoryDocument = LoginHistory & Document;

@Schema({
    timestamps: true
})
export class LoginHistory {


    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    userId: string;

    @Prop()
    ip: string;

    @Prop()
    platform: string;

    @Prop()
    browser: string

    @Prop()
    type:string

    @Prop({ type: Object })
    location: Object;

    @Prop()
    country: string

    @Prop()
    countryCode: string

    @Prop()
    region: string

    @Prop()
    regionName: string

    @Prop()
    city:string

    @Prop()
    lat:string

    @Prop()
    lon:string

    @Prop()
    timezone:string

    @Prop({ type: Object })
    headers: Object

    @Prop()
    userAgent: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    loggedOutDate: Date;

    @Prop()
    durationTimeInSec: string;

    @Prop()
    durationTimeInMin: string;

}

const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
export { LoginHistorySchema }


// headers
// Object
// connection
// "upgrade"
// host
// "prod-api.switcha.africa"
// sec-ch-ua
// "".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103""
// authorization
// "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MzU0MmI2MDNmY2…"
// content-type
// "application/json"
// sec-ch-ua-mobile
// "?0"
// user-agent
// "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)…"
// sec-ch-ua-platform
// ""Linux""
// accept
// "*/*"
// origin
// "https://exchange.switcha.africa"
// sec-fetch-site
// "same-site"
// sec-fetch-mode
// "cors"
// sec-fetch-dest
// "empty"
// referer
// "https://exchange.switcha.africa/"
// accept-encoding
// "gzip, deflate, br"
// accept-language
// "en-GB,en-US;q=0.9,en;q=0.8"