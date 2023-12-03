import { Flex, Tabs, TabList, Tab, TabPanels, TabPanel, useTabs,Image, VStack, Text, } from "@chakra-ui/react";
import HiveBlog from "./Feed/Feed";
import HiveVideos from "./videos/FeedVideo";
import SnapShot from "./dao/snapshot";
import Chat from "./chat";
import QFS from "../qfs";
import NewUpload from "../upload/newUpload";
import Equipe from "./equipe";
import Store from "./store";
import WalletTransactions from "./dao/components/hiveGnars/txHistory";

  const Home = () => {
    const { selectedIndex, ...tabProps } = useTabs({});
  
    return (
      <Flex direction="column" alignItems="center" justifyContent="center">
<WalletTransactions wallet="crowsnight"/>
        <Chat />
      </Flex>
    );
  };
  
  export default Home;