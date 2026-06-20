import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { PermissionProvider } from '@permission-kit/react'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PermissionProvider
      permissions={[
        'user.view',
        'user.create'
      ]}
    >
      <App />
    </PermissionProvider>
  </StrictMode>
)
