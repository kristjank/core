import { app } from "@arkecosystem/core-container";
import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { EventEmitter, Logger } from "@arkecosystem/core-interfaces";

import { loadSync, PackageDefinition } from "@grpc/proto-loader";
import { GrpcObject, loadPackageDefinition, Server } from "grpc";

import { sendUnaryData, ServerUnaryCall, ServerWriteableStream } from "grpc";

import { GRPCGenericService } from "./grpc-service";

export class GreeterService extends GRPCGenericService {
    public grpcObject: GrpcObject;
    protected readonly emitter: EventEmitter.EventEmitter = app.resolvePlugin<EventEmitter.EventEmitter>(
        "event-emitter",
    );
    private packageDefinition: PackageDefinition;
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");

    constructor(readonly options, server: Server) {
        super();

        this.logger.info(options);
        this.packageDefinition = loadSync(options.protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });

        this.grpcObject = loadPackageDefinition(this.packageDefinition).greeter;
    }

    /**
     * RPC Service implementations below. Implement them based on .proto definitions
     *
     */
    public sayHello(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): void {
        // TODO: do some processing work
        const lastBlock = this.blockchain.getLastBlock().data.height;
        const networkHeight = 10;

        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "LastBlock " + lastBlock + networkHeight });
    }

    public sayHello2(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): void {
        // TODO: do some processing work
        const networkHeight = 10;

        this.logger.debug(call.request);
        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "2222 " + networkHeight });
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
