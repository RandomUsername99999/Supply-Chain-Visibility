import logo from './assets/images/logo.png';
import { useState } from 'react';
import './App.css';

function App() {
  return (
    <div class="flex flex-col h-screen justify-start items-center bg-gray-100">
      <div class ="w-full text-start py-4 text-amber-900 flex flex-row items-end shadow-lg">
        <img class = "w-30 h-10" src = {logo} alt='Logo'></img>
        <p class = "text-amber-950 pl-5 text-end">Enterprise Access Portal</p>
      </div>
      <LoginCard />
    </div>
  );
}

function LoginCard(){
  const [usernmae, setUsername] = useState('')
  const [password, setPassword] = useState('Password time');
  return (
    <>
     <div class="flex flex-col flex-1 items-center justify-center">
       <div class="bg-white p-3 rounded-lg shadow-lg text-center w-96 h-80 flex flex-col items-start hover:shadow-amber-950 shadow-2xl transition-all duration-500 ease-out">
         <p class = "mx-auto text-2xl text-amber-900">Secure Login</p>
         <p class = "mx-auto text-1xl text-amber-800">Role: System Administrator</p>
         <p class = "mx-0 text-1xl">Username</p>
         <PasswordInput value = {usernmae} onValueChange = {setUsername} inputType={"text"} placeholder={"Username/Email"} />
         <p class = "mx-0 text-1xl">Password</p>
         <PasswordInput value = {password} onValueChange = {setPassword} inputType={"password"} placeholder={"Password"} />
         <a className='ml-auto pb-5 text-amber-800'>Forgot Password?</a>
         <button class = "mx-auto bg-amber-900 w-full text-white h-8 rounded-sm">Secure Login</button>
         <p class = "mx-auto text-0xl text-amber-900">Authorized Use Only</p>
         <p class = "mx-auto text-1xl text-amber-800">Access is monitored and recorded</p>
       </div>
      </div>
    </>
  )
}

function PasswordInput({value, onValueChange, inputType, placeholder}){
  return (
    <>
      <input  
      name = {value}
      onChange={onValueChange}
      type={inputType}
      placeholder={placeholder}
      class = "w-full border"
      />
    </>
  )
}

export default App;
