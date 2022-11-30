import { ITransactionRequestConfig } from "@ethcontracts/core";
import { BigNumber, providers } from "ethers";

const toBigNumber = (value) => {
    return value ? BigNumber.from(value) : value;
};

export function toEthersConfig(config: ITransactionRequestConfig = {}) {
    if (config) {
        return {
            to: config.to,
            from: config.from,
            gasPrice: toBigNumber(config.gasPrice),
            gasLimit: toBigNumber(config.gasLimit),
            value: toBigNumber(config.value),
            nonce: config.nonce,
            // chainId: config.chainId,
            data: config.data,
            type: config.type,
            maxFeePerGas: toBigNumber(config.maxFeePerGas),
            maxPriorityFeePerGas: toBigNumber(config.maxPriorityFeePerGas),

        } as providers.TransactionRequest;
    }
    return config;
}