import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { AppSidebar } from '@/components/AppSidebar'
import { GraphView } from '@/components/graph/GraphView'
import { TopicDetailPanel } from '@/components/TopicDetailPanel'
import { SourceDetailPanel } from '@/components/SourceDetailPanel'
import { topicById, companyById, supervisorById, fieldById } from '@/data/index'
import { Badge } from '@/components/ui/badge'

function BookmarksView() {
  const { bookmarkedTopicIds, setActiveTopic, toggleBookmark } = useAppStore()

  if (bookmarkedTopicIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <Bookmark className="size-8 mx-auto text-muted-foreground/40" />
          <p className="ds-label text-muted-foreground">No bookmarks yet</p>
          <p className="ds-caption text-muted-foreground/60">
            Explore the graph and bookmark interesting topics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl space-y-4">
        <div className="space-y-1">
          <h1 className="header-sm">Bookmarked topics</h1>
          <p className="ds-caption text-muted-foreground">
            {bookmarkedTopicIds.length} topic{bookmarkedTopicIds.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <AnimatePresence>
          {bookmarkedTopicIds.map(topicId => {
            const topic = topicById[topicId]
            if (!topic) return null
            const company = topic.companyId ? companyById[topic.companyId] : null
            const supervisor = topic.supervisorIds[0] ? supervisorById[topic.supervisorIds[0]] : null
            const sourceName = company?.name ?? (supervisor ? `${supervisor.title} ${supervisor.lastName}` : '')
            const topicFields = topic.fieldIds.map(id => fieldById[id]).filter(Boolean)

            return (
              <motion.div
                key={topicId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="group flex items-start gap-4 rounded-xl border border-border p-4 bg-card"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="ds-caption text-muted-foreground">{sourceName}</p>
                    <h3 className="ds-label mt-0.5">{topic.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {topicFields.slice(0, 3).map(f => (
                      <Badge key={f.id} variant="secondary" className="ds-caption">{f.name}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActiveTopic(topicId)}
                    className="ds-caption text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
                  >
                    View
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleBookmark(topicId)}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <X className="size-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function GraphPage() {
  const { currentPanel, activeTopicId, activeSourceId } = useAppStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      {/* Main content area */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPanel === 'graph' ? (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <GraphView />
            </motion.div>
          ) : (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <BookmarksView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail panels — only one visible at a time (setActiveTopic clears activeSourceId and vice versa) */}
      <AnimatePresence>
        {activeTopicId && <TopicDetailPanel key={`topic-${activeTopicId}`} />}
        {activeSourceId && <SourceDetailPanel key={`source-${activeSourceId}`} />}
      </AnimatePresence>
    </div>
  )
}
