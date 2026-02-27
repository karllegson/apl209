import Image from 'next/image'
import { useMemo } from 'react'

const LOADING_IMAGES = [
  '/admin-loading/dog-1.png',
  '/admin-loading/dog-2.png',
  '/admin-loading/dog-3.png',
  '/admin-loading/dog-4.png',
  '/admin-loading/dog-5.png',
  '/admin-loading/dog-6.png',
  '/admin-loading/cat-1.png',
  '/admin-loading/cat-2.png',
]

export default function AdminPageLoading() {
  const selectedImage = useMemo(() => {
    if (!LOADING_IMAGES.length) return null
    const index = Math.floor(Math.random() * LOADING_IMAGES.length)
    return LOADING_IMAGES[index]
  }, [])

  return (
    <div
      className="fixed top-0 right-0 bottom-0 left-0 md:left-64 z-[100] flex items-center justify-center bg-slate-500/70 backdrop-blur-xl animate-fade-in"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="inline-flex flex-col items-center justify-center gap-4 rounded-2xl bg-white px-7 py-6 shadow-2xl border border-slate-200">
        {selectedImage && (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
            <Image
              src={selectedImage}
              alt=""
              width={160}
              height={160}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-apl-blue rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-700">Loading…</p>
        </div>
      </div>
    </div>
  )
}
