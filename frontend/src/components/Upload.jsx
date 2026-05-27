import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import API from '../api'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

export default function Upload({ onUploaded }) {
  const [progress, setProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState([])
  const MAX_FILES = 5

  // shared helper to process incoming FileList/Array and update staging area
  const processSelectedFiles = useCallback((incoming) => {
    if (!incoming) return

    const arr = Array.from(incoming)
    if (arr.length === 0) return

    // append while enforcing MAX_FILES total
    setSelectedFiles((prev) => {
      const combined = [...prev, ...arr]
      if (combined.length > MAX_FILES) {
        toast.error(`You can upload a maximum of ${MAX_FILES} files at once`)
        return prev
      }
      return combined
    })
  }, [])

  const handleAbort = () => {
    setSelectedFiles([])
    setProgress(0)
  }

  const handleFinalUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const form = new FormData()
    selectedFiles.forEach((f) => form.append('files', f))

    try {
      const res = await API.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      toast.success('Upload complete')
      setProgress(0)
      setSelectedFiles([])
      // keep compatibility: call onUploaded with returned files or simply trigger refresh
      onUploaded && onUploaded(res.data.files || res.data.file || null)

    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.detail || 'Upload failed')
      setProgress(0)
    }
  }

  // Use dropzone for input props, but handle drop events explicitly to ensure
  // dragenter/dragover/dragleave/drop are all handled and files are passed
  // into the shared `processSelectedFiles` function.
  const {getRootProps, getInputProps, isDragActive} = useDropzone({multiple: true})
  const rootProps = getRootProps()
  const inputProps = getInputProps()

  return (
    <div className="w-full">
      <motion.div
        {...rootProps}
        whileHover={{scale:1.02}}
        className={`p-6 border-2 border-dashed rounded-lg text-center dark:border-slate-700`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          rootProps.onDragEnter && rootProps.onDragEnter(e)
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          rootProps.onDragOver && rootProps.onDragOver(e)
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          rootProps.onDragLeave && rootProps.onDragLeave(e)
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();

          // call dropzone's handler if present
          rootProps.onDrop && rootProps.onDrop(e)

          // extract files from DataTransfer and process
          const dtFiles = e.dataTransfer && e.dataTransfer.files
          if (dtFiles && dtFiles.length) {
            processSelectedFiles(dtFiles)
          }
        }}
      >
        <input {...inputProps} multiple onChange={(e) => { inputProps.onChange && inputProps.onChange(e); processSelectedFiles(e.target.files); }} />
        <p className="text-sm text-slate-500">{isDragActive ? 'Drop files here' : 'Drag & drop files, or click to select'}</p>
      </motion.div>

      {/* Dock / staging area */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="mt-3 p-3 border rounded bg-white dark:bg-slate-800">
          <div className="text-sm text-slate-600 mb-2">Selected files: {selectedFiles.length}</div>
          <ul className="text-sm text-slate-700 dark:text-slate-300 max-h-40 overflow-auto mb-3">
            {selectedFiles.map((f, idx) => (
              <li key={idx} className="truncate">{f.name}</li>
            ))}
          </ul>

          <div className="flex space-x-2">
            <button onClick={handleFinalUpload} className="px-3 py-2 bg-accent text-white rounded">Final Upload</button>
            <button onClick={handleAbort} className="px-3 py-2 border rounded">Abort</button>
          </div>
        </div>
      )}

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
