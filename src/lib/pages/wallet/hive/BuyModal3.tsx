import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from 'crypto-js';
import {
  Modal,
  Button,
  Input,
  Box,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

// Importe o KeychainSDK
import { KeychainSDK } from "keychain-sdk";

interface SendHiveModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  hiveMemo: string;
  setHiveMemo: React.Dispatch<React.SetStateAction<string>>;
}


const BuyModal: React.FC<SendHiveModalProps> = ({
  showModal,
  setShowModal,
  hiveMemo,
  setHiveMemo,
}) => {
  const [nome, setNome] = useState("");
  const [amount, setAmount] = useState("");
  const [chavepix, setChavepix] = useState("");
  const [hiveToBRL, setHiveToBRL] = useState<number | null>(null);
  const keychain = new KeychainSDK(window);
  const secretKey = 'tormento666';

  useEffect(() => {
    console.log("HiveMEMO:", hiveMemo);
  }, [hiveMemo]);

  const handleTransfer = async () => {
    try {
      const parsedAmount = parseFloat(amount).toFixed(3);

      function criarHiveMemo(nome: string, chavepix: string, amount: string): string {
        const hivememo: string = `Nome: ${nome}, Chave PIX: ${chavepix}, Valor ${parseFloat(amount).toFixed(3)}`;
        setHiveMemo(hivememo);
        console.log("HiveMEMO:", hiveMemo);

        return CryptoJS.AES.encrypt(hivememo, secretKey).toString();
      }

      if (!nome || !chavepix || !amount) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      // Definir parâmetros de transferência
      const transferParams = {
        data: { 
          to: "beaglexv",
          amount: parseFloat(amount).toFixed(3),
          memo: criarHiveMemo(nome, chavepix, amount),
          enforce: false,
          currency: "HIVE",
        },
      };
      console.log(transferParams)

      // Substituir 'selectedCard' pela lógica apropriada do seu aplicativo
      const transfer = await keychain.transfer(transferParams.data);
      // console.log({ transfer });
    } catch (error) {
      console.error("Transfer error:", error);
    }

  };
  const handleConvertToBRL = async () => {
    try {
      if (!amount) {
        alert("Por favor, insira um valor em Hive para converter.");
        return;
      }

      // Fetch the current value of Hive in BRL from an API
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=brl');
      console.log(response.data.hive.brl)
      const hiveValueInBRL = response.data.hive.brl; // Replace with the actual property from the API response

      // Convert the input Hive value to BRL
      const convertedValue = parseFloat(amount) * hiveValueInBRL;
      setHiveToBRL(convertedValue);

      // Optionally, you can update the UI or perform other actions with the converted value
    } catch (error) {
      console.error("Error fetching Hive to BRL conversion:", error);
    }
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
      <ModalOverlay opacity={0.2}/>
      <ModalContent bg="black" border="3px solid #5e317a">
        <ModalCloseButton />
        <ModalBody>
          <Box border="3px solid #5e317a" padding="10px">
            <Input
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              color={'white'}
            />
            <Input
              placeholder="Chave pix"
              value={chavepix}
              onChange={(e) => setChavepix(e.target.value)}
              color={"white"}
            />
            <Input
              placeholder="Valor em gotas de sangue"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              defaultValue={amount}
              color={'white'}
            />
          </Box>
        </ModalBody>
        <ModalFooter margin={"auto"}>
          <Button colorScheme="purple" color={"#b4d701"} mr={3} onClick={handleTransfer}>
            Sacar
          </Button>
          <Button colorScheme="purple" color={"#b4d701"} onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button colorScheme="purple" color={"#b4d701"} onClick={handleConvertToBRL}>
          Converter para Real
        </Button>
        </ModalFooter>
        {hiveToBRL !== null && (
        <Box border="3px solid #5e317a" padding="10px" marginTop="10px">
          <Input
            value={`R$ ${hiveToBRL.toFixed(2)}`} // Display the converted value in the input
            isReadOnly
            color={'white'}
          />
        </Box>
      )}
    </ModalContent>
    </Modal>
  );
};

export default BuyModal;
