import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import API from '../api'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

export default function Upload({ onUploaded }) {
  const [progress, setProgress] = useState(0)
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await API.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      toast.success('Upload complete')
      setProgress(0)
      onUploaded && onUploaded(res.data.file)

    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.detail || 'Upload failed')
      setProgress(0)
    }

  }, [onUploaded])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div className="w-full">
      <motion.div {...getRootProps()} whileHover={{scale:1.02}} className={`p-6 border-2 border-dashed rounded-lg text-center dark:border-slate-700`}>
        <input {...getInputProps()} />
        <p className="text-sm text-slate-500">{isDragActive ? 'Drop files here' : 'Drag & drop files, or click to select'}</p>
      </motion.div>

      {progress > 0 && (
        <div className="mt-3">
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <motion.div initial={{width:0}} animate={{width: `${progress}%`}} className="h-3 bg-accent"></motion.div>
          </div>
          <div className="text-xs mt-1 text-slate-500">{progress}%</div>
        </div>
      )}
    </div>
  )
}
