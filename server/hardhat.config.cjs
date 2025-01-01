require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { WEB3_ENDPOINT, PRIVATE_KEY } = process.env;

module.exports = {
    solidity: "0.8.0",
    networks: {
        sepolia: {
            url: `${WEB3_ENDPOINT}`,
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 11155111, // Sepolia chain ID
        },
    },
};

//npx hardhat init
//npx hardhat compile
//npx hardhat run --network sepolia scripts/deploy.js