/* tslint:disable:max-line-length */
import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { Server, ServerCredentials } from "grpc";
import { GreeterService } from "./services/greeter";

export class ServiceManager {
    private greeterService: GreeterService;
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");

    public start(options) {
        this.logger.info("Starting gRPC Service Manager");
        this.greeterService = new GreeterService(options);

        const server = new Server();
        this.greeterService.init(server);

        server.bind("0.0.0.0:50051", ServerCredentials.createInsecure());
        server.start();
    }

    public stop() {
        //
    }
}
