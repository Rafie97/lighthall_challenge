import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createTodo, deleteTodo } from "../graphql/mutations";
import { listTodos } from "../graphql/queries";
import DatePicker from "react-date-picker";
import Dropdown from "react-dropdown";
import "../App.css";
import { AmplifySignOut } from "@aws-amplify/ui-react";

//@auth(rules: [{ allow: owner }])

type Todo = {
  id?: string;
  name: string;
  description: string;
  dueDate: number;
  isDone: boolean;
};

const initialState = {
  name: "",
  description: "",
  isDone: false,
  dueDate: new Date().valueOf(),
};

export default function TodoPage() {
  const [formState, setFormState] = useState<Todo>(initialState);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sortBy, setSortBy] = useState<number>(0);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const sortToDos = () => {
      switch (sortBy) {
        case 0:
          return todos;
        case 1:
          return todos.sort((a, b) => {
            return a.name > b.name ? -1 : 1;
          });
        case 2:
          return todos.sort((a, b) => {
            return a.description > b.description ? -1 : 1;
          });
        case 3:
          return todos.sort((a, b) => b.dueDate - a.dueDate);

        default:
          return todos;
      }
    };

    setTodos(sortToDos);
  }, [sortBy]);

  function setInput(key: string, value: string) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      //annoying error that says GraphQLResult type has no data property which is not true
      //@ts-ignore
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function removeTodo(todo: Todo) {
    try {
      const updatedTodos = todos.filter((todoo) => todoo.name !== todo.name);
      setTodos(updatedTodos);
      console.log(todo);
      const todoDetails = { id: todo.id, _version: 1 };
      await API.graphql(graphqlOperation(deleteTodo, { input: todoDetails }));
    } catch (err) {
      console.log("error deleting todo:", err);
    }
  }

  return (
    <div className="container">
      <div
        style={{
          flexDirection: "row",
          marginBottom: 60,
        }}
      >
        <h2 style={{ display: "inline-block" }}>Todo List</h2>
        <div style={{ width: 10, display: "inline-block", marginLeft: 140 }}>
          <AmplifySignOut />
        </div>
      </div>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        className="input"
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        className="input"
        value={formState.description}
        placeholder="Description"
      />
      <div style={{ flexDirection: "row" as "row" }}>
        <input
          type="checkbox"
          onChange={(event) => setInput("isDone", event.target.value)}
          value={+formState.isDone} //convert bool to number
        />
        <p style={{ display: "inline-block", marginLeft: 5 }}>Done</p>
      </div>
      <div style={{ marginTop: 20, width: 200 }}>
        <DatePicker
          onChange={(event: any) => {
            console.log(event.valueOf());
            setInput("dueDate", event.valueOf());
          }}
          value={new Date(formState.dueDate)}
        />
      </div>

      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>

      <div style={{ marginTop: 80 }}>
        <div style={{ marginBottom: 40 }}>
          Sort by:
          <Dropdown
            options={[
              { value: "1", label: "Name" },
              { value: "2", label: "Description" },
              { value: "3", label: "Date" },
            ]}
            onChange={(event) => setSortBy(parseFloat(event.value))}
            // value={"1"}
          />
        </div>

        {todos.map((todo, index) => (
          <div
            style={{
              flexDirection: "row" as "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            key={index}
          >
            <div style={styles.todo}>
              <p className="todoName">{todo.name}</p>
              <p style={styles.todoDescription}>{todo.description}</p>
              <p style={styles.todoDescription}>
                {new Date(todo.dueDate).toDateString()}
              </p>
              <p style={styles.todoDescription}>{todo.isDone}</p>
            </div>
            <div
              style={{
                height: "100%",
                flex: 1,
                paddingLeft: 80,
                display: "inline-block",
              }}
            >
              <button
                style={{
                  width: 40,
                  height: 40,
                }}
                onClick={() => removeTodo(todo)}
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15, display: "inline-block", flex: 2 },

  todoName: { fontSize: 20, fontWeight: "bold", margin: 0 },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: 12,
    marginTop: 40,
  },
};
