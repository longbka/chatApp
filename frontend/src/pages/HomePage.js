import { useEffect } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Box,
  Text,
  Container,
} from "@chakra-ui/react";
import Login from "../component/Authentication/Login";
import SignUp from "../component/Authentication/SignUp";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      navigate("/chats");
    }
  }, [navigate]);
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize={"4xl"} fontFamily="Work sans">
          Chat App
        </Text>
      </Box>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        borderRadius="lg"
        borderWidth="1px"
        color={"black"}
      >
        <Tabs variant="soft-rounded">
          <TabList>
            <Tab width={"50%"}>Login</Tab>
            <Tab width={"50%"}>Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
