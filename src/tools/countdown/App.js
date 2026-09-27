import {BrowserRouter, Route, Routes} from 'react-router-dom'
import CountdownTo from './CountdownTo'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/to" element={<CountdownTo path="/to"/>}/>
        <Route path="/to/:min" element={<CountdownTo path="/to"/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
