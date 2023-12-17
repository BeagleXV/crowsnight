import { Image, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Button, VStack, HStack, Divider, Tooltip } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import SendHiveModal from "./sendHiveModal";
import SendHBDModal from "./sendHBDmodal";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import * as dhive from "@hiveio/dhive";
// import WalletTransactions from "lib/pages/home/dao/components/hiveGnars/txHistory";
import PowerUpModal from "./powerUpModal";
import PowerDownModal from "./powerDownModal";
import DelegationModal from "./delegationModal";
import { useFetcher } from "react-router-dom";
import BuyModal from "./BuyModal3";


const dhiveClient = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface User {
  balance: string;
  hbd_balance: string;
  savings_hbd_balance: string;
  vesting_shares: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  name?: string;
  posting_json_metadata?: string;
  metadata: any;
}

// send to utils.tsx
// Create a caching object
export const cache: { conversionRate?: number, hbdPrice?: number } = {};

export function resetCache() {
  cache.conversionRate = undefined;
  cache.hbdPrice = undefined;
  console.log("Cache reset");
}
// send to utils.tsx


const styles = `
  @keyframes glow {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
`;

export async function fetchHbdPrice() {
  try {
    if (cache.hbdPrice !== undefined) {
      // Use the cached value if available
      return cache.hbdPrice;
    }
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=brl");
    const data = await response.json();
    const hbdPrice = data.hive_dollar.brl;
    // Update the cache
    cache.hbdPrice = hbdPrice;
    return hbdPrice;
  } catch (error) {
    console.error("Error fetching HBD price:", error);
    return 0;
  }
};

// send to utils.tsx
export async function fetchConversionRate() {
  try {
    if (cache.conversionRate !== undefined) {
      // Use the cached value if available
      return cache.conversionRate;
    }
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=brl");
    const data = await response.json();
    const conversionRate = data.hive.brl;
    // Update the cache
    cache.conversionRate = conversionRate;
    return conversionRate; // Return the conversion rate as a number
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    return 0;
  }
};

