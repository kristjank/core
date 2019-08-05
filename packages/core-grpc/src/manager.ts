import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { Server, ServerCredentials } from "grpc";
import { GreeterService } from "./services/greeter";

export class GRPCServiceManager {
    private greeterService: GreeterService;
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");

    public start(options: any) {
        this.logger.info("Starting gRPC Service Manager");

        const server = new Server();

        this.greeterService = new GreeterService(options, server);

        this.logger.info(this.greeterService.grpcObject.Greeter);

        server.addService(this.greeterService.grpcObject.Greeter.service, this.greeterService);

        server.bind("0.0.0.0:50051", ServerCredentials.createInsecure());
        server.start();
        this.logger.info("gRPC Server Running at http://0.0.0.0:50051");
    }

    public stop() {
        //
    }
}
