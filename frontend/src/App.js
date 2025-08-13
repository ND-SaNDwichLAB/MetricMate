import './App.css';
import CustomeAppBar from './components/CustomeAppBar/CustomeAppBar.component';
import { Stack } from '@mui/material';
import modules from "./routing_modules"
import { Routes , Route } from 'react-router-dom';


function App() {
  return (
    <div className="App" style={{maxHeight:"100%", overflowY:"hidden !important"}}>
      <CustomeAppBar  />
      <Routes>
              {modules.map(module => (
                <Route {...module.routeProps} key={module.name} />
              ))}
      </Routes>
    </div>
  );
}

export default App;
