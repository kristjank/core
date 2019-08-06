import { app } from "@arkecosystem/core-container";
import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { Logger } from "@arkecosystem/core-interfaces";

import { GrpcObject, Server } from "grpc";

import { sendUnaryData, ServerUnaryCall, ServerWriteableStream } from "grpc";

import { GrpcServiceController } from "./grpc-service-controller";

export class Greeter1 extends GrpcServiceController {
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");

    constructor(server: Server, grpcObj: GrpcObject) {
        super();

        server.addService(grpcObj.greeter1.Greeter1.service, this);
    }

    /**
     * RPC Service implementations below. Implement them based on .proto definitions
     *
     */
    public sayHello(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): void {
        // TODO: do some processing work
        const lastBlock = this.blockchain.getLastBlock().data.height;
        const networkHeight = this.blockchain.state.getLastHeight().toFixed;

        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "g1LastBlock " + lastBlock + "==" + networkHeight });
    }

    public sayHello2(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): void {
        // TODO: do some processing work
        const networkHeight = 10;

        this.logger.debug(call.request);
        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "g1 " + networkHeight });
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
