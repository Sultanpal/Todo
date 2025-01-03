import { useState, Suspense, useEffect } from 'react';
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(1);
  const [userName, setUserName] = useState("Guest");
  const [fetchRecord, setFetchRecord] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setFetchRecord(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [isAuthenticated]);

  return (
    <RecoilRoot>
      <BrowserRouter>
        <div>
          <Bar isAuthenticated={isAuthenticated} a={"hello"} />
        </div>
        <div>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Enter setIsAuthenticated={setIsAuthenticated} setUserName={userName} />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserName={userName} />} />
            <Route path="/home" element={isAuthenticated ? <Home /> : <About />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        <div>
          <Footer />
        </div>
      </BrowserRouter>
    </RecoilRoot>
  );
}

function Landing() {
  const navigate = useNavigate();
  return (
    <div className='LandingPage'>
      <div><h1>Here Display an Image</h1></div>
      <div>
        <button className='loginbtn' onClick={() => navigate("/signup")}>Sign Up</button>
        <button className='loginbtn' onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  )
}

function NavigateButton({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div className='setBAR'>
      <button onClick={() => navigate("/home")} >
        Home
      </button>
      <button onClick={() => navigate("/about")}>About</button>
      <button onClick={() => navigate("/contact")}>Contact</button>
    </div>
  );
}

function Bar({ isAuthenticated }) {
  const name = "balinder"; 
  const navigate = useNavigate();
  return (
    <div className='navBar'>
      <div>Todo APP</div>
      <NavigateButton isAuthenticated={isAuthenticated} />
      <div className='navBar2'>
        <div>Hello, {name} </div>
        <button className='u cursor' onClick={() => navigate("/signup")}>SignUp/Login</button>
        <button className='u cursor' onClick={() => navigate("/")}>Log Out</button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className='footer'>Thanks for giving your love</div>
  );
}
function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, [todos]);
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/todos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTodos(data.todos); 
        } else {
          console.error("Failed to fetch todos");
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const savedToken = localStorage.getItem("token");
    const data = { title, description };

    try {
      const response = await fetch("http://localhost:8080/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`, 
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Todo Created Successfully:", responseData.todo);
      } else {
        const errorData = await response.json();
        console.error("Todo Failed Server Response:", errorData.message);
      }
    } catch (error) {
      console.error("Error during Todo Creation:", error);
    }
  };
  const handleDelete = async (todoId) => {
    const savedToken = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8080/todo/${todoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${savedToken}` },
      });

      if (response.ok) {
        console.log("response is ok");
        setTodos(todos.filter(todo => todo._id !== todoId));
      } else {
        console.log("deletion response is not ok");
        const errorData = await response.text();
        console.error("Failed to delete todo:", errorData);
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div>
      <div className='contactContainer'>
        <h2>Task Expert</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className='loginbtn'>Add</button>
        </form>
      </div>

        <h2>Your Todos</h2>
      <div className="scroll length width ">
        {todos.length === 0 ? (
          <p>No todos found!</p>
        ) : (
          todos.map((todo, index) => (
            <div key={todo._id || index} className="card1">
              <h2>{todo.title}</h2>
              <p>{todo.description}</p>
              <div>

              <button className='loginbtn' onClick={() => handleDelete(todo._id)}>Delete</button>
              <button className='loginbtn' onClick={() => handleDelete(todo._id)}>Done</button>
              </div>
            </div>
          ))
        )}
      </div>



    </div>
  );
}

function Enter({ setIsAuthenticated, setUserName }) {
  const [userfirstname, setuserfirstname] = useState('');
  const [userlastname, setuserlastname] = useState('');
  const [gmailId, setgmailId] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { userfirstname, userlastname, gmailId, password };

    try {
      const response = await fetch('http://localhost:8080/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // const userData = await response.json();
        console.log("Signup successful: PLZ login for further Process");
      } else {
        const errorData = await response.text();
        console.error("Signup failed. Server response:", errorData);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <div>
      <h2>Welcome Sir, Are You Ready to Sign Up?</h2>
      <form onSubmit={handleSubmit} className="form1">
        <input
          type="text"
          placeholder="Enter Your First Name"
          value={userfirstname}
          onChange={(e) => setuserfirstname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Your Last Name"
          value={userlastname}
          onChange={(e) => setuserlastname(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter Your Email"
          value={gmailId}
          onChange={(e) => setgmailId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Your Password"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
        />
        <button type="submit" className="loginbtn">Sign Up</button>
        <button
          type="button"
          className="u cursor"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </form>
    </div>
  );
}


function Login({ setIsAuthenticated }) {
  const [gmailId, setgmailId] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { gmailId, password };

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();

        // Save token to localStorage
        localStorage.setItem("token", userData.token);

        // Set authentication state
        setIsAuthenticated(true);

        // Navigate to the home page
        navigate('/home');
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData.message || "Unknown error");
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again.");
    }
  };

  return (
    <div>
      <div>Welcome Sir, Are You Ready to Login.</div>
      <form onSubmit={handleSubmit} className='form1'>
        <input
          type="email"
          placeholder='Enter Your Email'
          value={gmailId}
          onChange={(e) => setgmailId(e.target.value)}
        />
        <input
          type="password"
          placeholder='Enter Your Password'
          value={password}
          onChange={(e) => setpassword(e.target.value)}
        />
        <button type="submit" className='loginbtn'>Login</button>
        <button
          className='u cursor'
          type="button"
          onClick={() => navigate("/signup")}
        >
          Signup
        </button>
      </form>
    </div>
  );
}

function Contact() {
  return (
    <div className='contactContainer'>
      <div className='contactHeader'>Contact Page</div>
      <div className='formSection'>
        <form action="" className='contactForm'>
          <input type="text" placeholder='Name' />
          <input type="email" placeholder='Enter Your Email' />
          <textarea cols={50} />
          <button className='loginbtn'>send</button>
        </form>

      </div>
    </div>
  )
}
function About() {
  return (
    <div>
      <div className='contactHeader'>
        About
      </div>
      <pre>
        About Us

      </pre>
    </div>
  )
}

export default App;
