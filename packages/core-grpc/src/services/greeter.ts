import { app } from "@arkecosystem/core-container";
import { Logger } from "@arkecosystem/core-interfaces";

import { loadSync, PackageDefinition } from "@grpc/proto-loader";
import { GrpcObject, loadPackageDefinition } from "grpc";

export class GreeterService {
    private packageDefinition: PackageDefinition;
    private grpcObject: GrpcObject;
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");

    constructor(readonly options) {
        this.logger.info(options);
        this.packageDefinition = loadSync(options.protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });

        this.grpcObject = loadPackageDefinition(this.packageDefinition).helloworld;
    }

    public sayHello(call, callback) {
        // tslint:disable-next-line: no-null-keyword
        callback(null, { message: "Hello " + call.request.name + call.request.arkecosytem });
    }

    public init(server: any) {
        server.addService(this.grpcObject.Greeter.service, { sayHello: this.sayHello });
    }
}
