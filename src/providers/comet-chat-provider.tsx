// Initializes the CometChat SDK once on app startup.
// Wrap this around AuthProvider so CometChat is ready before any login attempt.

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cometChatService } from "@/services/comet-chat-service";

type CometChatContextValue = {
  isCometChatReady: boolean;
};

const CometChatContext = createContext<CometChatContextValue>({ isCometChatReady: false });

type CometChatProviderProps = {
  children: ReactNode;
};

export const CometChatProvider = ({ children }: CometChatProviderProps) => {
  const [isCometChatReady, setIsCometChatReady] = useState(false);

  useEffect(() => {
    cometChatService
      .init()
      .then(() => setIsCometChatReady(true))
      .catch((err) => {
        console.warn("[CometChat] Init failed:", err);
        setIsCometChatReady(false);
      });
  }, []);

  return (
    <CometChatContext.Provider value={{ isCometChatReady }}>
      {children}
    </CometChatContext.Provider>
  );
};

export const useCometChatContext = (): CometChatContextValue => {
  return useContext(CometChatContext);
};
