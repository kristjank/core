import "jest-extended";

import "../mocks/core-container";
import { defaults } from "../mocks/p2p-options";

import { Blocks, Managers } from "@arkecosystem/crypto/src";
import delay from "delay";
import SocketCluster from "socketcluster";
import socketCluster from "socketcluster-client";
import { startSocketServer } from "../../../../packages/core-p2p/src/socket-server";
import { createPeerService } from "../../../helpers/peers";
import { TransactionFactory } from "../../../helpers/transaction-factory";
import { genesisBlock } from "../../../utils/config/unitnet/genesisBlock";
import { wallets } from "../../../utils/fixtures/unitnet/wallets";

Managers.configManager.setFromPreset("unitnet");

let server: SocketCluster;
let socket;
let emit;

const headers = {
    version: "2.1.0",
    port: "4009",
    height: 1,
    "Content-Type": "application/json",
};

beforeAll(async () => {
    process.env.CORE_ENV = "test";
    defaults.remoteAccess = []; // empty for rate limit tests

    const { service, processor } = createPeerService();

    server = await startSocketServer(service, { server: { port: 4007 } });
    await delay(1000);

    socket = socketCluster.create({
        port: 4007,
        hostname: "127.0.0.1",
    });

    emit = (event, data) =>
        new Promise((resolve, reject) => {
            socket.emit(event, data, (err, val) => (err ? reject(err) : resolve(val)));
        });

    jest.spyOn(processor, "validateAndAcceptPeer").mockImplementation(jest.fn());
});

afterAll(() => {
    socket.destroy();
    server.destroy();
});

describe("Peer socket endpoint", () => {
    describe("socket endpoints", () => {
        it("should getPeers", async () => {
            const { data } = await emit("p2p.peer.getPeers", {
                headers,
            });

            expect(data).toBeArray();
        });

        it("should getStatus", async () => {
            const { data } = await emit("p2p.peer.getStatus", {
                headers,
            });

            expect(data.state.height).toBe(1);
        });

        describe("postBlock", async () => {
            it("should postBlock successfully", async () => {
                const { data } = await emit("p2p.peer.postBlock", {
                    data: { block: Blocks.BlockFactory.fromData(genesisBlock).toJson() },
                    headers,
                });

                expect(data).toEqual({});
            });

            await delay(1000);

            it("should throw validation error when sending wrong data", async () => {
                await expect(
                    emit("p2p.peer.postBlock", {
                        data: {},
                        headers,
                    }),
                ).rejects.toHaveProperty("name", "CoreValidationError");
            });
        });

        describe("postTransactions", () => {
            it("should get back 'transaction list is not conform' error when transactions are invalid (already in cache)", async () => {
                const transactions = TransactionFactory.transfer(wallets[0].address, 111)
                    .withNetwork("unitnet")
                    .withPassphrase("one two three")
                    .create(15);

                // TODO: test makes no sense anymore
                await expect(
                    emit("p2p.peer.postTransactions", {
                        data: { transactions },
                        headers,
                    }),
                ).toResolve();
                // because our mocking makes all transactions to be invalid (already in cache)
            });

            it("should throw validation error when sending too much transactions", async () => {
                const transactions = TransactionFactory.transfer(wallets[0].address, 111)
                    .withNetwork("unitnet")
                    .withPassphrase("one two three")
                    .create(50);

                // TODO: test makes no sense anymore
                await expect(
                    emit("p2p.peer.postTransactions", {
                        data: { transactions },
                        headers,
                    }),
                ).toResolve();
            });
        });
    });

    describe("Socket errors", () => {
        it("should accept the request when below rate limit", async () => {
            await delay(1000);
            for (let i = 0; i < 2; i++) {
                const { data } = await emit("p2p.peer.getStatus", {
                    headers,
                });
                expect(data.state.height).toBeNumber();
            }
            await delay(1100);
            for (let i = 0; i < 2; i++) {
                const { data } = await emit("p2p.peer.getStatus", {
                    headers,
                });
                expect(data.state.height).toBeNumber();
            }
        });

        it("should cancel the request when exceeding rate limit", async () => {
            await delay(1000);
            for (let i = 0; i < 2; i++) {
                const { data } = await emit("p2p.peer.getStatus", {
                    headers,
                });
                expect(data.state.height).toBeNumber();
            }

            await expect(
                emit("p2p.peer.getStatus", {
                    headers,
                }),
            ).rejects.toHaveProperty("name", "CoreRateLimitExceededError");
        });

        it("should cancel the request when exceeding rate limit on a certain endpoint", async () => {
            await delay(1000);

            const block = Blocks.BlockFactory.fromData(genesisBlock).toJson();

            await emit("p2p.peer.postBlock", {
                headers,
                data: { block },
            });

            await expect(
                emit("p2p.peer.postBlock", {
                    headers,
                    data: { block },
                }),
            ).rejects.toHaveProperty("name", "CoreRateLimitExceededError");

            await expect(
                emit("p2p.peer.getStatus", {
                    headers,
                }),
            ).toResolve();

            await delay(1000);

            await expect(
                emit("p2p.peer.postBlock", {
                    headers,
                    data: { block },
                }),
            ).toResolve();
        });
    });
});
