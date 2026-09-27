import React from 'react'
import './App.css'
import ProductCounter from './ProductCounter'
import ResetButton from './ResetButton'

const App = () => {
  const [resetTimestamp, setResetTimestamp] = React.useState(0)

  const handleResetClick = ()=>{
    setResetTimestamp(Date.now())
  }

  return (
    <div className="app">
      <ProductCounter label="Expresso" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Allongé" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Double" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Ristretto" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Déca" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Noisette" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Café au lait" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Cappuccino" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Viennois" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Chocolat" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Merveilles" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Rooïbos" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Fruits Rouges" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Menthe" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Darjeeling" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Earl Grey" resetTimestamp={resetTimestamp}/>
      <ProductCounter label="Thé Jasmin" resetTimestamp={resetTimestamp}/>
      <ResetButton onClick={handleResetClick}/>
    </div>
  )
}

export default App
