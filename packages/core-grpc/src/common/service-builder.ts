import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { loadSync } from "@grpc/proto-loader";
import { GrpcObject, loadPackageDefinition, Server } from "grpc";

import { BaseService } from "../common";
import * as grpcServices from "../services";

/**
 * Builds instance of service classes and matches them with correct `.proto` definition files
 * Service classes only need to implement rpc services methods, matchin .proto descriptors
 */
export abstract class ServiceBuilder {
    public static buildServices(options: any, server: Server) {
        for (const service of options.services) {
            if (service.enabled) {
                const protoFilePath = `${options.protoFolder}${service.package}/${service.protoFileName}`;

                const protoDescriptor: GrpcObject = loadPackageDefinition(
                    loadSync(protoFilePath, {
                        keepCase: true,
                        longs: String,
                        enums: String,
                        defaults: true,
                        oneofs: true,
                    }));

                // we create instance of correct service implementation related to default.ts and proto specs
                const serviceObj: BaseService = new (grpcServices as any)[service.className]();

                server.addService(
                    protoDescriptor[service.package][service.className].service,
                    serviceObj,
                );
                this.logger.debug(`gRPC ServiceBuilder: Creating RPC Service Instance: ${service.className}`);
            }
        }
    }
    private static readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
}
