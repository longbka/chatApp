import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  FormControl,
  Input,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import useDebounce from "../../customHook/useDebounce";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState();
  const toast = useToast();
  const { user, chats, setChats } = ChatState();
  const debouncedValue = useDebounce(search, 500);
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
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the Search Results",
        status: "error",
        duration: 2000,
        isClosable: false,
        position: "top",
      });
    }
  };
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chats/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      setSelectedUsers([]);
      setGroupChatName("");
      toast({
        title: "Successfully create a new chat",
        status: "success",
        duration: 2000,
        isClosable: false,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to create the chat",
        status: "error",
        duration: 2000,
        isClosable: false,
        position: "top",
      });
    }
  };
  const handleDelete = (user) => {
    const newSelectedUsers = selectedUsers.filter(
      (selectedUser) => selectedUser._id !== user._id
    );
    setSelectedUsers(newSelectedUsers);
  };
  const handleAddGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added!",
        status: "warning",
        duration: 2000,
        isClosable: false,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
    console.log("selectedUsers", selectedUsers);
  };
  useEffect(() => {
    handleSearch();
  }, [debouncedValue]);
  return (
    <>
      <div onClick={onOpen}>{children}</div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily="Work sans"
            display={"flex"}
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            alignItems="center"
          >
            <FormControl>
              <Input
                value={groupChatName}
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                value={search}
                placeholder="Search User"
                mb={3}
                onChange={(e) => setSearch(e.target.value)}
              />
            </FormControl>
            <Box display={"flex"} w={"100%"} flexWrap="wrap">
              {selectedUsers.map((user) => {
                return (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleDelete(user)}
                  />
                );
              })}
            </Box>
            {loading ? (
              <div></div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button  mr={3} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
