import { Avatar, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../utils/chatLogics";
const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor={"pointer"}
                  name={m.sender.name}
                  src={m.sender.avatar}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#3578e5" : "#e4e6eb"
                }`,
                color: `${m.sender._id === user._id ? "white" : "black"}`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginTop: `${isSameUser(messages, m, i) ? "5px" : "0px"}`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
