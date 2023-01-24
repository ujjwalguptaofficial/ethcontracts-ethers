import { ILogger, ITransactionRequestConfig, BaseContractMethod } from "@ethcontracts/core";
import { Contract, providers } from "ethers";
import { toEthersConfig, toWriteResult } from "./utils";

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

    write(config: ITransactionRequestConfig) {
        const promiseResult: Promise<providers.TransactionResponse> = this.getMethod_(config);
        return toWriteResult(promiseResult);
    }

    encodeABI() {
        return this.contract_.interface.encodeFunctionData(this.methodName_, this.args_);
    }

    estimateGas(config: ITransactionRequestConfig = {}) {
        return this.contract_.estimateGas[this.methodName_](...this.args_, toEthersConfig(config)).then(result => {
            return result.toNumber();
        });
    }
}
