import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { Server, ServerCredentials } from "grpc";

import { ServiceBuilder } from "./common/service-builder";

export class ServiceManager {
    private server: Server;
    private  readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");

    public start(options: any) {
        this.server = new Server();

        ServiceBuilder.buildServices(options, this.server);

        this.server.bind(`0.0.0.0:${options.port}`, ServerCredentials.createInsecure());
        this.server.start();

        this.logger.info(`gRPC Server Running at http://0.0.0.0:${options.port}`);
    }

    public stop() {
        this.server.forceShutdown();
    }
}
