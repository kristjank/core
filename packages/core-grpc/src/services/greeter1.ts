import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { GrpcObject } from "grpc";
import { sendUnaryData, ServerUnaryCall, ServerWriteableStream } from "grpc";
import { BaseService } from "./base-service";

export class Greeter1 extends BaseService {
    public sayHello(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): void {
        // TODO: do some processing work
        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "g1: " + this.constructor.name });
    }

    public sayHello2(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): void {
        // TODO: do some processing work

        this.logger.debug(call.request);
        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "g1: " + this.constructor.name });
    }

    public sayHelloStreamResponse(call: ServerWriteableStream<GrpcObject>): void {
        let i: number = 10;

        this.emitter.on(ApplicationEvents.BlockForged, () => {
            call.write({ message: this.blockchain.getLastBlock().data.height });

            i--;

            if (i < 0) {
                call.end();
            }
        });
    }
}
