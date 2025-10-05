import React from 'react'
import Navbar from './component/Navbar/Navbar'
import Hero from './component/Hero/Hero'
import PatientInput from './component/PatientInput/PatientInput'
import PrevDiag from './component/PrevDiag/PrevDiag'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'

const App = () => {


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
        <Route index element={<Hero />} />
        <Route path='new' element={<PatientInput />} />
        <Route path='prev' element={<PrevDiag />} />
      </Route>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App