export default function HiveBalanceDisplay2() {
  const { user } = useAuthUser() as { user: User | null };
  const [hiveBalance, setHiveBalance] = useState<string>("0");
  const [hivePower, setHivePower] = useState<string>("0");
  const [hbdBalance, setHbdBalance] = useState<string>("0");
  const [savingsBalance, setSavingsBalance] = useState<string>("0");
  const [showModal, setShowModal] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [totalWorth, setTotalWorth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hiveMemo, setHiveMemo] = useState("");
  const [showPowerUpModal, setShowPowerUpModal] = useState(false);
  const [showPowerDownModal, setShowPowerDownModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [sendHBDmodal, setSendHBDmodal] = useState(false);
  const [ownedTotal, setOwnedTotal] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string>("https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif");
  const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState<string>("0");
  const [HPdelegatedToUser, setHPdelegatedToUser] = useState<string>("0");
  const [buyModalShow, setBuyModalShow] = useState(false);


  const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
  ) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    console.log("vestingSharesFloat", vestingSharesFloat)
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    console.log("delegatedVestingSharesFloat", delegatedVestingSharesFloat)
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    console.log("receivedVestingSharesFloat", receivedVestingSharesFloat)
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat ;
    console.log("availableVESTS", availableVESTS)

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
    const vestHive =
      (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
      parseFloat(result.result.total_vesting_shares);
    
    const DelegatedToSomeoneHivePower =
      (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
      parseFloat(result.result.total_vesting_shares);

    const delegatedToUserInUSD = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
    parseFloat(result.result.total_vesting_shares);
    const HPdelegatedToUser = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
    parseFloat(result.result.total_vesting_shares);
    return {
      hivePower: vestHive.toFixed(3), 
      DelegatedToSomeoneHivePower: DelegatedToSomeoneHivePower.toFixed(3),
      delegatedToUserInUSD: delegatedToUserInUSD.toFixed(3),
      HPdelegatedToUser: HPdelegatedToUser.toFixed(3),
    };

  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        try {
          const metadata = JSON.parse(user.posting_json_metadata || '');
          setProfileImage(metadata.profile.profile_image);
        } catch (error) {
          console.error('Error parsing JSON metadata:', error);
        }
      }
    };
    fetchProfileImage();
  }
  , [user]);


  const onStart = async function () {
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
          (parseFloat(vestingSharesData.hivePower) + parseFloat(vestingSharesData.DelegatedToSomeoneHivePower)) *
          conversionRate;
        const hbdWorth = parseFloat(user.hbd_balance.split(" ")[0]) * hbdPrice;
        const delegatedToUserInUSD = parseFloat(vestingSharesData.delegatedToUserInUSD) * conversionRate;
        const savingsWorth = parseFloat(user.savings_hbd_balance.split(" ")[0]) * hbdPrice;
        const HPdelegatedToUser = parseFloat(vestingSharesData.HPdelegatedToUser) 
        const total = hiveWorth + hivePowerWorth + hbdWorth + savingsWorth + delegatedToUserInUSD; 
        const total_Owned = Number(hiveWorth) + Number(savingsWorth) + Number(hbdWorth) + Number(hivePowerWorth) ;
        setConversionRate(conversionRate);
        setHbdBalance(user.hbd_balance);
        setHiveBalance(user.balance);
        setSavingsBalance(user.savings_hbd_balance);
        setHivePower(`${vestingSharesData.DelegatedToSomeoneHivePower} (delegated to others)  + ${vestingSharesData.hivePower} (not delegated)`);
        setTotalWorth(total);
        setIsLoading(false);
        setOwnedTotal(total_Owned);
        setDelegatedToUserInUSD(`${delegatedToUserInUSD.toFixed(3).toString()} USD worth in HP`); 
        setHPdelegatedToUser(`${HPdelegatedToUser.toFixed(3).toString()} poder trevoso emprestado para você`);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };
  
  useEffect(() => {
    onStart();
  }, [user]);
  

  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault(); // Prevent the default button click behavior
    setShowModal(true);
  };


  
  
  const handleLogoClick = (balanceType: string) => {
    console.log(`Clicked ${balanceType} logo`);
  };
  const handleOpenPowerUpModal = () => {
    setShowPowerUpModal(true);
  };
  const handleOpenPowerDownModal = () => {
    setShowPowerDownModal(true);
  };
  const handleOpenDelegationModal = () => {
    setShowDelegationModal(true);
  };
  const handleOpenSendHBDModal = () => {
    setSendHBDmodal(true);
  }
  return (
    <Box
      borderRadius="12px"
      border="2px solid #5e317a"
      padding="10px"
      maxWidth={{ base: "100%", md: "100%" }}
    >
      <VStack spacing={4} align="stretch">
        <Flex alignItems="center" justifyContent="center" padding="10px">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            {user ? (
              <Flex>
                <>
                  <Image
                    src={profileImage}
                    alt="profile avatar"
                    borderRadius="20px"
                    border="2px solid #d7a917"
                    boxSize="80px"
                  />
                  <Text fontSize="32px" padding="10px" color="#b4d701">
                    {user.name}
                  </Text>

                </>

              </Flex>
            ) : (
              <>
                <Image
                  src={DEFAULT_AVATAR_URL}
                  alt="pepito"
                  borderRadius="20px"
                  boxSize="60px"
                />
              </>
            )}
          </Box>
        </Flex>
        <Divider backgroundColor="red" />
        <VStack>
                  <Button
                    width="100%"
                    borderRadius="10px"
                    border="1px solid #5e317a"
                    justifyContent="center"
                    bg={"black"}
                    color={"#b4d701"}
                    _hover={{ bg: "grey" }}
                    onClick={handleOpenPowerUpModal}
                  >
                    🔺 Aumentar poder trevoso
                  </Button>
                  <Button
                    width="100%"
                    borderRadius="10px"
                    border="1px solid #5e317a"
                    justifyContent="center"
                    bg={"black"}
                    color={"#b4d701"}
                    _hover={{ bg: "grey" }}
                    onClick={handleOpenPowerDownModal}
                  >
                    🔻 Diminuir poder trevoso
                  </Button>
                  
                </VStack>
        {isLoading ? (
          <center>
            <Image width="60px" src="https://i.gifer.com/ZZ5H.gif" alt="loading" />
            <Text color="white">Loading...</Text>
          </center>
        ) : (
          <>
            <Flex alignItems="center" justifyContent="center">
              <VStack>

              <Text fontSize={"x-large"} color="red">
                Total de gotas de sangue: R${ownedTotal.toFixed(2)}
              </Text>
              <Text fontSize={"larger"} color="red">
                Total de gotas  de sangue na carteira: R${totalWorth.toFixed(2)}
              </Text>
              </VStack>
            </Flex>
            <Divider backgroundColor="red" />
            <HStack spacing={4} align="stretch">
              <BalanceDisplay
                label="Gotas de sangue"
                labelStyle={{ color: '#b4d701' }}
                balance={hiveBalance}
                labelTooltip="Dinheiro nativo da Crowsnight"
                balanceTooltip="Pense nas gotas de sangue como fichas especiais que você usa para interagir e participar em um lugar online, e que também têm valor em dinheiro Real."
              ></BalanceDisplay>
              <BalanceDisplay
                label="Poder trevoso"
                labelStyle={{ color: '#b4d701' }}
                balance={hivePower}
                labelTooltip="Poder Trevoso significa influência, votação e status dentro da Crowsnight."
                balanceTooltip="Poder Trevoso é como uma pontuação que mostra o quanto alguém é importante na Crowsnight, uma espécie de rede social. É uma mistura de influência e participação.
                Imagine que cada pessoa tem um tipo de pontuação de respeito na comunidade. Quanto mais Poder Trevoso você tem, mais respeitado e ouvido você é."
              />
  
            </HStack>
            <HStack spacing={4} align="stretch">
              <BalanceDisplay
                label="Bolsa de sangue trevosa"
                labelStyle={{ color: '#b4d701' }}
                balance={savingsBalance}
                labelTooltip="A bolsa de sangue trevosa funciona como uma poupança."
                balanceTooltip="Aqui você pode invenstir suas gotas de sangue trevosa na bolsa para render 20% ao ano."
              />
              <BalanceDisplay
                label="Gotas de sangue trevosa"
                labelStyle={{ color: '#b4d701' }}
                balance={hbdBalance}
                labelTooltip=" A gota de sangue trevosa utiliza um mecanismo de garantia para manter seu valor próximo ao dólar americano."
                balanceTooltip="Quando alguém deseja adquirir gota de sangue trevosa, ela pode depositar uma quantia específica de gota de sangue como garantia. Esse depósito é mantido em uma reserva e, em troca, a pessoa recebe a quantidade equivalente de gota de sangue trevosa. Se o valor da gota de sangue trevosa começar a se desviar do valor do dólar, o sistema ajusta automaticamente a quantidade de gota de sangue necessária como garantia para estabilizar o valor do gota de sangue trevosa."
                labelLink='https://giveth.io/es/project/skatehive-skateboarding-community'
  
              />
            </HStack>
            <Divider backgroundColor="red" />
            <BalanceDisplay
              label="emprestado para você"
              balance={HPdelegatedToUser}
              labelTooltip="quanto poder trevoso as pessoas estão emprestando para você"
              
              ></BalanceDisplay>
            
            <Tooltip
              bg="black"
              color="white"
              borderRadius="10px"
              border="1px dashed limegreen"
              label="Buy hive using other crypto"
            >
              <HStack
                margin="10px"
                borderRadius="10px"
                border="1px solid #5e317a"
                justifyContent="center"
                padding="10px"
              >
                <Image
                  src="https://images.ecency.com/u/hive-173115/avatar/large"
                  alt="Avatar"
                  width="20px"
                  height="20px"
                />
                <ChakraLink target="_blank" href="https://simpleswap.io/" fontSize="16px">Buy HIVE </ChakraLink>
              </HStack>
            </Tooltip>
  
            <Tooltip
              bg="black"
              color="white"
              borderRadius="10px"
              border="1px dashed limegreen"
              label="Dont! power up!"
            >
              <HStack
                margin="10px"
                borderRadius="10px"
                border="1px solid #5e317a"
                justifyContent="center"
                padding="10px"
              >
                <Image
                  src="https://images.ecency.com/u/hive-173115/avatar/large"
                  alt="Avatar"
                  width="20px"
                  height="20px"
                />
                <ChakraLink target="_blank" href="https://simpleswap.io/" fontSize="16px">Sell Hive  </ChakraLink>
              </HStack>
            </Tooltip>
            <Button
              margin="10px"
              borderRadius="10px"
              background={"purple"}
              color={"b4d701"}
              justifyContent="center"
              padding="10px"
              onClick={() => setBuyModalShow(true)}
              >
              sacar no pix
            </Button>
            <Button
              margin="10px"
              borderRadius="10px"
              background={"purple"}
              color={"b4d701"}
              justifyContent="center"
              padding="10px" onClick={handleOpenModal}>
              enviar gota de sangue
            </Button>
            <Button
              margin="10px"
              borderRadius="10px"
              background={"purple"}
              color={"b4d701"}
              justifyContent="center"
              padding="10px" onClick={handleOpenSendHBDModal}>
              enviar gota de sangue trevosa
            </Button>
            <Button
              margin="10px"
              borderRadius="10px"
              background={"purple"}
              color={"b4d701"}
              justifyContent="center"
              padding="10px"
              onClick={handleOpenDelegationModal}
            >
             emprestar poder trevoso para crowsnight
            </Button>
          </>
        )}
      </VStack>
      <SendHiveModal
        showModal={showModal}
        setShowModal={setShowModal}
        toAddress={toAddress}
        setToAddress={setToAddress}
        amount={amount}
        setAmount={setAmount}
        hiveMemo={hiveMemo} // Make sure to pass hiveMemo here
        setHiveMemo={setHiveMemo}
      />
            <SendHBDModal
        showModal={sendHBDmodal}
        setShowModal={setSendHBDmodal}  
        toAddress={toAddress}
        setToAddress={setToAddress}
        amount={amount}
        setAmount={setAmount}
        hiveMemo={hiveMemo} // Make sure to pass hiveMemo here
        setHiveMemo={setHiveMemo}
      />
      
  
      {/* <WalletTransactions wallet={user?.name || ""} /> */}
      <PowerUpModal isOpen={showPowerUpModal} onClose={() => setShowPowerUpModal(false)} user={user} />
      <PowerDownModal isOpen={showPowerDownModal} onClose={() => setShowPowerDownModal(false)} user={user} />
      <DelegationModal isOpen={showDelegationModal} onClose={() => setShowDelegationModal(false)} user={user} />
    </Box>
  );
  
};

