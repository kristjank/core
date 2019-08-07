import { Container, Logger } from "@arkecosystem/core-interfaces";
import { defaults } from "./defaults";
import { ServiceManager } from "./manager";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "grpc",
    async register(container: Container.IContainer, options) {
        if (!options.enabled) {
            container.resolvePlugin<Logger.ILogger>("logger").info("gRPC Server is disabled");

            return undefined;
        }

        const serviceManager = new ServiceManager();

        serviceManager.start(options);

        return serviceManager;
    },
    async deregister(container: Container.IContainer) {
        const grpc = container.resolvePlugin("grpc");

        if (grpc) {
            container.resolvePlugin<Logger.ILogger>("logger").info("Stopping gRPC Server");
            return grpc.stop();
        }
    },
};
