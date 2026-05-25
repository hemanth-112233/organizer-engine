import { useEffect, useState } from 'react'
import Upload from './Upload'
import API from '../api'
import { motion } from 'framer-motion'

export default function Dashboard(){
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState({})

  const refresh = async ()=>{
    const f = await API.get('/files')
    const s = await API.get('/stats')
    setFiles(f.data || [])
    setStats(s.data || {})
  }

  useEffect(()=>{ refresh() }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Organizer Engine</h1>
          <p className="text-sm text-slate-500">Modernized dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="col-span-2 p-4 glass rounded-xl shadow-md">
          <h2 className="font-medium text-lg mb-3">Upload Files</h2>
          <Upload onUploaded={()=>refresh()} />
        </motion.div>

        <motion.div className="p-4 glass rounded-xl shadow-md">
          <h2 className="font-medium text-lg mb-3">Stats</h2>
          <ul className="text-sm text-slate-600">
            {Object.entries(stats).map(([k,v])=> (
              <li key={k} className="flex justify-between py-1"><span>{k}</span><strong>{v}</strong></li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="p-4 glass rounded-xl shadow-md">
        <h2 className="font-medium text-lg mb-3">Files</h2>
        <div className="divide-y">
          {files.map(f=> (
            <div key={f.id} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-slate-500">{f.category} • {f.size} bytes</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
