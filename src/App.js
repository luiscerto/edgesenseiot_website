import './App.css'
import P5Wrapper from 'react-p5-wrapper'
import React from 'react'
import sketch from './P5Sketch'

function App () {
  return <P5Wrapper sketch={sketch} />
}

export default App
