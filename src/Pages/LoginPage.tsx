import React from "react";
import "../App.css";

// Not using this anymore in favor of the default AWS Login

const LoginPage = () => {
  const [isRegister, setIsRegister] = React.useState<boolean>(false);

  return (
    <div className="container">
      <div>
        <h2>{isRegister ? "Register" : "Login"}</h2>
      </div>
      <div className="loginContainer">
        <div className="loginBody">
          <form>
            <div className="usernameInputContainer">
              <input className="input" type="text" placeholder="Username" />
            </div>
            <div className="passwordInputContainer">
              <input className="input" type="password" placeholder="Password" />
            </div>
            <div className="submitContainer">
              <button
                style={{
                  backgroundColor: "black",
                  color: "white",
                  outline: "none",
                  fontSize: 16,
                  padding: 12,
                  marginTop: 20,
                  alignSelf: "center",
                  width: "100%",
                }}
                type="submit"
              >
                {isRegister ? "Register" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div>
        <div
          className="registerSwitch"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have an account? Login"
            : "New Account? Register"}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
