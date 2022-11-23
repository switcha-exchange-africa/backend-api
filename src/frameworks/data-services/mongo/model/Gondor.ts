import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";


export type GondorDocument = Gondor & Document;

@Schema({
    timestamps: true
})
export class Gondor {

    @Prop()
    userId: string;

    @Prop()
    action: string;


    @Prop()
    userEmail: string;
    
    @Prop()
    app: string;

    @Prop()
    sourceIp: string;

    @Prop()
    sourceIpCountryCode: string;

    @Prop()
    state: string;

    @Prop()
    statusCode: string;

    @Prop()
    actionType: string;

    @Prop()
    platform: string;


    @Prop()
    headers: string;

    @Prop()
    originalUrl: string;

    @Prop()
    logMessage: string;

    @Prop()
    operation: string;

    @Prop()
    operationId: string;

    @Prop({ default: false })
    isAnonymous: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

const GondorSchema = SchemaFactory.createForClass(Gondor);


GondorSchema.index({
    _id: 'text',
    id: 'text',
    operationId: 'text'
},
    {
        weights: {
            _id: 5,
            id: 5,
            operationId: 5
        },
    },);

export { GondorSchema }