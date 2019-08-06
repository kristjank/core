export const defaults = {
    protoFolder: "/Users/chris/_WORK/ARK/core/packages/core-grpc/src/protos/",
    services: [
        {
            enabled: false,
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