const BalanceDisplay = ({
label,
balance,
labelTooltip,
balanceTooltip,
labelLink,
balanceLink,
labelStyle,
balanceStyle,
}: {
label: string;
balance: string;
labelTooltip?: string;
balanceTooltip?: string;
labelLink?: string;
balanceLink?: string;
labelStyle?: React.CSSProperties;
balanceStyle?: React.CSSProperties;
}) => {
return (
<Box
  borderRadius="5px"
  border="1px solid #5e317a"
  width="100%"
  padding="10px"
  textAlign="center"
>
  {labelTooltip ? (
    <Tooltip label={labelTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
      {labelLink ? (
        <ChakraLink color="white"  href={labelLink} isExternal style={labelStyle}>
          {label}
        </ChakraLink>
      ) : (
        <Text color="white" cursor="pointer" style={labelStyle}>
          {label}
        </Text>
      )}
    </Tooltip>
  ) : (
    labelLink ? (
      <ChakraLink color="white"  href={labelLink} isExternal style={labelStyle}>
        {label}
      </ChakraLink>
    ) : (
      <Text color="white" style={labelStyle}>
        {label}
      </Text>
    )
  )}
  {balanceTooltip ? (
    <Tooltip label={balanceTooltip} bg="black" color="white" borderRadius="10px" border="1px dashed limegreen">
    {balanceLink ? (
        <ChakraLink href={balanceLink} isExternal style={balanceStyle}>
          {balance || "Loading..."}
        </ChakraLink>
      ) : (
        <Text style={balanceStyle}>{balance || "PEPE"}</Text>
      )}
    </Tooltip>
  ) : (
    balanceLink ? (
      <ChakraLink href={balanceLink} isExternal style={balanceStyle}>
        {balance || "PEPE"}
      </ChakraLink>
    ) : (
      <Text style={balanceStyle}>{balance || "Loading..."}</Text>
    )
  )}

</Box>
);
};
  
  
  
