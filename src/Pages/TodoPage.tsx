import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { listTodos } from "../graphql/queries";
import DatePicker from "react-date-picker";
import Dropdown from "react-dropdown";
import "../App.css";
import { AmplifySignOut } from "@aws-amplify/ui-react";
import * as mutations from "../graphql/mutations";
import * as queries from "../graphql/queries";

type Todo = {
  id?: string;
  name: string;
  description: string;
  dueDate: number;
  isDone: boolean;
  _version?: number;
  createdAt?: number;
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
    setTodos(sortTodos());
  }, [sortBy, formState]);

  function sortTodos() {
    switch (sortBy) {
      case 0:
        return todos.sort((a, b) => {
          return compare(a.name, b.name);
        });
      case 1:
        return todos.sort((a, b) => {
          return compare(a.name, b.name);
        });
      case 2:
        return todos.sort((a, b) => {
          //description
          return compare(a.description, b.description);
        });
      case 3:
        return todos.sort((a, b) => a.dueDate - b.dueDate);

      default:
        return todos.sort((a, b) => {
          return compare(a.name, b.name);
        });
    }
  }

  function compare(a: string, b: string) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  function setInput(key: string, value: string) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql({
        query: queries.listTodos,
      });
      //annoying error that says GraphQLResult type has no data property which is not true
      //@ts-ignore
      const todoos = todoData.data.listTodos.items as Todo[];

      todoos.sort((a: Todo, b: Todo) => {
        return a.name > b.name ? -1 : 1;
      });
      setTodos(todoos);
    } catch (err) {
      console.log("error fetching todos", err);
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql({
        query: mutations.createTodo,
        variables: { input: todo },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function removeTodo(todo: Todo, index: number) {
    try {
      if (todo.id) {
        const updatedTodos = todos.filter((todoo) => todoo.name !== todo.name);
        setTodos(updatedTodos);
        const todoDetails = { id: todo.id /*_version: todo._version*/ };
        await API.graphql({
          query: mutations.deleteTodo,
          variables: { input: todoDetails },
        });
      } else {
        throw new Error("No id");
      }
    } catch (err) {
      console.log("error deleting todo:", err);
    }
  }

  async function updateTodo(todo: Todo, index: number) {
    try {
      if (todo.id) {
        const done = !todo.isDone;

        const updatedTodos = todos;
        updatedTodos[index].isDone = done;
        todo.isDone = done;

        setTodos(updatedTodos);

        await API.graphql({
          query: mutations.updateTodo,
          variables: { input: todo },
        });
        fetchTodos();
      }
    } catch (err) {
      console.log("error updating todo:", err);
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
            setInput("dueDate", event.valueOf());
          }}
          value={new Date(formState.dueDate)}
        />
      </div>

      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>

      <div style={{ marginTop: 80 }}>
        {todos.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            Sort by:
            <Dropdown
              options={[
                { value: "1", label: "Name" },
                { value: "2", label: "Description" },
                { value: "3", label: "Date" },
              ]}
              onChange={(event) => setSortBy(parseFloat(event.value))}
              value={"1"}
            />
          </div>
        )}

        {todos.map((todo, index) => {
          return (
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
                <input
                  type="checkbox"
                  onChange={() => updateTodo(todo, index)}
                  checked={todo.isDone}
                />
                <p style={{ display: "inline-block", marginLeft: 5 }}>Done</p>
                <button
                  style={{
                    width: 40,
                    height: 40,
                    marginLeft: 40,
                  }}
                  onClick={() => removeTodo(todo, index)}
                >
                  X
                </button>
              </div>
            </div>
          );
        })}
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
