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
            enabled: true,
            className: "Greeter1",
            package: "greeter1",
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
