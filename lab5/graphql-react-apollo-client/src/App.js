import React from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink} from 'react-router-dom';
import './App.css';

import Images from './component/Images';
import MyBin from './component/MyBin';
import MyPosts from './component/MyPosts';
import NewPost from './component/Newpost';
import NotFound from './component/NotFound';
  
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000'
  })
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <nav>
            <h1>Binterest</h1>
            <NavLink className = "navLink" to="/">
              Images
            </NavLink>
          
            <NavLink className = "navLink" to="/my-bin">
              My-bin
            </NavLink>
          
            <NavLink className = "navLink" to="/my-posts">
              My-posts
            </NavLink>

            <NavLink className = "navLink" to="/new-post">
              New-post
            </NavLink>
        </nav>

        <Switch>
          <Route exact path="/" component={Images} />
          <Route exact path="/my-bin" component={MyBin} />
          <Route exact path="/my-posts" component={MyPosts} />
          <Route exact path="/new-post" component={NewPost} />
          <Route exact path="*"><NotFound /></Route>
        </Switch>
        
      </Router>
   </ApolloProvider>
  );
}

export default App;
