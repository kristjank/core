import { Crypto, Identities, Interfaces, Transactions } from "@arkecosystem/crypto";
import Boom from "@hapi/boom";
import { generateMnemonic } from "bip39";
import { IWallet } from "../interfaces";
import { database } from "./services/database";
import { network } from "./services/network";
import { decryptWIF, getBIP38Wallet } from "./utils";

export const blocks = [
    {
        name: "blocks.info",
        async method(params: { id: string }) {
            const response = await network.sendGET({ path: `blocks/${params.id}` });

            if (!response) {
                return Boom.notFound(`Block ${params.id} could not be found.`);
            }

            return response.data;
        },
        schema: {
            type: "object",
            properties: {
                id: { blockId: {} },
            },
            required: ["id"],
        },
    },
    {
        name: "blocks.latest",
        async method() {
            const response = await network.sendGET({
                path: "blocks",
                query: { orderBy: "height:desc", limit: 1 },
            });

            return response ? response.data[0] : Boom.notFound(`Latest block could not be found.`);
        },
    },
    {
        name: "blocks.transactions",
        async method(params: { id: string; offset?: number }) {
            const response = await network.sendGET({
                path: `blocks/${params.id}/transactions`,
                query: {
                    offset: params.offset,
                    orderBy: "timestamp:desc",
                },
            });

            if (!response) {
                return Boom.notFound(`Block ${params.id} could not be found.`);
            }

            return {
                count: response.meta.totalCount,
                data: response.data,
            };
        },
        schema: {
            type: "object",
            properties: {
                id: { blockId: {} },
                offset: {
                    type: "number",
                },
            },
            required: ["id"],
        },
    },
];

export const transactions = [
    {
        name: "transactions.broadcast",
        async method(params: { id: string }) {
            const transaction: Interfaces.ITransactionData = await database.get<Interfaces.ITransactionData>(params.id);

            if (!transaction) {
                return Boom.notFound(`Transaction ${params.id} could not be found.`);
            }

            const { data } = Transactions.TransactionFactory.fromData(transaction);

            if (!Transactions.Verifier.verifyHash(data)) {
                return Boom.badData();
            }

            await network.sendPOST({
                path: "transactions",
                body: { transactions: [transaction] },
            });

            return transaction;
        },
        schema: {
            type: "object",
            properties: {
                id: {
                    $ref: "transactionId",
                },
            },
            required: ["id"],
        },
    },
    {
        name: "transactions.create",
        async method(params: { recipientId: string; amount: string; vendorField?: string; passphrase: string }) {
            const transactionBuilder = Transactions.BuilderFactory.transfer()
                .recipientId(params.recipientId)
                .amount(params.amount);

            if (params.vendorField) {
                transactionBuilder.vendorField(params.vendorField);
            }

            const transaction: Interfaces.ITransactionData = transactionBuilder.sign(params.passphrase).getStruct();

            if (!Transactions.Verifier.verifyHash(transaction)) {
                return Boom.badData();
            }

            await database.set<Interfaces.ITransactionData>(transaction.id, transaction);

            return transaction;
        },
        schema: {
            type: "object",
            properties: {
                amount: {
                    type: "number",
                },
                recipientId: {
                    type: "string",
                    $ref: "address",
                },
                passphrase: {
                    type: "string",
                },
                vendorField: {
                    type: "string",
                },
            },
            required: ["amount", "recipientId", "passphrase"],
        },
    },
    {
        name: "transactions.info",
        async method(params: { id: string }) {
            const response = await network.sendGET({ path: `transactions/${params.id}` });

            if (!response) {
                return Boom.notFound(`Transaction ${params.id} could not be found.`);
            }

            return response.data;
        },
        schema: {
            type: "object",
            properties: {
                id: {
                    $ref: "transactionId",
                },
            },
            required: ["id"],
        },
    },
    {
        name: "transactions.bip38.create",
        async method(params: {
            userId: string;
            bip38: string;
            recipientId: string;
            amount: string;
            vendorField?: string;
        }) {
            try {
                const wallet: IWallet = await getBIP38Wallet(params.userId, params.bip38);

                if (!wallet) {
                    return Boom.notFound(`User ${params.userId} could not be found.`);
                }

                const transactionBuilder = Transactions.BuilderFactory.transfer()
                    .recipientId(params.recipientId)
                    .amount(params.amount);

                if (params.vendorField) {
                    transactionBuilder.vendorField(params.vendorField);
                }

                const transaction: Interfaces.ITransactionData = transactionBuilder.signWithWif(wallet.wif).getStruct();

                if (!Transactions.Verifier.verifyHash(transaction)) {
                    return Boom.badData();
                }

                await database.set<Interfaces.ITransactionData>(transaction.id, transaction);

                return transaction;
            } catch (error) {
                return Boom.badImplementation(error.message);
            }
        },
        schema: {
            type: "object",
            properties: {
                amount: {
                    type: "number",
                },
                recipientId: {
                    type: "string",
                    $ref: "address",
                },
                vendorField: {
                    type: "string",
                },
                bip38: {
                    type: "string",
                },
                userId: {
                    type: "string",
                    $ref: "hex",
                },
            },
            required: ["amount", "recipientId", "bip38", "userId"],
        },
    },
];

