export const defaults = {
    protoFolder: "/Users/chris/_WORK/ARK/core/packages/core-grpc/src/protos/",
    services: [
        {
            enabled: true,
            className: "Greeter",
            package: "greeter",
            protoFileName: "service.proto",
        },
        {
            enabled: false,
            className: "Transactions",
            package: "transactions",
            protoFileName: "service.proto",
        },
        {
            enabled: false,
            className: "Blocks",
            package: "blocks",
            protoFileName: "service.proto",
        },
    ],
};
