export const defaults = {
    port: 50051,
    enabled: true,
    protoFolder: "/Users/chris/_WORK/ARK/core/packages/core-grpc/protos/",
    services: [
        {
            enabled: true,
            className: "Greeter",
            package: "greeter",
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
