import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <LoginCard />
  );
}

function LoginCard(){
  return (
    <>
    <body class="h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center w-96 h-64 flex items-center">
      <p class = "mx-auto text-4xl">Login Page</p>
    </div>
    </body>
    </>
  )
}

export default App;
