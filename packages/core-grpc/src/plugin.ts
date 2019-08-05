import { Container, Logger } from "@arkecosystem/core-interfaces";
import { defaults } from "./defaults";
import { GRPCServiceManager } from "./manager";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "grpc",
    async register(container: Container.IContainer, options) {
        const serviceManager = new GRPCServiceManager();

        serviceManager.start(options);

        return serviceManager;
    },
    async deregister(container: Container.IContainer) {
        const grpc = container.resolvePlugin("grpc");

        if (grpc) {
            container.resolvePlugin<Logger.ILogger>("logger").info("Stopping gRPC Manager");
            return grpc.stop();
        }
    },
};
