import { GrpcObject } from "grpc";
import { sendUnaryData, ServerUnaryCall } from "grpc";
import { BaseService } from "./base-service";

export class Transactions extends BaseService {
    public async getTransaction(call: ServerUnaryCall<GrpcObject>, callback: sendUnaryData<GrpcObject>) {
        this.logger.info(`RPC Request from ${call.getPeer()} request: ${call.request.id}$`);
        const transaction = await this.transactionsRepository.findById(call.request.id);

        // TODO: do some processing work

        // tslint:disable-next-line: no-null-keyword
        callback(null, { id: transaction.id, amount: transaction.amount });
    }
}
