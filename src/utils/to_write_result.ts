import { TYPE_GET_TRANSACTION_HASH, TYPE_GET_TRANSACTION_RECEIPT, TYPE_TRANSACTION_WRITE_RESULT } from "@ethcontracts/core";
import { providers } from "ethers";

export function toWriteResult(promiseResult: Promise<providers.TransactionResponse>): TYPE_TRANSACTION_WRITE_RESULT {
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