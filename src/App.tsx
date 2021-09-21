import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import TodoPage from "./Pages/TodoPage";
import "./App.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
import Amplify, { Auth } from "aws-amplify";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync";

Amplify.configure(awsconfig);

function App() {
  // const client = new AWSAppSyncClient({
  //   url: awsconfig.aws_appsync_graphqlEndpoint,
  //   region: awsconfig.aws_appsync_region,
  //   auth: {
  //     type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
  //     jwtToken: async () =>
  //       (await Auth.currentSession()).getIdToken().getJwtToken(),
  //   },
  // });

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/">
            <TodoPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default withAuthenticator(App);
