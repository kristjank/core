import { app } from "@arkecosystem/core-container";
import { createServer, mountServer, plugins } from "@arkecosystem/core-http-utils";
import { Logger } from "@arkecosystem/core-interfaces";
import { IRequestParameters } from "../interfaces";
import * as modules from "./modules";
import { Processor } from "./services/processor";

export const startServer = async options => {
    if (options.allowRemote) {
        app.resolvePlugin<Logger.ILogger>("logger").warn(
            "JSON-RPC server allows remote connections, this is a potential security risk",
        );
    }

    const server = await createServer({
        host: options.host,
        port: options.port,
    });

    // @ts-ignore
    server.app.schemas = {};

    if (!options.allowRemote) {
        await server.register({
            plugin: plugins.whitelist,
            options: {
                whitelist: options.whitelist,
            },
        });
    }

    for (const module of Object.values(modules)) {
        for (const method of Object.values(module)) {
            // @ts-ignore
            server.app.schemas[method.name] = method.schema;

            delete method.schema;

            server.method(method);
        }
    }

    server.route({
        method: "POST",
        path: "/",
        async handler(request) {
            const processor = new Processor();

            return Array.isArray(request.payload)
                ? processor.collection(request.server, request.payload as IRequestParameters[])
                : processor.resource(request.server, request.payload as IRequestParameters);
        },
    });

    return mountServer("JSON-RPC", server);
};
