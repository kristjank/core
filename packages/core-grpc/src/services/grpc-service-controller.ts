import { app } from "@arkecosystem/core-container";
import { Blockchain, Database, EventEmitter } from "@arkecosystem/core-interfaces";

export class GrpcServiceController {
    protected readonly config = app.getConfig();
    protected readonly blockchain = app.resolvePlugin<Blockchain.IBlockchain>("blockchain");
    protected readonly databaseService = app.resolvePlugin<Database.IDatabaseService>("database");
    protected readonly emitter: EventEmitter.EventEmitter = app.resolvePlugin<EventEmitter.EventEmitter>("event-emitter");
}
