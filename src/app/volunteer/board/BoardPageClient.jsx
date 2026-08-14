'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react'
import { format } from 'date-fns'
import { LanguageProvider, LanguageToggle, useLanguage } from '@/components/intake/LanguageContext'

function Board() {
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  const [posts, setPosts] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setError('')
    try {
      const res = await fetch('/api/volunteer/posts')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load board')
      setPosts(data.posts || [])
      setIsAdmin(!!data.isAdmin)
      setSignedIn(!!data.signedIn)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/volunteer/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not post')
      setTitle('')
      setBody('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id, status) => {
    await fetch(`/api/volunteer/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
  }

  const remove = async (id) => {
    await fetch(`/api/volunteer/posts/${id}`, { method: 'DELETE' })
    await load()
  }

  const pending = posts.filter((p) => p.status === 'pending')
  const approved = posts.filter((p) => p.status === 'approved')
  const minePending = posts.filter((p) => p.is_mine && p.status === 'pending')

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/volunteer"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-apl-blue transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {isSpanish ? 'Voluntarios' : 'Volunteers'}
        </Link>
        <LanguageToggle />
      </div>

      <Link href="/book" className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Animal Protection League"
          width={140}
          height={70}
          className="h-12 w-auto object-contain"
        />
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-apl-primary to-[#1e4f8a] text-white px-4 py-4 text-center">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <h1 className="relative text-lg sm:text-xl font-bold tracking-tight">
          {isSpanish ? 'Tablero de voluntarios' : 'Volunteer board'}
        </h1>
        <p className="relative text-sm text-white/80 mt-1">
          {isSpanish
            ? 'Avisos de la clínica y notas de quienes ayudan.'
            : 'Clinic notes and updates from people who help.'}
        </p>
      </div>

      {signedIn ? (
        <form onSubmit={submit} className="space-y-2 rounded-2xl border border-gray-200 bg-gray-50/60 p-3 md:p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            {isSpanish
              ? 'Útil: detergente que se acabó, una carga que no terminó, o si vas a llegar tarde. La clínica revisa las notas de voluntarios antes de publicarlas.'
              : 'Useful: detergent ran out, a load didn’t finish, or you’re running late. Volunteer notes are reviewed before they go live.'}
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isSpanish ? 'Título (opcional)' : 'Title (optional)'}
            className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-base"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={
              isAdmin
                ? isSpanish
                  ? 'Escribe un anuncio… se publica de inmediato.'
                  : 'Write an update… it goes live right away.'
                : isSpanish
                  ? 'Escribe una nota… la clínica la revisa antes de publicarla.'
                  : 'Write a note… the clinic reviews it before it goes live.'
            }
            className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-base"
          />
          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="w-full min-h-[44px] px-4 py-2.5 bg-apl-primary text-white text-sm font-medium rounded-lg hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer touch-manipulation"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : isAdmin ? (
              isSpanish ? 'Publicar' : 'Post'
            ) : isSpanish ? (
              'Enviar para aprobación'
            ) : (
              'Submit for approval'
            )}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-600 text-center">
          <Link href="/volunteer" className="text-apl-blue underline underline-offset-2">
            {isSpanish ? 'Inicia sesión' : 'Sign in'}
          </Link>{' '}
          {isSpanish ? 'para publicar. Las notas de voluntarios se aprueban primero.' : 'to post. Volunteer notes are approved first.'}
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {isAdmin && pending.length > 0 && (
        <section>
          <h2 className="form-section-heading">
            {isSpanish ? 'Pendientes de aprobación' : 'Needs approval'} ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                isSpanish={isSpanish}
                admin
                onApprove={() => setStatus(p.id, 'approved')}
                onReject={() => setStatus(p.id, 'rejected')}
                onDelete={() => remove(p.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {!isAdmin && minePending.length > 0 && (
        <section>
          <h2 className="form-section-heading">{isSpanish ? 'Esperando aprobación' : 'Waiting for approval'}</h2>
          <ul className="space-y-2">
            {minePending.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                isSpanish={isSpanish}
                onDelete={() => remove(p.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-apl-primary" />
        </div>
      ) : approved.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
          <Megaphone className="w-8 h-8 text-apl-primary/40 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-800">
            {isSpanish ? 'Todavía no hay publicaciones' : 'No posts yet'}
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xs mx-auto">
            {isSpanish
              ? 'Cuando la clínica o un voluntario publique algo, aparecerá aquí.'
              : 'When the clinic or a volunteer posts something, it will show up here.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {approved.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              isSpanish={isSpanish}
              admin={isAdmin}
              onDelete={isAdmin ? () => remove(p.id) : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function PostCard({ post, isSpanish, admin, onApprove, onReject, onDelete }) {
  return (
    <li
      className={`rounded-2xl border p-3 md:p-4 bg-white ${
        post.is_admin ? 'border-apl-primary/25 bg-gradient-to-br from-apl-blue-50/80 to-white' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">
            {post.is_admin ? (
              <span className="inline-flex items-center gap-1 text-apl-primary font-medium">
                <Megaphone className="w-3 h-3" />
                APL
              </span>
            ) : (
              post.author_name
            )}
            {' · '}
            {format(new Date(post.created_at), 'MMM d')}
            {post.status === 'pending' && (
              <span className="ml-2 text-amber-700">
                {isSpanish ? 'Pendiente' : 'Pending'}
              </span>
            )}
            {post.status === 'rejected' && (
              <span className="ml-2 text-red-500">{isSpanish ? 'Rechazado' : 'Rejected'}</span>
            )}
          </p>
          {post.title && <p className="font-semibold text-gray-900 mt-1 text-sm">{post.title}</p>}
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{post.body}</p>
        </div>
      </div>
      {(onApprove || onReject || onDelete) && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-3">
          {admin && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg bg-apl-primary text-white cursor-pointer touch-manipulation"
            >
              {isSpanish ? 'Aprobar' : 'Approve'}
            </button>
          )}
          {admin && onReject && (
            <button
              type="button"
              onClick={onReject}
              className="min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 cursor-pointer touch-manipulation"
            >
              {isSpanish ? 'Rechazar' : 'Reject'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg text-red-600 cursor-pointer touch-manipulation"
            >
              {isSpanish ? 'Borrar' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </li>
  )
}

export default function BoardPageClient() {
  return (
    <LanguageProvider>
      <Board />
    </LanguageProvider>
  )
}
