import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { GrpcObject } from "grpc";
import { sendUnaryData, ServerUnaryCall, ServerWriteableStream } from "grpc";
import { BaseService } from "./base-service";

export class Blocks extends BaseService {
    public async getBlocks(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>): Promise<void> {
        this.logger.info(`RPC Request from ${call.getPeer()} request: ${call.request.id}$`);
        const block = await this.blocksRepository.findById(call.request.id);
        this.logger.info(block);

        // tslint:disable-next-line: no-null-keyword
        callback(null, { id: block.id, reward: block.reward.toFixed() });
    }

    public getForgedBlocksAsStream(call: ServerWriteableStream<GrpcObject>): void {
        let i: number = 10;

        this.emitter.on(ApplicationEvents.BlockForged, () => {
            const block = this.blockchain.getLastBlock().data;
            this.logger.info(block);
            call.write({
                id: block.id,
                version: block.version,
                timestamp: block.timestamp,
                height: block.height,
                reward: block.reward.toFixed(),
                previousBlock: block.previousBlock,
                totalAmount: block.totalAmount.toFixed(),
                generatorPublicKey: block.generatorPublicKey,
            });

            i--;

            if (i < 0) {
                call.end();
            }
        });
    }
}
