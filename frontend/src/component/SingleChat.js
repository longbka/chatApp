import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Lottie from "react-lottie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import "./SingleChat.css";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../utils/chatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import * as animationData from "../animations/typing-animation.json";
const ENDPOINT = "http://localhost:4000";
var socket, selectedChatCompare;
function SingleChat({ fetchAgain, setFetchAgain }) {
  const { notification, setNotification } = ChatState();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const toast = useToast();
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null); // set handle Clear Timeout
  const [roomTyping, setRoomTyping] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);

      setLoading(false);
      socket.emit("join chat", selectedChat._id);
      const updateSeen = await axios.post(
        `/api/notification/update-seen`,
        {
          seenBy: user,
          chatId: selectedChat._id,
        },
        config
      );
    } catch (error) {}
  };
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        setNewMessage("");
        setMessages([...messages, data]);
        socket.emit("new message", data);
      } catch (error) {
        toast({
          title: "Error Occureddddd!",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  const typingHandler = (e) => {
    clearTimeout(typingTimeout);
    setNewMessage(e.target.value);
    //Typing "Indicator"
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        room: selectedChat._id,
        userTyping: user,
      });
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 1000;
    const handler = setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
    setTypingTimeout(handler);
  };
  const createNotification = async (newMessageRecieved) => {
    let senderId = newMessageRecieved.sender._id;
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const data = await axios.post(
        "/api/notification",
        {
          sender: newMessageRecieved.chat.isGroupChat
            ? newMessageRecieved.chat.chatName
            : getSender(user, newMessageRecieved.chat.users).name,
          receivers: JSON.stringify(
            newMessageRecieved.chat.users.filter((u) => u._id !== senderId)
          ),
          message: newMessageRecieved._id,
        },
        config
      );

      console.log("data", data);
    } catch (error) {
      toast({
        title: "Error Occureddddd!",
        description: "Failed to set notification",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const getNotifications = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    let data = await axios.get("/api/notification", config);
    setNotification(
      data.data.map((item) => {
        return {
          newMessage: item.message,
        };
      })
    );
    return data;
  };
  const onEmojiClick = (e) => {
    const sym = e.unified.split("_");
    const codeArray = [];
    sym.forEach((el) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray);
    setNewMessage((prev) => prev + emoji);
    setShowPicker(false);
  };
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);
  useEffect(() => {
    //Tạo kết nối với server
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", (info) => {
      setIsTyping(true);
      setRoomTyping(info.room);
      setUserTyping(info.userTyping);
    });
    socket.on("stop typing", () => setIsTyping(false));

    //fill thong bao

    getNotifications();
  }, []);
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        console.log("newMess", newMessageRecieved);
        if (
          !notification.find((item) => item.newMessage === newMessageRecieved)
        ) {
          setNotification([
            { newMessage: newMessageRecieved, isSeen: false },
            ...notification,
          ]);
          createNotification(newMessageRecieved);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            display={"flex"}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            fontWeight={"bold"}
            fontSize={"2xl"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users).name}
                <ProfileModal user={getSender(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir="column"
            p={3}
            w="100%"
            h="100%"
            bg="#e8e8e8"
            justifyContent={"flex-end"}
            borderRadius="lg"
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div>
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              onKeyDown={(e) => {
                sendMessage(e);
              }}
              isRequired
              mt={3}
            >
              {isTyping && roomTyping === selectedChat._id ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Tooltip
                    label={userTyping.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor={"pointer"}
                      name={userTyping.name}
                      src={userTyping.avatar}
                    />
                  </Tooltip>
                  <Lottie
                    options={defaultOptions}
                    width={30}
                    height={20}
                    style={{ marginBottom: 0, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box display="flex" gap={2} pos="relative">
                <Input
                  variant="filled"
                  bg="#e0e0e0"
                  placeholder="Enter a message ..."
                  onChange={typingHandler}
                  value={newMessage}
                />
                <FontAwesomeIcon
                  icon={faFaceSmile}
                  onClick={() => setShowPicker((val) => !val)}
                  className={"emoji-icon"}
                />
                <Box zIndex={1} pos={"fixed"} right="12" bottom={"100"}>
                  {showPicker && (
                    <Picker
                    
                      data={data}
                      onEmojiSelect={onEmojiClick}
                      navPosition={"top"}
                    />
                  )}
                </Box>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <>
          <Box
            display={"flex"}
            alignItems="center"
            justifyContent="center"
            h="100%"
          >
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
              Click on a user to start chatting
            </Text>
          </Box>
        </>
      )}
    </>
  );
}

export default SingleChat;
