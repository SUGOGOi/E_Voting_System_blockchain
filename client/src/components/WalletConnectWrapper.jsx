import { useMemo } from "react";

import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import {
    WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import PropTypes from "prop-types";

export const WalletConnectWrapper = ({ children }) => {
    const endpoint = clusterApiUrl("devnet");
    const wallets = useMemo(() => [], []);

    return (

        <ConnectionProvider endpoint={endpoint}>
            {/* <WalletProvider wallets={wallets} autoConnect> */}
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>

    );
};

WalletConnectWrapper.propTypes = {
    children: PropTypes.node.isRequired, // or PropTypes.element if only one React element is expected
};
