import { sendUnaryData, ServerUnaryCall } from "grpc";
import { BaseService } from "../common/base-service";


// tslint:disable no-null-keyword
export class Transactions extends BaseService {
    public async getTransaction(call: ServerUnaryCall<any>, callback: sendUnaryData<any>) {
        this.logger.info(`RPC Request from ${call.getPeer()} request: ${call.request.id}$`);
        const transaction = await this.transactionsRepository.findById(call.request.id);

        callback(null, { id: transaction.id, amount: transaction.amount });
    }
}
