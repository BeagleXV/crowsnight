import React, { useEffect } from 'react';
import { Button, Flex, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box, Text } from '@chakra-ui/react';
import voteOnContent from '../../api/voting';
import { useState } from 'react';
import HiveLogin from '../../api/HiveLoginModal';
import ErrorModal from './errorModal';
import * as Types from '../types'

const PostFooter: React.FC<Types.PostFooterProps> = ({ onClose, user, author, permlink, weight = 10000, userVote }) => {
  const [sliderValue, setSliderValue] = useState(10000);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Track error message
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Track modal visibility
  const [feedbackText, setFeedbackText] = useState(''); // Track feedback text
  const [voteMessage, setVoteMessage] = useState('Vote'); // Track vote button text

  const getFeedbackText = (value: number) => {
    if (value === -10000) return "Seu fraco!";
    if (value === -5000) return "Não gostei muito.";
    if (value === 0) return "Tenta outra vez!";
    if (value === 5000) return "Boa, bloder!";
    if (value === 10000) return "Você é trevoso!";
    return "";
  };

  const handleVote = async () => {
    if (!user || !user.name) {
      console.error("User not logged in or missing username");
      return;
    }
  
    try {
      await voteOnContent(user.name, permlink, author, sliderValue);
      console.log("Voting successful!");
      // handle the vote result here
      // handle the vote result here
      userVote.isVoted = true;
      userVote.percent = sliderValue;

      setVoteMessage('Você já votou');
      const feedback = getFeedbackText(sliderValue);
      setFeedbackText(feedback);
    } catch (error) {
      console.error("Voting failed:", error);
  
      // Use a type assertion to cast 'error' to the 'Error' type
      const errorMessage = (error as Error).message ;
  
      // Set the error message and open the modal
      setErrorMessage(`Error While Voting!`);
      setIsErrorModalOpen(true);
    }
  };

  useEffect(() => {
    // if the current vote is equal to slider, vote message is Already Voted
    if (userVote.isVoted && userVote.percent === sliderValue) {
      setVoteMessage('Você já votou');
    }

    if (userVote.isVoted && userVote.percent !== sliderValue) {
      setVoteMessage('Change Vote');
    }

    const feedback = getFeedbackText(sliderValue);
    setFeedbackText(feedback);
  }, [sliderValue]);
  
  // if user has already voted, set the slider
  useEffect(() => {
    // if the user has voted
    if (userVote.isVoted) {
      // set the slider to current percent
      setSliderValue(userVote.percent);
    }
    
    // update the feedback text
    const feedback = getFeedbackText(userVote.percent);
    setFeedbackText(feedback);
  }, [userVote]);

  return (
    <Flex border="1px #5e317a solid" padding="20px" justify="space-between" >
      <Button
        bg="black"
        color="#b4d701"
        borderRadius="4px"
        p={2}
        onClick={onClose}
        _hover={{ bg: 'white', color: '#b4d701' }}
        border={"1px solid #5e317a"}
      >
        Fechar
      </Button>
      <Box width="40%">
        <Text textAlign="center" color={"#b4d701"}> Sua opnião sobre esse post</Text>
        <Slider 
          min={-10000} 
          max={10000} 
          step={5000} 
          value={sliderValue} 
          onChange={(value) => setSliderValue(value)}
        >
          <SliderTrack bg="white">
            <SliderFilledTrack bg="red" />
          </SliderTrack>
          <SliderThumb boxSize={6}>
          </SliderThumb>
        </Slider>
        
        <Text color="white" mt={2} textAlign="center">
          {feedbackText}
        </Text>
      </Box>
      <Button
        bg="black"
        color="#b4d701"
        borderRadius="4px"
        border="1px solid #5e317a"
        p={2}
        onClick={handleVote}
        _hover={{ bg: 'white', color: '#b4d701' }}
        isDisabled={voteMessage === 'Você já votou'}
      >
        {voteMessage}
      </Button>
      <ErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} errorMessage={errorMessage || ''} />

    </Flex>
  );
  
}

export default PostFooter;