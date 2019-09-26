Bringing Microservices with gRPC.io to ARK Core
===

**The new PoC plugin `core-grpc` enables `micro-services` inside our core and any other bridgechain. Developers can open new payment channels or develop custom APIs (pub/sub API, speech API, remote management APIs, streaming services) within our core with minimal effort.**

> To achieve this all we need to do is define a new service endpoint/call with `proto3` language and implement its service methods (business logic), and restart core.


## Motivation
In relation to improving our serde process, `protobuf protocol` testing and evaluation started.

I wanted to assess the maturity of the solution in the long run. Out of this grew a bit more -> the `core-grpc` plugin. 

`core-grpc` enables the development and execution of `micro-services` inside our core with minimal effort. This plugin enables the following service communication channels (powered by HTTP/2 and protocol buffers):


1. **Unary RPC** - single request / single response.
2. **Client streaming RPC** - stream of requests / single response
3. **Server streaming RPC** - single request / stream of responses
4. **Bidirectional streaming RPC** - stream of requests and responses

All four(4) communication approaches are supported out-of-the-box. Another major benefit for the `consumer/client` side is standard autogeneration of client code in nine(9) programming languages (read more here: https://grpc.io/docs/reference/)

You can read more about gRPC below and on the https://grpc.io. In the next section, we will present how easy it is to dynamically add new `microservices` to core.

## The Core-gRPC plugin

Core-gRPC plugin enables dynamic loading of `services`. Services are defined with `proto3` language definition.  To introduce a new `service`, we have to do the following:

1. Define our `protobuf` service and message format
2. Add meta-data about the service to plugin settings
3. Implement service methods

Let's take a look at the three steps a bit more detailed:

### 1. Define our `protobuf` service and message format

We define our new service and message details in a standard `proto3` language syntax, that also serves as IDL. A simple `Blocks` service definition in `proto3` looks like this:

```proto3=
syntax = "proto3";

package blocks;

service Blocks {
    // service specifications. This methods must be implemented in step 3
    rpc GetBlocks (BlockRequest) returns (BlockReply) {}
    rpc GetForgedBlocksAsStream (BlockRequest) returns (stream BlockReply) {}
}

syntax = "proto3";

// IDL protobuff message specifications
// The request message
message BlockRequest {
    string id = 1;
    string height = 2;
}

// The response message 
message BlockReply {
    string id = 1;
    int32 version = 2;
    int32 timestamp = 3;
    int32 height = 4;
    string reward = 5;
    string previousBlock = 6;
    string totalAmount = 7;
    string generatorPublicKey = 8;
}
```

### 2. Add meta-data about the service to plugin settings

After defining our service we need to enable it and provide some `meta` information to the plugin. Meta information used when `services` are dynamically instantiated and enabled (during plugin start). 

This is currently done in `default.ts` file of the plugin settings.

```json=
export const defaults = {
    port: 50051,
    enabled: true,
    protoFolder: "/core/packages/core-grpc/protos/",
    services: [
        {
            enabled: true,
            className: "Greeter", // must match proto definition service name
            package: "greeter", // must match proto definition package
            protoFileName: "service.proto",
        },
        {
            enabled: true,
            className: "Transactions",
            package: "transactions",
            protoFileName: "service.proto",
        },
        {
            enabled: true,
            className: "Blocks",
            package: "blocks",
            protoFileName: "service.proto",
        },
    ],
};

```

> When the plugin is started [ServiceBuilder](https://github.com/kristjank/core/blob/feat/core-grpc/packages/core-grpc/src/common/service-builder.ts#L14) picks up the configuration and loads the configured services dynamically.


```ts=
public start(options: any) {
        this.server = new Server();

        ServiceBuilder.buildServices(options, this.server);

        this.server.bind(`0.0.0.0:${options.port}`, ServerCredentials.createInsecure());
        this.server.start();

        this.logger.info(`gRPC Server Running at http://0.0.0.0:${options.port}`);
    }
```

### 3. Implement service methods

The last step is the implementation of specific service method calls, that where defined in the `.proto` file. To do this we declare a new class and implement service methods with matching descriptors related to service specification in `.proto` file (see step 1).


```ts=
export class Blocks extends BaseService {
    // matching method implementation - same definition in .proto rpc
    public async getBlocks(call: ServerUnaryCall<any>, callback: sendUnaryData<any>): Promise<void> {
        this.logger.info(`RPC Request from ${call.getPeer()} request: ${call.request.id}$`);
        const block = await this.blocksRepository.findById(call.request.id);
        this.logger.info(block);

        callback(null, { id: block.id, reward: block.reward.toFixed() });
    }
}
```

Serialization, Deserialization, RPC Server, validation, service mappings and other overhead that we usually need to deal with when implementing services is handled by `https://grpc.io` implementation and loading of surrounding classes via `reflection`. 

>The only thing for a developer is to extend `BaseService` class and implement specific service method. Thru `BaseService` class, we expose core classes and repositories. 


## gRPC grew from the way Google builds APIs
gRPC is great -- it generates API clients and server stubs in many programming languages, it is fast, easy-to-use, bandwidth-efficient and its design is combat-proven by Google. 

gRPC is an open-sourced system for making APIs that is based on the way Google builds APIs internally. Inside Google, gRPC is used to describe APIs from design through implementation and deployment. The API documentation is generated from gRPC API descriptions. gRPC includes code generators that automatically produce API clients and scaffolding that can be filled in to create API servers. Then gRPC API descriptions are used by API test systems, API proxies, and all kinds of API support systems that provide services like authentication, quotas, billing, and security.

- [gRPC uses HTTP/2 for transport.](https://medium.com/apis-and-digital-transformation/openapi-and-grpc-side-by-side-b6afb08f75ed)
- gRPC uses Protocol Buffers for data representation.

At a low level, gRPC can be thought of solely as a transport system: a protocol for making API calls over HTTP/2 with support for optional streaming. But much more commonly, gRPC is considered a methodology, and in the gRPC methodology, messages are encoded with Protocol Buffers.

Protocol Buffers is described as “a language-neutral, platform-neutral extensible mechanism for serializing structured data.” In this sense, Protocol Buffers is also a methodology. Here I use “Protocol Buffers” (capitalized) to describe the methodology and “protocol buffer” (lower case) to describe a serialization of a data structure.

Read more about gRPC Design Principles and Motivation here: https://grpc.io/blog/principles/.

## Next Steps :question: 
As mentioned above this is a PoC implementation, that already enables and adds a lot of flexibility to our `core`. Just by implementing specific service calls and defining service format with a `proto3` file we get dynamically loaded services withing core and code generation for clients in nine(9) different programming languages. 

>We can open any kind of communication channel, being it a one way or a two-way stream or a simple req/resp. Payload validation and serde is handled within gRPC. 

While gRPC is never meant to replace our awesome REST public API, it does open new doors and application/integration possibilities, especially looking at new solutions and products in our ecosystem landscape:

- payment channels
- remote node management (secure cert-based access / google credentials / custom auth scheme support supported with gRPC.io)
- wallet plugins
- fast IoT streams (mqqt, service logging)
- anything stream related (backpressure implemented by design)
- more integration possibilities with end-customers

## Reference Implementation
Reference implementation is available here:
https://github.com/ArkEcosystem/core/compare/develop...kristjank:feat/core-grpc?expand=1

This is a PoC implementation. Service methods are basic/stupid, just to prove the point and functionality. A refactor is needed and standardized structure enforced for transformers and validation/error handling (following gRPCs guidelines). Tests are also missing. 
I am sharing this to get feedback/push forward. 

For a GUI client, that loads the same `.proto` service definition you can use [Bloom gRPC](https://github.com/uw-labs/bloomrpc)

![Bloom gRPC client](https://i.imgur.com/Kga4YjA.png)


## Credits

-   [Your Name](https://github.com/ArkEcosystem)
-   [All Contributors](../../../../contributors)

## License

[MIT](LICENSE) © [ArkEcosystem](https://ark.io)
