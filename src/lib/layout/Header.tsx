import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Tabs,
  TabList,
  Tab,
  TabProps,
  useBreakpointValue,
  Image,
  Avatar,
  Modal,
  Menu,
  MenuButton,
  MenuGroup,
  MenuList,
  MenuItem,
  Button,
  Select,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";
import { Link as ChakraLink  } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';


import { Link, LinkProps as RouterLinkProps } from "react-router-dom";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import HiveLogin from "lib/pages/home/api/HiveLoginModal";

import { fetchHbdPrice } from "lib/pages/wallet/hive/hiveBalance";
import { fetchConversionRate } from "lib/pages/wallet/hive/hiveBalance";

import axios from "axios";
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';
import { MdTapAndPlay } from "react-icons/md";

type LinkTabProps = TabProps & RouterLinkProps;

interface User {
  name?: string;
  avatar?: string;
  balance: string;
}


const LinkTab: React.FC<LinkTabProps> = ({ to, children, ...tabProps }) => (
  <Link to={to}>
    <Tab {...tabProps}>{children}</Tab>
  </Link>
);

const HeaderNew = () => {
  const { state } = usePioneer();

  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const flexDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "column" });
  const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";


  const { user, loginWithHive, logout, isLoggedIn } = useAuthUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [totalNetWorth, setTotalNetWorth] = useState<number | null>(0.00);
  const [ evmWallet, setEvmWallet ] = useState<string | null>(null);
  const { api, app, context, assetContext, blockchainContext, pubkeyContext, status } = state;

  const [wallet_address, setWalletAddress] = useState<string | null>(null);

  const onLoad = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {
        const currentAddress = app.wallets[0].wallet.accounts[0];
        setWalletAddress(currentAddress);
      } else {
        console.error("Some properties are undefined or null");
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  useEffect(() => {
    onLoad();
  }, [app, api, app?.wallets, status, pubkeyContext]);


  useEffect(() => {
      const fetchData = async () => {
          try {
              if (!wallet_address === null) {
                  console.error("Wallet prop is undefined or null");
                  return;
              }
              else {

                const response = await axios.get(`https://swaps.pro/api/v1/portfolio/${wallet_address}`);
                setTotalNetWorth(response.data.totalNetWorth)
              }
              } catch (error) {
                console.error('Error fetching data:', error);
              }
      };

      fetchData();
  }, [wallet_address]);



  useEffect(() => {
    setLoggedIn(isLoggedIn());
    fetchConversionRate().then((rate) => {
      setConversionRate(rate);
      // Call onStart and pass the required variables
      onStart(user, rate, loggedIn);
    });
  }, [user]);
  const handleConnectHive = () => {
    if (loggedIn) {
      logout();
    } else {
      setModalOpen(true);
    }
};

const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedValue = e.target.value;

  if (selectedValue === "profile") {
    window.location.href = "/profile"; // Navigate to profile page
  } else if (selectedValue === "logout") {
    logout();
  }
};


  const avatarUrl = user ? JSON.parse(user.posting_json_metadata).profile.profile_image : DEFAULT_AVATAR_URL;

  const [hiveBalance, setHiveBalance] = useState<string>("0");
  const [hivePowerText, setHivePowerText] = useState<string>("0");
  const [hbdBalance, setHbdBalance] = useState<string>("0");
  const [savingsBalance, setSavingsBalance] = useState<string>("0");
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [totalWorth, setTotalWorth] = useState<number>(0);



  const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
  ) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat ;


    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_dynamic_global_properties',
        params: [],
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    const availableHP =
      (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
      parseFloat(result.result.total_vesting_shares);
    const HPdelegatedToOthers =
      (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);
    return {
      availableHivePower: availableHP.toFixed(3),
      HPdelegatedToOthers: HPdelegatedToOthers.toFixed(3),
    };
  };

  const onStart = async function (user:any, conversionRate:any, loggedIn:any) {
    if (user) {
      try {
        const [conversionRate, hbdPrice, vestingSharesData] = await Promise.all([
          fetchConversionRate(),
          fetchHbdPrice(),
          convertVestingSharesToHivePower(
            user.vesting_shares,
            user.delegated_vesting_shares,
            user.received_vesting_shares
          ),
        ]);
  
        const hiveWorth = parseFloat(user.balance.split(" ")[0]) * conversionRate;
        
        const hivePowerWorth =
          (parseFloat(vestingSharesData.availableHivePower) + parseFloat(vestingSharesData.HPdelegatedToOthers)) *
          conversionRate;


        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;
        
        
        const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth;
        const total_Owned = Number(hiveWorth) + Number(savingsWorth) + Number(hbdWorth) + Number(hivePowerWorth) ;

        setConversionRate(conversionRate);
        setHbdBalance(user.hbd_balance);
        setHiveBalance(user.balance);
        setSavingsBalance(user.savings_hbd_balance);
        setHivePowerText(`${vestingSharesData.availableHivePower} + ${vestingSharesData.HPdelegatedToOthers} (delegated)`);
        setTotalWorth(total_Owned);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };
  
  useEffect(() => {
    onStart(user, conversionRate, loggedIn);
  }
  , [user]);

    

  const glow = keyframes`
    0% {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    }
    50% {
      box-shadow: 0 0 30px rgba(0, 0, 0, 2);
    }
    100% {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    }
  `;
  const enlargeOnHover = keyframes`
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.1);
    }
  `;
  const moveUpAndDown = keyframes`
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  `;

  const handleTotalClick = () => {
    alert("Total worth: " + totalWorth.toFixed(2) + " BRL");
  };

  return (
    
    <Flex as="header" direction={flexDirection}
      alignItems="center"
      justifyContent="space-between"
      p={6}
bg=""
      border="3px solid black"
      position="relative"
      borderRadius="10px"
      marginBottom="0px"
    >

      <Flex width="100%" justifyContent="space-between" alignItems="center" mb={{ base: 2, md: 0 }}>
      
  <Link to="/secret">
  <Button
    backgroundColor="black"
    border="white 1px solid"
    color="white"
    size="l"
    css={{
      animation: `${glow} 2s infinite alternate , ${moveUpAndDown} 3s infinite` ,
      "&:hover": {
        animation: `${enlargeOnHover} 0.2s forwards, ${glow} 2s infinite alternate,${moveUpAndDown} 0s infinite`,
      },
    }}
  >
    
    <Image
      src="/assets/crn4.jpg"
      alt="Dropdown Image"
      boxSize="50px" // Adjust the size as needed
      borderRadius="10px"
    />
    
  </Button>
  </Link>
  

      <Text 
        fontSize={fontSize} 
        fontWeight="medium" 
        color="#f0c33f" 
        style={{ marginTop: '2px' }}
      >
      </Text>
      {/* Dropdown button */}
      <Box>
      <ChakraLink as={RouterLink} to="/wallet">
      <Tooltip label="Carteira de gotas de sangue em R$" aria-label="Carteira">
      <Button
        backgroundColor="black"

        >
          <Text fontSize={"x-large"} color="#FF0500" style={{ marginLeft: '5px' }}>R$</Text>
          <Text fontSize={"x-large"} style={{ marginLeft: '5px' }} color = '#B92000'>{totalWorth.toFixed(2)}</Text>
          </Button>
          </Tooltip>
    </ChakraLink>
      </Box>
    
      </Flex>
      <Tabs
        variant="unstyled" //solid-rounded
        colorScheme="blackAlpha" //blackAlpha
        position={{ base: "relative", md: "absolute" }}
        left="50%"
        bottom={0}
        transform="translateX(-50%)"
        size={tabSize}
        mb={6}
        css={{
          border: "5px solid black",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <TabList display="flex" alignItems="center">
          <LinkTab to="/" color="#b4d701" _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }}>Home</LinkTab>
          <LinkTab to="/QFS" color="#b4d701" _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }} >Game</LinkTab>

          {loggedIn && <LinkTab to="/wallet" color="#b4d701" _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }}>Carteira</LinkTab>} {/* Conditionally render Wallet tab */}
          {loggedIn ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={avatarUrl} 
                borderRadius={"10%"}
                size="sm" 
                mr={2} 
                w="24px"
                h="24px"
              />
              <Select 
                value="" 
                onChange={handleSelectChange}
                style={{
                  backgroundColor: '',//escolher cor
                  color:"#b4d701",
                  border: "black"

                }}
              >
                <option 
                  value=""
                  disabled
                  style={{backgroundColor: 'black', color: 'white' ,}}
                  >
                  {user?.name}
                </option>
                <option
                  style={{backgroundColor: 'black', color: 'white' }}
                  value="profile"
                  >
                  Profile
                  </option>
                <option  
                  value="logout"
                  style={{backgroundColor: 'black', color: 'white' }}
                  >Log out
                </option>
              </Select>
            </div>
          ) : (
            <Tab onClick={() => setModalOpen(true)} color={"#b4d701"} _selected={{ backgroundColor: "#0D0D0D", border:"3px #5E317A solid" }} >
              Log in 
            </Tab>
            
          )}
        </TabList>
      </Tabs>
      

      {/* Hive Login Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <HiveLogin isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Modal>   
      
   </Flex>
  );
};

export default HeaderNew;