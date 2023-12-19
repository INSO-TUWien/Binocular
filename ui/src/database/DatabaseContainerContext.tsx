// ContainerContext.tsx
import { createContext, useContext } from "react";
import { offlineContainer, onlineContainer, container, OfflineContainer, OnlineContainer, Container } from './container'

export const OfflineContainerContext = createContext<OfflineContainer>(offlineContainer)

const OfflineContainerProvider = ({ children }: { children: React.ReactNode }) => {

  return (
    <OfflineContainerContext.Provider value={offlineContainer}>
      {children}
    </OfflineContainerContext.Provider>
  );
};

export const OnlineContainerContext = createContext<OnlineContainer>(onlineContainer)

const OnlineContainerProvider = ({ children }: { children: React.ReactNode }) => {

  return (
    <OnlineContainerContext.Provider value={onlineContainer}>
      {children}
    </OnlineContainerContext.Provider>
  );
};

export const useOnlineContainer = () => useContext(OnlineContainerContext);
export const useOfflineContainer = () => useContext(OfflineContainerContext);
// new
export const ContainerContext = createContext<Container>(container)

const ContainerProvider = ({ children }: { children: React.ReactNode }) => {

  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
};
export const useContainer = () => useContext(ContainerContext);
