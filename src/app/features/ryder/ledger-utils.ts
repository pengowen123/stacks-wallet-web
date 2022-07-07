/* eslint-disable no-console */
import { useState } from 'react';
import { LedgerError, ResponseVersion } from '@zondax/ledger-blockstack';
import ecdsaFormat from 'ecdsa-sig-formatter';
import { compare } from 'compare-versions';
import * as secp from '@noble/secp256k1';
import { sha256 } from 'sha.js';

import {
  AddressVersion,
  createMessageSignature,
  deserializeTransaction,
  SingleSigSpendingCondition,
} from '@stacks/transactions';

import { delay } from '@app/common/utils';
import { safeAwait } from '@stacks/ui';
import { LedgerTxSigningProvider } from './ledger-tx-signing.context';
import { logger } from '@shared/logger';
import { StacksApp } from './ryder-utils';
import { encryptContent, encryptECIES } from '@stacks/encryption';

function decompressSecp256k1PublicKey(publicKey: string) {
  const point = secp.Point.fromHex(publicKey);
  return secp.utils.bytesToHex(point.toRawBytes(false));
}

const stxDerivationWithAccount = `m/44'/5757'/0'/0/{account}`;

const identityDerivationWithAccount = `m/888'/0'/{account}'`;

function getAccountIndexFromDerivationPathFactory(derivationPath: string) {
  return (account: number) => derivationPath.replace('{account}', account.toString());
}

const getStxDerivationPath = getAccountIndexFromDerivationPathFactory(stxDerivationWithAccount);

const getIdentityDerivationPath = getAccountIndexFromDerivationPathFactory(
  identityDerivationWithAccount
);

async function connectLedger() {
  const transport = null; //await Transport.create();
  return new StacksApp(transport);
}

function requestPublicKeyForStxAccount(app: StacksApp) {
  return async (index: number) =>
    app.getAddressAndPubKey(
      getStxDerivationPath(index),
      // We pass mainnet as it expects something, however this is so it can return a formatted address
      // We only need the public key, and can derive the address later in any network format
      AddressVersion.MainnetSingleSig
    );
}

function requestPublicKeyForIdentityAccount(app: StacksApp) {
  return async (index: number) => app.getIdentityPubKey(getIdentityDerivationPath(index));
}

export async function getAppVersion(app: StacksApp) {
  return app.getVersion();
}

export function extractDeviceNameFromKnownTargetIds(_: string) {
  return 'Ryder';
}

interface PrepareLedgerDeviceConnectionArgs {
  setLoadingState(loadingState: boolean): void;
  onError(): void;
}
export async function prepareLedgerDeviceConnection(args: PrepareLedgerDeviceConnectionArgs) {
  const { setLoadingState, onError } = args;
  setLoadingState(true);
  console.log(onError);
  const [error, stacks] = await safeAwait(connectLedger());
  console.log({ error, stacks });
  await delay(1000);
  setLoadingState(false);

  if (error) {
    onError();
    return;
  }

  return stacks;
}

export function signLedgerTransaction(app: StacksApp) {
  return async (payload: Buffer, accountIndex: number) =>
    app.sign(stxDerivationWithAccount.replace('{account}', accountIndex.toString()), payload);
}

export function signLedgerJwtHash(app: StacksApp) {
  return async (payload: string, accountIndex: number) =>
    app.sign_jwt(
      identityDerivationWithAccount.replace('{account}', accountIndex.toString()),
      payload
    );
}

export function exportEncryptedAppPrivateKey(app: StacksApp) {
  return async (appDomain: string, encryptionPublicKey: string, accountIndex: number) => {
    const result = await app.exportAppPrivateKey(accountIndex, appDomain);
    console.log(result);

    // encrypt app private key like in makeAuthResponse of @stacks/auth
    const encryptedObj = await encryptECIES(
      encryptionPublicKey,
      Buffer.from(result.appPrivateKey),
      true
    );
    const encryptedJSON = JSON.stringify(encryptedObj);
    return Buffer.from(encryptedJSON).toString('hex');
  };
}

