import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { sendUnaryData, ServerDuplexStream, ServerReadableStream, ServerUnaryCall, ServerWriteableStream, status } from "grpc";
import { BaseService, ServiceError } from "../common";

// tslint:disable no-null-keyword
export class Greeter extends BaseService {
    public sayHello(call: ServerUnaryCall<any>, callback: sendUnaryData<any>): void {
        this.logger.info(`sayHello: ${call.getPeer}`);

        const name: string = call.request.name;

        // tslint: no-null-keyword
        callback(null, { message: "Hello " + name + this.constructor.name });
    }

    public sayHelloStreamResponse(call: ServerWriteableStream<any>): void {
        this.logger.info(`sayHelloStreamResponse: ${call.request}; ${call.metadata.getMap()}`);

        let i: number = 10;
        this.emitter.on(ApplicationEvents.BlockForged, () => {
            call.write({ message: this.blockchain.getLastBlock().data.height });

            i--;

            if (i < 0) {
                call.end();
            }
        });
    }

    public sayHelloStreamRequest(call: ServerReadableStream<any>, callback: sendUnaryData<any>): void {
        this.logger.info("sayHelloStreamRequest:" + call.getPeer());
        let i:number = 0;

        const data: string[] = [];
        call.on('data', (request: any) => {
            data.push(`${i++}:${request.name}`);
        }).on('end', () => {

            callback(null, { message: data.join('\n') });
        }).on('error', (err: Error) => {

            callback(new ServiceError(status.INTERNAL, err.message), null);
        });

    }


    public sayHelloDuplexStream(call: ServerDuplexStream<any, any>): void {
        this.logger.info("sayHelloDuplexStream:" + call.getPeer());

        call.on('data', (request: any) => {
            call.write({ message: `${request.name} - response` });
        }).on('end', () => {
            this.logger.info("ENDING");

            call.end();
        }).on('error', (err: Error) => {
            this.logger.error("sayHelloStream: " + err);
        });
    }
}

