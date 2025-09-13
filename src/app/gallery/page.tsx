'use client'

import { useEffect, useRef, useState } from 'react'
import UploadWidget from '@/components/UploadWidget'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

type MediaItem = {
  id: string
  url: string
  thumbnailUrl: string
  createdAt: string
  mimeType: string
}

export default function GalleryPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
  const [items, setItems] = useState<MediaItem[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loader = useRef<HTMLDivElement | null>(null)

  const fetchMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/media?offset=${offset}&limit=24`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { items: MediaItem[]; nextOffset: number }
      setItems((prev) => [...prev, ...data.items])
      setOffset(data.nextOffset)
      if (data.items.length === 0) setHasMore(false)
    } catch (e) {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loader.current) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchMore()
    })
    io.observe(loader.current)
    return () => io.disconnect()
  }, [loader.current])

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📷 メディアギャラリー</h1>
        <UploadWidget onUploaded={() => { setItems([]); setOffset(0); setHasMore(true); fetchMore() }} />
      </div>

      {items.length === 0 && !loading ? (
        <div className="text-center text-base-content/60 py-20">まだメディアがありません。右上から追加してください。</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((m) => (
            <a key={m.id} href={`${apiBase}/api/media/${m.id}/image`} target="_blank" rel="noreferrer" className="block group">
              <img
                src={`${apiBase}/api/media/${m.id}/image`}
                alt={m.id}
                className="w-full h-40 object-cover rounded-lg shadow group-hover:opacity-90 transition"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}

      <div ref={loader} className="py-8 text-center">
        {loading ? <span className="loading loading-dots" /> : hasMore ? ' ' : 'これ以上ありません'}
      </div>
    </AuthenticatedLayout>
  )
}

