import logo from './assets/images/logo.png';
import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminTemplate from './AdminTemplate';
import './App.css';

function App() {
  return (
    
      <Routes>
        <Route path='/' element={
          <div className="flex flex-col h-screen justify-start items-center bg-gray-100">
            <div className="w-full text-start py-4 text-amber-900 flex flex-row items-end shadow-lg">
              <img className="w-30 h-10" src={logo} alt='Logo'></img>
              <p className="text-amber-950 pl-5 text-end">Enterprise Access Portal</p>
            </div>
            <LoginCard />
          </div>
          } />
        <Route path='/admin' element={<AdminTemplate />} />
      </Routes>
  );
}

function LoginCard(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function onSubmit(){
    // TODO: validate credentials here
    navigate('/admin');
  }

  return (
    <>
     <div className="flex flex-col flex-1 items-center justify-center">
       <div className="bg-white p-3 rounded-lg shadow-lg text-center w-96 h-80 flex flex-col items-start hover:shadow-amber-950;shadow-2xl transition-all duration-500 ease-out">
         <p className="mx-auto text-2xl text-amber-900">Secure Login</p>
         <p className="mx-auto text-1xl text-amber-800">Role: System Administrator</p>
         <p className="mx-0 text-1xl">Username</p>
         <Input value={username} onValueChange={setUsername} inputType="text" placeholder="Username/Email" />
         <p className="mx-0 text-1xl">Password</p>
         <Input value={password} onValueChange={setPassword} inputType="password" placeholder="Password" />
         <a className='ml-auto pb-5 text-amber-800'>Forgot Password?</a>
         <button 
         className="mx-auto bg-amber-900 w-full text-white h-8 rounded-sm"
         onClick={onSubmit}
         >Secure Login</button>
         <p class = "mx-auto text-0xl text-amber-900">Authorized Use Only</p>
         <p class = "mx-auto text-1xl text-amber-800">Access is monitored and recorded</p>
       </div>
      </div>
    </>
  )
}

function Input({value, onValueChange, inputType, placeholder}){
  return (
    <>
      <input
      value={value}
      onChange={e => onValueChange(e.target.value)}
      type={inputType}
      placeholder={placeholder}
      className="w-full border"
      />
    </>
  )
}

export default App;
