// import { useState } from 'react'
import hbLogo from './assets/hbLogo.png'
function App() {

  return (
    <>
      <header>
        <h1>Welcome to HealthyBites</h1>
        <p>Your go-to app for healthy and affordable pet food!</p>
        <img src={hbLogo} className="logo" alt="HealthyBites Logo" height={300} />
      </header>
    </>
  )
}

export default App
