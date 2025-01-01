import ethers from "ethers"
import ABI from '../ABIREMIX.json' assert { type: 'json' };



//<===============================BLOCKCHAIN INITIALISATION==============================>
const provider = new ethers.providers.JsonRpcProvider(`https://go.getblock.io/be05c6a89399427ea942756170f0cf55`)
const signer = new ethers.Wallet(`d7cafad82055aaa0a84dac1fbfdee9a41c035eabc7ab5b3ed42c00868e2c9f9d`, provider)
const contract = new ethers.Contract(`0x86a6000e5129c7cc363dbb8fc8ea9fa65aef2a00`, ABI, signer)


export default contract