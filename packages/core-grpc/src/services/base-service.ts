import { app } from "@arkecosystem/core-container";

import { Blockchain, Database, EventEmitter, Logger } from "@arkecosystem/core-interfaces";
import { GrpcObject, Server } from "grpc";

export abstract class BaseService {
    protected readonly server: Server;
    protected readonly grpcObjects: GrpcObject;

    protected readonly config = app.getConfig();
    protected readonly blockchain = app.resolvePlugin<Blockchain.IBlockchain>("blockchain");
    protected readonly databaseService = app.resolvePlugin<Database.IDatabaseService>("database");
    protected readonly emitter: EventEmitter.EventEmitter = app.resolvePlugin<EventEmitter.EventEmitter>("event-emitter");
    protected readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
}
