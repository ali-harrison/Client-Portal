'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Upload,
  File,
  Image,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface FileUploadProps {
  projectId: string
  deliverableId?: string
  onUploadComplete?: () => void
}

interface UploadedFile {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

export default function FileUpload({
  projectId,
  deliverableId,
  onUploadComplete,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const uploaded: UploadedFile[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${projectId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`

        const { error: storageError } = await supabase.storage
          .from('project-files')
          .upload(fileName, file)

        if (storageError) {
          console.error('Storage error:', storageError)
          setError(`Failed to upload ${file.name}`)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('project-files').getPublicUrl(fileName)

        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            project_id: projectId,
            deliverable_id: deliverableId || null,
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: 'admin',
          })
          .select()
          .single()

        if (!dbError && fileRecord) {
          uploaded.push(fileRecord)
        }
      }

      setUploadedFiles((prev) => [...prev, ...uploaded])
      setUploading(false)

      if (onUploadComplete) {
        onUploadComplete()
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image
    if (fileType.includes('pdf')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept="image/*,.pdf,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="bg-slate-100 p-4 rounded-full">
            <Upload className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <div className="text-slate-900 font-semibold mb-1">
              Click to upload files
            </div>
            <div className="text-sm text-slate-500">
              PDF, PNG, JPG, DOC up to 10MB
            </div>
          </div>
        </label>
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Uploading files...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Successfully uploaded:
          </div>
          {uploadedFiles.map((file, idx) => {
            const FileIcon = getFileIcon(file.file_type)
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <FileIcon className="w-5 h-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {file.file_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatFileSize(file.file_size)}
                  </div>
                </div>

                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  View
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
