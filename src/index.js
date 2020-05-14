import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import { FIREBASE_PROPS, GRAPH_URL,SUBSCRIBE_URL } from './properties';
import { BrowserRouter } from 'react-router-dom';
import 'materialize-css/dist/css/materialize.min.css'
import HookLogin from './components/app';
import * as serviceWorker from './serviceWorker';
import {ApolloClient} from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink, split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';

firebase.initializeApp(FIREBASE_PROPS);

const httpLink_ = new createHttpLink({
  uri: GRAPH_URL,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    }
  }
});

const httpLink = authLink.concat(httpLink_);

const wsLink = new WebSocketLink({
  uri: SUBSCRIBE_URL,
  options: {
    reconnect: true,
    connectionParams: {
      authorization: localStorage.getItem('token')
    }
  },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache,
});


ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <HookLogin />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
