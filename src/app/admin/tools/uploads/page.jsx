'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageLoading from '@/components/AdminPageLoading'
import { ArrowLeft, FolderPlus, UploadCloud, Trash2, FileText, ChevronRight } from 'lucide-react'

const API_BASE = '/api/admin/uploads'

function fetchOptions(method, body) {
  const opts = {
    method,
    credentials: 'include',
  }
  if (!(body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json' }
  }
  if (body != null) opts.body = body instanceof FormData ? body : JSON.stringify(body)
  return opts
}

function parentPath(path) {
  if (!path) return ''
  const parts = String(path).split('/').filter(Boolean)
  parts.pop()
  return parts.join('/')
}

export default function UploadsPage() {
  const router = useRouter()

  const [authChecking, setAuthChecking] = useState(true)
  const [staffName, setStaffName] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentPath, setCurrentPath] = useState('')
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])

  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [sortKey, setSortKey] = useState('name') // 'name' | 'updatedAt' | 'size'
  const [selectedPath, setSelectedPath] = useState(null)

  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)

  const canView = staffName === 'Karl Legson'

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/admin')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        if (!data.staffName) {
          router.replace('/admin/who')
          return
        }
        setStaffName(data.staffName)
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setAuthChecking(false))
  }, [router])

  useEffect(() => {
    if (!authChecking && staffName && !canView) {
      router.replace('/admin')
    }
  }, [authChecking, staffName, canView, router])

  const crumb = useMemo(() => {
    const parts = currentPath ? String(currentPath).split('/').filter(Boolean) : []
    return parts
  }, [currentPath])

  const load = async (path) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE}?path=${encodeURIComponent(path || '')}`
      const res = await fetch(url, fetchOptions('GET'))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setFolders(data.folders || [])
      setFiles(data.files || [])
      setSelectedPath(null)
    } catch (err) {
      setError(err.message || 'Failed to load uploads')
      setFolders([])
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(currentPath)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath])

  const fmtBytes = (bytes) => {
    if (bytes == null || typeof bytes !== 'number') return ''
    if (!Number.isFinite(bytes)) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round((bytes / 1024) * 10) / 10} KB`
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`
  }

  const foldersSorted = useMemo(() => {
    const copy = [...folders]
    copy.sort((a, b) => {
      if (sortKey === 'updatedAt') {
        const av = a.updatedAt ? new Date(a.updatedAt).getTime() : null
        const bv = b.updatedAt ? new Date(b.updatedAt).getTime() : null
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        return bv - av
      }
      // name
      return a.name.localeCompare(b.name)
    })
    return copy
  }, [folders, sortKey])

  const filesSorted = useMemo(() => {
    const copy = [...files]
    copy.sort((a, b) => {
      if (sortKey === 'size') {
        const av = typeof a.size === 'number' ? a.size : null
        const bv = typeof b.size === 'number' ? b.size : null
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        return bv - av
      }
      if (sortKey === 'updatedAt') {
        const av = a.updatedAt ? new Date(a.updatedAt).getTime() : null
        const bv = b.updatedAt ? new Date(b.updatedAt).getTime() : null
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        return bv - av
      }
      // name
      return a.name.localeCompare(b.name)
    })
    return copy
  }, [files, sortKey])

  const openFolder = (folderPath) => {
    setCurrentPath(folderPath)
  }

  const submitCreateFolder = async () => {
    const name = newFolderName.trim().replace(/^\/+/, '')
    if (!name) return

    // Prevent accidental nested creation; we only support one segment here.
    if (name.includes('/')) {
      setError('Folder name should not include “/”.')
      return
    }

    const targetPath = currentPath ? `${currentPath}/${name}` : name
    setCreatingFolder(false)
    setNewFolderName('')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/folders`, fetchOptions('POST', { path: targetPath }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      await load(currentPath)
    } catch (err) {
      setError(err.message || 'Failed to create folder')
      setLoading(false)
    }
  }

  const submitUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.set('path', currentPath)
      fd.set('file', uploadFile)

      const res = await fetch(`${API_BASE}`, fetchOptions('POST', fd))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setUploadFile(null)
      await load(currentPath)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (path, recursive = false) => {
    const ok = window.confirm(recursive ? `Delete folder “${path}” and all its files?` : `Delete file “${path}”?`)
    if (!ok) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/delete`, fetchOptions('DELETE', { path, recursive }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      // If deleting current folder, navigate up. Otherwise reload current view.
      if (recursive && path === currentPath) {
        setCurrentPath(parentPath(currentPath))
        return
      }
      await load(currentPath)
    } catch (err) {
      setError(err.message || 'Delete failed')
      setLoading(false)
    }
  }

  if (authChecking) {
    return <AdminPageLoading />
  }

  if (!canView) return null

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
        <div className="md:pl-0 pl-14 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/tools')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Tools
          </button>
          <h1 className="text-xl font-bold text-slate-800">File Uploads</h1>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-[240px]">
                <div className="text-xs font-medium text-slate-500 mb-1">Current folder</div>
                <div className="text-sm text-slate-800 font-medium break-all">
                  {currentPath ? currentPath : 'Root'}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  {currentPath && (
                    <button
                      type="button"
                      onClick={() => setCurrentPath(parentPath(currentPath))}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Up
                      <ChevronRight className="w-3 h-3 rotate-180" />
                    </button>
                  )}
                  {crumb.map((part, idx) => {
                    const partial = crumb.slice(0, idx + 1).join('/')
                    return (
                      <span key={partial} className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentPath(partial)}
                          className={`hover:underline ${idx === crumb.length - 1 ? 'text-slate-800' : 'text-slate-600'}`}
                        >
                          {part}
                        </button>
                        {idx < crumb.length - 1 && <span>/</span>}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCreatingFolder(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-apl-primary hover:bg-apl-blue-50 border border-apl-primary/20"
                >
                  <FolderPlus className="w-4 h-4" />
                  New folder
                </button>
              </div>
            </div>
          </div>

          {creatingFolder && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCreateFolder()
                    if (e.key === 'Escape') {
                      setCreatingFolder(false)
                      setNewFolderName('')
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={submitCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="rounded-lg bg-apl-primary px-3 py-2 text-sm font-medium text-white hover:bg-apl-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingFolder(false)
                    setNewFolderName('')
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Folders are stored as path prefixes in Supabase Storage.
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <UploadCloud className="w-4 h-4 text-apl-primary" />
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </label>
              <button
                type="button"
                onClick={submitUpload}
                disabled={!uploadFile || uploading}
                className="rounded-lg bg-apl-primary px-3 py-2 text-sm font-medium text-white hover:bg-apl-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              {uploadFile && <span className="text-xs text-slate-600">Selected: {uploadFile.name}</span>}
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                <div className="text-xs font-medium text-slate-500">View</div>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-apl-primary/10 border-apl-primary/30 text-apl-primary'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    viewMode === 'list'
                      ? 'bg-apl-primary/10 border-apl-primary/30 text-apl-primary'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  List
                </button>
                <div className="text-xs font-medium text-slate-500">Sort</div>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg bg-white px-2 py-1 text-slate-700"
                >
                  <option value="name">Name</option>
                  <option value="updatedAt">Last updated</option>
                  <option value="size">Size</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-sm">Loading…</div>
            ) : (
              <div>
                {viewMode === 'grid' ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Folders & files
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {foldersSorted.map((f) => (
                        <div
                          key={f.path}
                          className={`rounded-xl border p-3 transition-colors cursor-pointer ${
                            selectedPath === f.path
                              ? 'border-apl-primary/40 bg-apl-primary/5'
                              : 'border-slate-200 hover:bg-slate-50/60'
                          }`}
                          onClick={() => setSelectedPath(f.path)}
                          onDoubleClick={() => openFolder(f.path)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <FolderPlus className="w-5 h-5 text-slate-500" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                remove(f.path, true)
                              }}
                              className="text-xs text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </div>
                          <div
                            className="mt-2 text-sm font-medium text-slate-800 truncate"
                            title={f.name}
                          >
                            {f.name}
                          </div>
                        </div>
                      ))}

                      {filesSorted.map((file) => (
                        <div
                          key={file.path}
                          className={`rounded-xl border p-3 transition-colors cursor-pointer ${
                            selectedPath === file.path
                              ? 'border-apl-primary/40 bg-apl-primary/5'
                              : 'border-slate-200 hover:bg-slate-50/60'
                          }`}
                          onClick={() => setSelectedPath(file.path)}
                          onDoubleClick={() => {
                            window.open(
                              `/api/admin/uploads/download?path=${encodeURIComponent(file.path)}`,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <FileText className="w-5 h-5 text-slate-500" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                remove(file.path, false)
                              }}
                              className="text-xs text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </div>
                          <div
                            className="mt-2 text-sm font-medium text-slate-800 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {file.size != null ? fmtBytes(file.size) : ''}
                          </div>
                          <div className="mt-3 flex items-center justify-end">
                            <a
                              href={`/api/admin/uploads/download?path=${encodeURIComponent(file.path)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-medium px-2 py-1 rounded-lg bg-apl-primary/10 border border-apl-primary/30 text-apl-primary hover:bg-apl-primary/15 inline-flex items-center"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    {foldersSorted.length + filesSorted.length === 0 && (
                      <div className="text-sm text-slate-500">Nothing here yet.</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">
                        Folders
                      </div>
                      {foldersSorted.length === 0 ? (
                        <div className="text-sm text-slate-500">
                          No folders here yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {foldersSorted.map((f) => (
                            <div
                              key={f.path}
                              className="flex items-center justify-between gap-3"
                            >
                              <button
                                type="button"
                                onClick={() => openFolder(f.path)}
                                className="text-sm font-medium text-slate-800 hover:underline text-left inline-flex items-center gap-2"
                              >
                                <FolderPlus className="w-4 h-4 text-slate-500" />
                                {f.name}
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(f.path, true)}
                                className="text-xs text-slate-400 hover:text-red-500 inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">
                        Files
                      </div>
                      {filesSorted.length === 0 ? (
                        <div className="text-sm text-slate-500">
                          No files here yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filesSorted.map((file) => (
                            <div
                              key={file.path}
                              className="flex items-center justify-between gap-3"
                            >
                              <div
                                className="min-w-0 flex items-center gap-2 cursor-pointer"
                                onClick={() => setSelectedPath(file.path)}
                              >
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="min-w-0">
                                  <div
                                    className={`text-sm text-slate-800 truncate ${
                                      selectedPath === file.path ? 'font-semibold' : ''
                                    }`}
                                    title={file.name}
                                  >
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {file.size != null ? fmtBytes(file.size) : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <a
                                  href={`/api/admin/uploads/download?path=${encodeURIComponent(file.path)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-medium text-apl-primary hover:text-apl-blue-dark"
                                >
                                  Download
                                </a>
                                <button
                                  type="button"
                                  onClick={() => remove(file.path, false)}
                                  className="text-xs text-slate-400 hover:text-red-500 inline-flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

