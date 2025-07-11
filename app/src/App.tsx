import {
  IonApp,
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonRouterOutlet,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Switch } from "react-router-dom";
import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.scss";

import { Providers } from "./providers";
import UserToolbar from "$features/user/UserToolbar/UserToolbar";
import ToolbarContent from "$features/ToolbarContent";
// import UserToolbar from "$features/user/UserToolbar/UserToolbar";
// import MintButton from "$features/shared/MintButton";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <Providers>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="primary" />
          </IonButtons>
          <ToolbarContent />
          <IonButtons slot="end">
            <UserToolbar />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonReactRouter>
        <IonRouterOutlet>
          {/*@ts-ignore*/}
          <Route path="/" component={Home} />
        </IonRouterOutlet>
      </IonReactRouter>
    </Providers>
  </IonApp>
);

export default App;