export function signTransactionWithSignature(transaction: string, signatureVRS: Buffer) {
  const deserialzedTx = deserializeTransaction(transaction);
  const spendingCondition = createMessageSignature(signatureVRS.toString('hex'));
  (deserialzedTx.auth.spendingCondition as SingleSigSpendingCondition).signature =
    spendingCondition;
  return deserialzedTx;
}

export interface StxAndIdentityPublicKeys {
  stxPublicKey: string;
  dataPublicKey: string;
}

interface PullKeysFromLedgerSuccess {
  status: 'success';
  publicKeys: StxAndIdentityPublicKeys[];
}

interface PullKeysFromLedgerFailure {
  status: 'failure';
  errorMessage: string;
  returnCode: number;
}

type PullKeysFromLedgerResponse = Promise<PullKeysFromLedgerSuccess | PullKeysFromLedgerFailure>;

export async function pullKeysFromLedgerDevice(stacksApp: StacksApp): PullKeysFromLedgerResponse {
  const publicKeys = [];
  const amountOfKeysToExtractFromDevice = 1;
  console.log('pull keys');
  for (let index = 0; index < amountOfKeysToExtractFromDevice; index++) {
    console.log({ index });
    const stxPublicKeyResp = await requestPublicKeyForStxAccount(stacksApp)(index);
    const dataPublicKeyResp = await requestPublicKeyForIdentityAccount(stacksApp)(index);
    console.log({ stxPublicKeyResp, dataPublicKeyResp });
    if (!stxPublicKeyResp.publicKey) return { status: 'failure', ...stxPublicKeyResp };

    if (!dataPublicKeyResp.publicKey) return { status: 'failure', ...dataPublicKeyResp };

    try {
      publicKeys.push({
        stxPublicKey: stxPublicKeyResp.publicKey.toString('hex'),
        // We return a decompressed public key, to match the behaviour of
        // @stacks/wallet-sdk. I'm not sure why we return an uncompressed key
        // typically compressed keys are used
        // dataPublicKey:
        // decompressSecp256k1PublicKey(dataPublicKeyResp.publicKey.toString('hex')),
        dataPublicKey: dataPublicKeyResp.publicKey.toString('hex'),
      });
    } catch (e) {
      console.log(e);
    }
  }
  logger.info(publicKeys);
  await delay(1000);
  return { status: 'success', publicKeys };
}

export function useLedgerResponseState() {
  return useState<LedgerTxSigningProvider['latestDeviceResponse']>(null);
}

export function isStacksLedgerAppClosed(response: ResponseVersion) {
  const anotherUnknownErrorCodeMeaningAppClosed = 28161;
  return (
    response.returnCode === LedgerError.AppDoesNotSeemToBeOpen ||
    response.returnCode === anotherUnknownErrorCodeMeaningAppClosed
  );
}

function reformatDerSignatureToJose(derSignature: Uint8Array) {
  return ecdsaFormat.derToJose(Buffer.from(derSignature), 'ES256');
}

export function addSignatureToAuthResponseJwt(authResponse: string, signature: Uint8Array) {
  try {
    const resultingSig = Buffer.from(signature)
      .slice(1)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return [authResponse, resultingSig].join('.');
  } catch (e) {
    console.log(e);
    return authResponse;
  }
}

export function getSha256HashOfJwtAuthPayload(payload: string) {
  return new sha256().update(payload).digest('hex');
}

type SemVerObject = Record<'major' | 'minor' | 'patch', number>;

function versionObjectToVersionString(version: SemVerObject) {
  return [version.major, version.minor, version.patch].join('.');
}

const ledgerStacksAppVersionFromWhichJwtAuthIsSupported = '0.22.5';

export function doesLedgerStacksAppVersionSupportJwtAuth(versionInfo: SemVerObject) {
  return (
    false &&
    compare(
      ledgerStacksAppVersionFromWhichJwtAuthIsSupported,
      versionObjectToVersionString(versionInfo),
      '>'
    )
  );
}