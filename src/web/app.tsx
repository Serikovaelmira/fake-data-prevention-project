import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Signatures from "./pages/Signatures";
import Certificates from "./pages/Certificates";
import Encryption from "./pages/Encryption";
import JWT from "./pages/JWT";
import Report from "./pages/Report";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/signatures" component={Signatures} />
          <Route path="/certificates" component={Certificates} />
          <Route path="/encryption" component={Encryption} />
          <Route path="/jwt" component={JWT} />
          <Route path="/report" component={Report} />
        </Switch>
      </Layout>
    </Provider>
  );
}

export default App;
