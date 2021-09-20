import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import TodoPage from "./Pages/TodoPage";
import "./App.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
import Amplify from "aws-amplify";

Amplify.configure(awsconfig);

function App() {
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
