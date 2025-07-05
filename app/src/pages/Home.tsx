import {
  IonContent,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonSplitPane,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";

import { chatbox, mapSharp } from "ionicons/icons";

import { Redirect, Route } from "react-router";
import { ToastContainer } from "react-toastify";

import MapPage from "./Map/Map";
import ChatPage from "./Chat/Chat";
// import ProjectsPage from "./Projects/Projects";
// import CommentatorPage from "./Commentator/Commentator";

// import WatchEvents from "$features/shared/WatchEvents/WatchEvents";
import { useEffect } from "react";
// import { fetchPixels } from "$features/pixels/pixel.slice";
// import { useAppDispatch } from "$store/hooks";
// import { fetchProjects } from "$features/projects/project.slice";

import "./Home.scss";
// import EndMenu from "$features/shared/EndMenu/EndMenu";
// import SmallEndMenu from "$features/shared/EndMenu/SmallEndMenu";
import { MenuProvider } from "$features/shared/EndMenu/useMenuContext";
import EndMenu from "$features/shared/EndMenu/EndMenu";

const contentId = "main-content";
const menuId = "end-menu";

const Home: React.FC = () => {
  // const dispatch = useAppDispatch();

  useEffect(() => {
    // dispatch(fetchPixels());
    // dispatch(fetchProjects());
  }, []);

  return (
    <MenuProvider>
      <IonSplitPane contentId={contentId} when="xl">
        <EndMenu contentId={contentId} menuId={menuId} />
        <IonContent fullscreen id={contentId}>
          {/* <SmallEndMenu menuId={menuId} contentId={contentId} /> */}
          <IonTabs>
            <IonRouterOutlet>
              {/*@ts-ignore*/}
              <Redirect exact path="/" to="/map" />
              {/*@ts-ignore*/}
              <Route path="/map" component={MapPage} />
              {/*@ts-ignore*/}
              <Route path="/chat" component={ChatPage} />
              {/*@ts-ignore*/}
              {/* <Route path="/projects" component={ProjectsPage} /> */}
              {/*@ts-ignore*/}
              {/* <Route path="/commentator" component={CommentatorPage} /> */}
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="map" href="/map">
                <IonIcon icon={mapSharp} />
                <IonLabel>map</IonLabel>
              </IonTabButton>
              <IonTabButton tab="chat" href="/chat">
                <IonIcon icon={chatbox} />
                <IonLabel>Chat</IonLabel>
              </IonTabButton>
              {/* <IonTabButton tab="commentator" href="/commentator">
                <IonIcon icon={accessibilitySharp} />
                <IonLabel>ai commentator</IonLabel>
              </IonTabButton> */}
            </IonTabBar>
          </IonTabs>
          <ToastContainer position="top-center" autoClose={5000} theme="dark" />

          {/* <WatchEvents /> */}
        </IonContent>
      </IonSplitPane>
    </MenuProvider>
  );
};

export default Home;
