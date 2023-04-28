import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect } from "react";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

import { ChatState } from "../../Context/ChatProvider";
import ProfileModel from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import useDebounce from "../../customHook/useDebounce";
import { getSender } from "../../utils/chatLogics";
const SideDrawer = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const {
    user,
    setSelectedChat,
    chats,
    selectedChat,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const debouncedValue = useDebounce(search, 500);
  useEffect(() => {
    console.log("notifi", notification);
  }, [notification]);
  const handleLogOut = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
  const handleSearch = async () => {
    if (!search) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      console.log("data", data);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 2000,
        isClosable: false,
        position: "top",
      });
    }
  };
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chats", { userId }, config);
      //nếu chưa tồn tại cuộc trò chuyện này trong chats thì khi click vào người khác sẽ tạo
      //cuộc trò chuyện mới và append vào chats
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        duration: 2000,
        isClosable: false,
        position: "top",
      });
    }
  };
  useEffect(() => {
    handleSearch();
  }, [debouncedValue]);
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={"center"}
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Text fontSize="2xl" fontFamily={"Work sans"}>
          Chat App
        </Text>
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px="4">
              Search
            </Text>
          </Button>
        </Tooltip>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              ></NotificationBadge>
              <BellIcon fontSize="2xl" margin={1} />
            </MenuButton>
            <MenuList>
              {!notification.length && (
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Work sans",
                    justifyContent: "center",
                  }}
                >
                  No New Meassage
                </div>
              )}
              {notification &&
                notification.length > 0 &&
                notification.map((item) => {
                  console.log("item", item?.newMessage?.chat);
                  return (
                    <MenuItem
                      key={item.newMessage.createdAt}
                      onClick={async () => {
                        //update seenBy
                        // const config = {
                        //   headers: {
                        //     "Content-Type": "application/json",
                        //     Authorization: `Bearer ${user.token}`,
                        //   },
                        // };
                        // const data = await axios.post(
                        //   "/api/message",
                        //   {
                        //     notificationId: item._id,
                        //   },
                        //   config
                        // );
                        setSelectedChat(item?.newMessage?.chat);
                        setNotification(
                          notification.filter((n) => n.newMessage !== item.newMessage)
                        );
                      }}
                    >
                      {item?.newMessage?.chat?.isGroupChat
                        ? `New Message in ${item?.newMessage?.chat?.chatName}`
                        : `New Message from ${item?.newMessage?.sender?.name}`}
                    </MenuItem>
                  );
                })}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.avatar}
              />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider />
              <MenuItem>Setting</MenuItem>
              <MenuDivider />
              <MenuItem
                onClick={() => {
                  handleLogOut();
                }}
              >
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display={"flex"}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user, index) => {
                return (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                );
              })
            )}
            {loadingChat && <Spinner ml={"auto"} display="flex" />}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
