import Dashboard from './components/Dashboard'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App(){
  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto">
        <Dashboard />
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}