export const wallets = [
    {
        name: "wallets.create",
        async method(params: { passphrase: string }) {
            const { publicKey }: Interfaces.IKeyPair = Identities.Keys.fromPassphrase(params.passphrase);

            return {
                publicKey,
                address: Identities.Address.fromPublicKey(publicKey),
            };
        },
        schema: {
            type: "object",
            properties: {
                passphrase: {
                    type: "string",
                },
            },
            required: ["passphrase"],
        },
    },
    {
        name: "wallets.info",
        async method(params: { address: string }) {
            const response = await network.sendGET({ path: `wallets/${params.address}` });

            if (!response) {
                return Boom.notFound(`Wallet ${params.address} could not be found.`);
            }

            return response.data;
        },
        schema: {
            type: "object",
            properties: {
                address: {
                    type: "string",
                    $ref: "address",
                },
            },
            required: ["address"],
        },
    },
    {
        name: "wallets.transactions",
        async method(params: { offset?: number; address: string }) {
            const response = await network.sendGET({
                path: "transactions",
                query: {
                    offset: params.offset || 0,
                    orderBy: "timestamp:desc",
                    ownerId: params.address,
                },
            });

            if (!response.data || !response.data.length) {
                return Boom.notFound(`Wallet ${params.address} could not be found.`);
            }

            return {
                count: response.meta.totalCount,
                data: response.data,
            };
        },
        schema: {
            type: "object",
            properties: {
                address: {
                    type: "string",
                    $ref: "address",
                },
                offset: {
                    type: "integer",
                },
            },
            required: ["address"],
        },
    },
    {
        name: "wallets.bip38.create",
        async method(params: { userId: string; bip38: string }) {
            try {
                const { keys, wif }: IWallet = await getBIP38Wallet(params.userId, params.bip38);

                return {
                    publicKey: keys.publicKey,
                    address: Identities.Address.fromPublicKey(keys.publicKey),
                    wif,
                };
            } catch (error) {
                const { publicKey, privateKey }: Interfaces.IKeyPair = Identities.Keys.fromPassphrase(
                    generateMnemonic(),
                );

                const encryptedWIF: string = Crypto.bip38.encrypt(
                    Buffer.from(privateKey, "hex"),
                    true,
                    params.bip38 + params.userId,
                );

                await database.set<string>(
                    Crypto.HashAlgorithms.sha256(Buffer.from(params.userId)).toString("hex"),
                    encryptedWIF,
                );

                return {
                    publicKey,
                    address: Identities.Address.fromPublicKey(publicKey),
                    wif: decryptWIF(encryptedWIF, params.userId, params.bip38).wif,
                };
            }
        },
        schema: {
            type: "object",
            properties: {
                bip38: {
                    type: "string",
                },
                userId: {
                    type: "string",
                    $ref: "hex",
                },
            },
            required: ["bip38", "userId"],
        },
    },
    {
        name: "wallets.bip38.info",
        async method(params: { userId: string; bip38: string }) {
            const encryptedWIF: string = await database.get<string>(
                Crypto.HashAlgorithms.sha256(Buffer.from(params.userId)).toString("hex"),
            );

            if (!encryptedWIF) {
                return Boom.notFound(`User ${params.userId} could not be found.`);
            }

            const { keys, wif }: IWallet = decryptWIF(encryptedWIF, params.userId, params.bip38);

            return {
                publicKey: keys.publicKey,
                address: Identities.Address.fromPublicKey(keys.publicKey),
                wif,
            };
        },
        schema: {
            type: "object",
            properties: {
                bip38: {
                    type: "string",
                },
                userId: {
                    type: "string",
                    $ref: "hex",
                },
            },
            required: ["bip38", "userId"],
        },
    },
];
