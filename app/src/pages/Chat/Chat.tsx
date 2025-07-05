import { IonContent } from "@ionic/react";

import ChatDisplay from "$features/chat/ChatDisplay/ChatDisplay";

import "./Chat.scss";

const ChatPage: React.FC = () => {
  return (
      <IonContent>
        <div className="page-main-container chat-main-container">
          <ChatDisplay />
      </div>
    </IonContent>
  );
};

export default ChatPage;
