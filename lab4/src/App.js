import React from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Characters from './components/Characters';
import Comics from './components/Comics';
import Series from './components/Series';
import NotFound from './components/NotFound';
import SingleCharacter from './components/SingleCharacter';
import SingleComic from './components/SingleComic';
import SingleSeries from './components/SingleSeries';

function App() {
  return (
    <Router>
        <Switch>  
          <Route exact path="/"><Home /></Route>
          <Route exact path="/characters/page/:page" component={ Characters }></Route>
          <Route exact path="/characters/:id" component={ SingleCharacter}></Route>
          <Route exact path="/comics/page/:page" component={ Comics }></Route>
          <Route exact path="/comics/:id" component={ SingleComic }></Route>
          <Route exact path="/series/page/:page" component={ Series }></Route>
          <Route exact path="/series/:id" component={ SingleSeries }></Route>
          <Route exact path="*"><NotFound /></Route>
        </Switch>
    </Router>
  );
}

export default App;