import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, ArrowLeft, Share2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { topicById, companyById, supervisorById, universityById, fieldById } from '@/data/index'
import { ThesisGraph } from '@/components/graph/ThesisGraph'
import { Badge } from '@/components/ui/badge'
import { ACADEMIC, INDUSTRY } from '@/components/graph/colors'

// ─── Bookmark row card ────────────────────────────────────────────────────────

function ThesisRow({ topicId }: { topicId: string }) {
  const { setThesisGraphTopicId } = useAppStore()
  const topic = topicById[topicId]
  if (!topic) return null

  const isAcademic = !topic.companyId
  const colors = isAcademic ? ACADEMIC : INDUSTRY
  const company = topic.companyId ? companyById[topic.companyId] : null
  const supervisor = topic.supervisorIds[0] ? supervisorById[topic.supervisorIds[0]] : null
  const university = topic.universityId ? universityById[topic.universityId] : null
  const sourceName = company?.name ?? (supervisor
    ? `${supervisor.title} ${supervisor.lastName}`
    : university?.name ?? '')
  const topicFields = topic.fieldIds.map(id => fieldById[id]).filter(Boolean)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border bg-card p-4 space-y-2"
      style={{ borderColor: colors.border }}
    >
      <p className="ds-caption font-medium" style={{ color: colors.text }}>{sourceName}</p>
      <h3 className="ds-label leading-snug line-clamp-2">{topic.title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {topicFields.slice(0, 3).map(f => (
          <Badge key={f.id} variant="secondary" className="ds-caption">{f.name}</Badge>
        ))}
      </div>
      <button
        onClick={() => setThesisGraphTopicId(topicId)}
        className="mt-1 flex items-center gap-1.5 ds-caption font-medium transition-colors hover:opacity-80"
        style={{ color: colors.text }}
      >
        <Share2 className="size-3" />
        View Graph →
      </button>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ThesisGraphPage() {
  const { bookmarkedTopicIds, thesisGraphTopicId, setThesisGraphTopicId } = useAppStore()

  return (
    <div className="h-full relative">
      <AnimatePresence mode="wait">
        {thesisGraphTopicId === null ? (
          /* ── Bookmark list ── */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">
              <div className="space-y-1">
                <h1 className="header-sm">Thesis Graph</h1>
                <p className="ds-caption text-muted-foreground">
                  Select a bookmarked thesis to explore its full network
                </p>
              </div>

              {bookmarkedTopicIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <Bookmark className="size-8 text-muted-foreground/40" />
                  <p className="ds-label text-muted-foreground">No bookmarks yet</p>
                  <p className="ds-caption text-muted-foreground/60">
                    Go to Explore Graph and bookmark thesis topics to visualise them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  {bookmarkedTopicIds.map(id => (
                    <ThesisRow key={id} topicId={id} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Isolated graph ── */
          <motion.div
            key={`graph-${thesisGraphTopicId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {/* Header bar */}
            <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
              <button
                onClick={() => setThesisGraphTopicId(null)}
                className="flex items-center gap-1.5 ds-caption text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
              <div className="h-4 w-px bg-border" />
              <p className="ds-label truncate text-foreground">
                {topicById[thesisGraphTopicId]?.title ?? ''}
              </p>
            </div>

            {/* Graph */}
            <div className="flex-1 overflow-hidden">
              <ThesisGraph topicId={thesisGraphTopicId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
