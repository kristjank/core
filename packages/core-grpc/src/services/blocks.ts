import { ApplicationEvents } from "@arkecosystem/core-event-emitter";
import { sendUnaryData, ServerUnaryCall, ServerWriteableStream } from "grpc";
import { BaseService } from "../common/base-service";

// tslint:disable:no-null-keyword
export class Blocks extends BaseService {
    public async getBlocks(call: ServerUnaryCall<any>, callback: sendUnaryData<any>): Promise<void> {
        this.logger.info(`RPC Request from ${call.getPeer()} request: ${call.request.id}$`);
        const block = await this.blocksRepository.findById(call.request.id);
        this.logger.info(block);

        callback(null, { id: block.id, block });
    }

    public getForgedBlocksAsStream(call: ServerWriteableStream<any>): void {
        let i: number = 10;

        this.emitter.on(ApplicationEvents.BlockForged, () => {
            const block = this.blockchain.getLastBlock().data;
            // TODO: transformers
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
