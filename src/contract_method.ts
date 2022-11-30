import { ILogger, ITransactionRequestConfig, BaseContractMethod, TYPE_GET_TRANSACTION_HASH, TYPE_GET_TRANSACTION_RECEIPT } from "@ethcontracts/core";
import { BigNumber, Contract, PopulatedTransaction, providers } from "ethers";
import { toEthersConfig } from "./utils";

export class ContractMethod extends BaseContractMethod {

    constructor(logger: ILogger, private contract_: Contract, private methodName_, private args_) {
        super(logger);
    }

    get address() {
        return this.contract_.address;
    }

    read<T>(config: ITransactionRequestConfig): Promise<T> {
        this.logger.log("sending read tx with config", config);
        return this.getMethod_(config);
    }

    private getMethod_(config: ITransactionRequestConfig = {}) {
        const method = this.contract_[this.methodName_];
        if (method == null) throw new Error(`No method ${this.methodName_} found`);
        return method(...this.args_, toEthersConfig(config));
    }

    toBigNumber(value) {
        return value ? BigNumber.from(value) : value;
    }

    write(config: ITransactionRequestConfig) {
        const promiseResult: Promise<providers.TransactionResponse> = this.getMethod_(config);

        let onTransactionHash, onTransactionHashError;
        const txHashPromise = new Promise<string>((res, rej) => {
            onTransactionHash = res;
            onTransactionHashError = rej;
        });
        let onTransactionReceipt, onTransactionReceiptError;
        const txReceiptPromise = new Promise<any>((res, rej) => {
            onTransactionReceipt = res;
            onTransactionReceiptError = rej;
        });

        promiseResult.then(response => {
            onTransactionHash(response.hash);
            setTimeout(() => {
                response.wait().then(receipt => {
                    onTransactionReceipt(receipt);
                }).catch(onTransactionReceiptError);
            }, 0);
        }).catch(onTransactionHashError);

        const getTransactionHash: TYPE_GET_TRANSACTION_HASH = () => {
            return txHashPromise;
        };
        const getTransactionReceipt: TYPE_GET_TRANSACTION_RECEIPT = <T_RECEIPT>(): Promise<T_RECEIPT> => {
            return txReceiptPromise;
        };
        return [getTransactionHash, getTransactionReceipt] as any;
    }

    encodeABI() {
        return this.contract_.interface.encodeFunctionData(this.methodName_, this.args_);
    }
}
