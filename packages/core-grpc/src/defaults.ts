export const defaults = {
    protoFolder: "/Users/chris/_WORK/ARK/core/packages/core-grpc/src/protos/",
    services: [
        {
            enabled: true,
            protoName: "Greeter",
            protoPackage: "greeter",
            protoFile: "service.proto",
        },
        {
            enabled: true,
            protoName: "Greeter1",
            protoPackage: "greeter1",
            protoFile: "service.proto",
        },
    ],
};
