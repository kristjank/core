import { GrpcObject } from "grpc";
import { sendUnaryData, ServerUnaryCall } from "grpc";
import { BaseService } from "./base-service";

export class Blocks extends BaseService {
    public async getBlocks(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>) {
        this.logger.info(`RPC Request from ${call.getPeer()} request: ${call.request.id}$`);
        const block = await this.blocksRepository.findById(call.request.id);
        this.logger.info(block);

        // tslint:disable-next-line: no-null-keyword
        callback(null, { id: block.id, reward: block.reward });
    }
}
