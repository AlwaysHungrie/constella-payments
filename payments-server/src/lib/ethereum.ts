import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  privateKey: string;
}

export function generateWallet(): WalletInfo {
  const wallet = ethers.Wallet.createRandom();
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
} 