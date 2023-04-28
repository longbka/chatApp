import { Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { ChatState } from "../Context/ChatProvider";
import ChatLoading from "./ChatLoading";
import { getSender } from "../utils/chatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
const Mychats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user, setSelectedChat, chats, selectedChat, setChats } = ChatState();
  const toast = useToast();
  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chats", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occureddddd!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems={"center"}
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth={"1px"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display={"flex"}
        w="100%"
        justifyContent={"space-between"}
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#f8f8f8"
        w="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => {
                  console.log("1",chat)
                  setSelectedChat(chat)}}
                cursor="pointer"
                bg={selectedChat === chat ? "#3882ac" : "#e8e8e8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users).name
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default Mychats;
