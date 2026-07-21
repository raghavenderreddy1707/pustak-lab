import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Upload, File, X, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, ChevronLeft, Plus, Tag
} from 'lucide-react'
import { notesAPI } from '@/api'
import { MATERIAL_TYPES, SEMESTERS, formatFileSize, getErrorMessage, cn } from '@/utils'
import toast from 'react-hot-toast'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title too long'),
  description: z.string().min(10, 'Add a brief description').max(500, 'Description too long'),
  university: z.string().min(2, 'Enter your university'),
  course: z.string().min(1, 'Select a course'),
  subject: z.string().min(2, 'Enter the subject name'),
  semester: z.string().min(1, 'Select semester'),
  materialType: z.string().min(1, 'Select material type'),
})

const COURSES = [
  'B.Tech / B.E.', 'B.Sc', 'BCA', 'BBA', 'B.Com',
  'M.Tech / M.E.', 'M.Sc', 'MCA', 'MBA', 'M.Com', 'PhD', 'Other'
]

const STEPS = ['File', 'Details', 'Tags & Review']

export default function UploadPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, formState: { errors }, trigger, getValues, watch } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      university: '',
      course: '',
      semester: '',
      materialType: '',
    }
  })

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setFileError('')
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0]
      if (err.code === 'file-too-large') {
        setFileError('File is too large. Maximum size is 100MB.')
      } else if (err.code === 'file-invalid-type') {
        setFileError('Invalid file type. Please upload PDF, DOCX, PPT, or images.')
      } else {
        setFileError(err.message)
      }
      return
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag))

  const nextStep = async () => {
    if (step === 0) {
      if (!file) { setFileError('Please select a file to upload'); return }
      setStep(1)
    } else if (step === 1) {
      const valid = await trigger(['title', 'description', 'university', 'course', 'subject', 'semester', 'materialType'])
      if (valid) setStep(2)
    }
  }

  const onSubmit = async (data) => {
    if (!file) { toast.error('No file selected'); return }
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('university', data.university)
    formData.append('course', data.course)
    formData.append('subject', data.subject)
    formData.append('semester', data.semester)
    formData.append('materialType', data.materialType)
    formData.append('tags', JSON.stringify(tags))

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      const { data: res } = await notesAPI.upload(formData)
      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success('Notes uploaded successfully! 🎉')
      setTimeout(() => navigate(`/notes/${res.data._id}`), 600)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word')) return '📝'
    if (type?.includes('presentation') || type?.includes('powerpoint')) return '📊'
    if (type?.includes('image')) return '🖼️'
    return '📁'
  }

  return (
    <div className="container-app py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title">Upload Study Materials</h1>
          <p className="page-subtitle">Share your notes and help fellow students — it only takes a minute</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={cn(
                'flex items-center gap-2',
                i < step ? 'text-success-500' : i === step ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all',
                  i < step ? 'bg-success-500 text-white' :
                  i === step ? 'bg-primary-600 text-white shadow-glow' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-400'
                )}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-3', i < step ? 'bg-success-400' : 'bg-slate-200 dark:bg-slate-700')} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 0: File Upload */}
          {step === 0 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-semibold text-lg mb-4 text-slate-900 dark:text-white">
                Select your file
              </h2>

              {!file ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
                    isDragActive
                      ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/20 scale-[1.01]'
                      : 'border-slate-200 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                  )}
                >
                  <input {...getInputProps()} />
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors',
                    isDragActive ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-slate-100 dark:bg-slate-700'
                  )}>
                    <Upload className={cn('w-7 h-7', isDragActive ? 'text-primary-600' : 'text-slate-400')} />
                  </div>
                  {isDragActive ? (
                    <p className="text-primary-600 font-medium">Drop it here!</p>
                  ) : (
                    <>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Drag & drop your file here
                      </p>
                      <p className="text-sm text-slate-400 mb-4">or click to browse</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {['PDF', 'DOCX', 'PPT', 'Images'].map(t => (
                          <span key={t} className="badge badge-slate">{t}</span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-3">Maximum file size: 100MB</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-success-100 dark:bg-emerald-900/20 rounded-2xl border border-success-500/30">
                  <div className="text-3xl">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="btn-icon btn-ghost text-slate-400 hover:text-danger-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {fileError && (
                <div className="flex items-center gap-2 text-danger-600 text-sm mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {fileError}
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in space-y-4">
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Note Details</h2>

              <div>
                <label className="label">Note Title *</label>
                <input
                  {...register('title')}
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g. Unit 3 — Data Structures Notes (BFS, DFS, Trees)"
                />
                {errors.title && <p className="text-xs text-danger-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                  placeholder="Briefly describe what's covered — topics, chapters, what makes this useful…"
                />
                {errors.description && <p className="text-xs text-danger-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">University *</label>
                  <input
                    {...register('university')}
                    className={`input ${errors.university ? 'input-error' : ''}`}
                    placeholder="e.g. Anna University"
                  />
                  {errors.university && <p className="text-xs text-danger-500 mt-1">{errors.university.message}</p>}
                </div>

                <div>
                  <label className="label">Course / Degree *</label>
                  <select {...register('course')} className={`input ${errors.course ? 'input-error' : ''}`}>
                    <option value="">Select course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.course && <p className="text-xs text-danger-500 mt-1">{errors.course.message}</p>}
                </div>

                <div>
                  <label className="label">Subject *</label>
                  <input
                    {...register('subject')}
                    className={`input ${errors.subject ? 'input-error' : ''}`}
                    placeholder="e.g. Data Structures & Algorithms"
                  />
                  {errors.subject && <p className="text-xs text-danger-500 mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="label">Semester *</label>
                  <select {...register('semester')} className={`input ${errors.semester ? 'input-error' : ''}`}>
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.semester && <p className="text-xs text-danger-500 mt-1">{errors.semester.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Material Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MATERIAL_TYPES.map((type) => {
                    const selected = watch('materialType') === type
                    return (
                      <label
                        key={type}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium',
                          selected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600'
                        )}
                      >
                        <input
                          type="radio"
                          value={type}
                          {...register('materialType')}
                          className="sr-only"
                        />
                        <span>{type === 'Notes' ? '📝' : type === 'Question Paper' ? '📄' : type === 'Assignment' ? '✏️' : type === 'Lab Manual' ? '🔬' : '⚡'}</span>
                        {type}
                      </label>
                    )
                  })}
                </div>
                {errors.materialType && <p className="text-xs text-danger-500 mt-1">{errors.materialType.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Tags & Review */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Add Tags</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Tags help students find your notes. Add relevant keywords like topics, exam type, unit number.
                </p>

                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="e.g. unit-3, midterm, handwritten"
                      className="input pl-9"
                      maxLength={30}
                    />
                  </div>
                  <button type="button" onClick={addTag} className="btn-secondary px-4">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="badge badge-primary gap-1">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">{tags.length}/10 tags</p>
              </div>

              {/* Review */}
              <div className="card p-6">
                <h3 className="font-display font-semibold mb-4 text-slate-900 dark:text-white">Review Before Upload</h3>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'File', value: `${file?.name} (${formatFileSize(file?.size)})` },
                    { label: 'Title', value: getValues('title') },
                    { label: 'University', value: getValues('university') },
                    { label: 'Course', value: getValues('course') },
                    { label: 'Subject', value: getValues('subject') },
                    { label: 'Semester', value: getValues('semester') },
                    { label: 'Type', value: getValues('materialType') },
                  ].map((r) => (
                    <div key={r.label} className="flex gap-3">
                      <span className="text-slate-400 w-20 flex-shrink-0">{r.label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{r.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Uploading… {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={isUploading}
                className="btn-secondary"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={isUploading} className="btn-primary btn-lg">
                {isUploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                  : <><Upload className="w-4 h-4" /> Upload Notes</>
                }
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
