import { loadSync } from "@grpc/proto-loader";
import { GrpcObject, Server } from "grpc";
import { loadPackageDefinition } from "grpc";

import * as services from "../services";
import { BaseService } from "../services/base-service";

export abstract class ServiceBuilder {
    public static buildServices(options: any, server: Server) {
        const grpcObjects: GrpcObject = this.loadProtoServices(options.protoFolder, options.services);
        this.createServices(options.services, server, grpcObjects);
    }

    private static loadProtoServices(protoPath: string, services: any[]): GrpcObject {
        const protoPaths: string[] = [];
        for (const service of services) {
            if (service.enabled) {
                protoPaths.push(`${protoPath}${service.protoPackage}/${service.protoFile}`);
            }
        }

        return loadPackageDefinition(
            loadSync(protoPaths, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            }),
        );
    }

    private static createServices(services: any[], server: Server, grpcObjects: GrpcObject): void {
        for (const service of services) {
            if (service.enabled) {
                server.addService(
                    grpcObjects[service.protoPackage][service.protoName].service,
                    this.createService(service.protoName),
                );
            }
        }
    }

    private static createService(className: string, ...args: any[]): BaseService {
        return new (services as any)[className](...args);
    }
}
