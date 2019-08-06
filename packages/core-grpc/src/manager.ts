import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { loadSync } from "@grpc/proto-loader";
import { GrpcObject, Server, ServerCredentials } from "grpc";
import { loadPackageDefinition } from "grpc";
import { Greeter, Greeter1 } from "./services";

export class GRPCServiceManager {
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private server: Server;
    private options: any;
    private grpcObjects: GrpcObject;

    public start(options: any) {
        this.logger.info("Starting gRPC Service Manager");
        this.options = options;
        this.loadProtoServices(options.services);

        this.server = new Server();
        // TODO: introduce factory
        // tslint:disable-next-line: no-unused-expression
        new Greeter(this.server, this.grpcObjects);
        // tslint:disable-next-line: no-unused-expression
        new Greeter1(this.server, this.grpcObjects);

        this.server.bind("0.0.0.0:50051", ServerCredentials.createInsecure());
        this.server.start();

        this.logger.info("gRPC Server Running at http://0.0.0.0:50051");
    }

    public stop() {
        this.server.forceShutdown();
    }

    private loadProtoServices(services: any[]) {
        const protoPaths: string[] = [];
        for (const service of services) {
            this.logger.info(service);
            if (service.enabled) {
                protoPaths.push(`${this.options.protoFolder}${service.protoPackage}/${service.protoFile}`);
            }
        }
        this.logger.debug(protoPaths);

        this.grpcObjects = loadPackageDefinition(
            loadSync(protoPaths, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            }),
        );
    }
}
