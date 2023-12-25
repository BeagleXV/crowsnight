import { Flex, Tabs, TabList, Tab, TabPanels, TabPanel, useTabs,Image, VStack, Text, } from "@chakra-ui/react";

import Chat from "./chat";

import WalletTransactions from "./dao/components/hiveGnars/txHistory";

  const Home = () => {
    const { selectedIndex, ...tabProps } = useTabs({});
  
    return (
      <Flex direction="column" alignItems="center" justifyContent="center">
<WalletTransactions wallet="crowsnight"/>
<WalletTransactions wallet="beaglexv"/>
        <Chat />
      </Flex>
    );
  };
  
  export default Home;