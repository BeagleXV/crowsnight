import React from 'react';
import { useEffect, useState } from 'react';
//@ts-ignore
import { usePioneer } from 'pioneer-react';
import NFTWallet from './nft/nftWallet';
import EvmBalance from './evm/evmWallet';
import HiveBalanceDisplay from './hive/hiveBalance';
import FiatBalance from './fiat/fiat';
import {
  useMediaQuery,
  Box,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import Web3 from 'web3'; // Ensure you have this imported
import * as Types from './nft/types';

const Wallet = () => {
  const { state } = usePioneer();
  const { api, app, context, assetContext, blockchainContext, pubkeyContext } = state;
  const [address, setAddress] = useState('');
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [nftList, setNftList] = useState<Types.NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('pubkeyContext: ', pubkeyContext);
    setAddress(pubkeyContext.master || pubkeyContext.pubkey);
  }, [pubkeyContext]);

  return (
    <Tabs variant="enclosed">
      <TabList>
        <Tab>Tokens</Tab>
        <Tab>NFTs</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Flex direction="column">
            <Box mb="10px">
              <HiveBalanceDisplay />
            </Box>
            <Box mb="10px">
              <EvmBalance />
            </Box>
            <Box mb="10px">
              {/* <FiatBalance /> */}
            </Box>
          </Flex>
        </TabPanel>

        <TabPanel>
          <NFTWallet nftList={nftList} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Wallet;
