import { app } from "@arkecosystem/core-container";
import { Blockchain, Database } from "@arkecosystem/core-interfaces";

export class GRPCGenericService {
    protected readonly config = app.getConfig();
    protected readonly blockchain = app.resolvePlugin<Blockchain.IBlockchain>("blockchain");
    protected readonly databaseService = app.resolvePlugin<Database.IDatabaseService>("database");
}
