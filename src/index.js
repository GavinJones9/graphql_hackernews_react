import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { AUTH_TOKEN } from './constants';
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';
import { split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
});
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' &&
      operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);
// 3
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

// 4

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);