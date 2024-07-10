import ReactDOM  from 'react-dom/client';
import App from './App';
import Hero from './Hero';
import SignupForm from '../src/_auth/Forms/SignupForm'
import {BrowserRouter} from 'react-router-dom';
import AuthProvider from './context/AuthContext'
import {QueryProvider} from './lib/react-query/Queryprovider'

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
            <App/>
          </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  
);