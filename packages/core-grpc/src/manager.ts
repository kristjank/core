import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { Server, ServerCredentials } from "grpc";
import { Greeter } from "./services/greeter";

export class GRPCServiceManager {
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private server: Server;

    public start(options: any) {
        this.logger.info("Starting gRPC Service Manager");
        this.server = new Server();

        this.addService(new Greeter(options));

        this.server.bind("0.0.0.0:50051", ServerCredentials.createInsecure());
        this.server.start();

        this.logger.info("gRPC Server Running at http://0.0.0.0:50051");
    }

    public stop() {
        this.server.forceShutdown();
    }

    private addService(grpcService: any): void {
        this.server.addService(grpcService.getService(), grpcService);
    }
}
