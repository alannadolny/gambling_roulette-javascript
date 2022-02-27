import './App.css';
import MainPage from './ui/MainPage';
import { BrowserRouter, Route } from 'react-router-dom';
import UserForm from './ui/users/UserForm';
import Game from './ui/game/Game';
import Navbar from './ui/Navbar';
import History from './ui/game/History';
import Deposit from './ui/game/Deposit';
import Scoreboard from './ui/game/Scoreboard';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Route exact path='/' component={MainPage} />
        <Route exact path='/form/:action' component={UserForm} />
        <Route exact path='/game/:login' component={Game} />
        <Route exact path='/game/:login/deposit' component={Deposit} />
        <Route exact path='/game/:login/history' component={History} />
        <Route exact path='/game/:login/scoreboard' component={Scoreboard} />
      </BrowserRouter>
    </div>
  );
}

export default App;
