import { motion } from 'framer-motion'
import { X, Bookmark, BookmarkCheck, Building2, GraduationCap, Briefcase, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import {
  topicById,
  companyById,
  supervisorById,
  fieldById,
  degreeLabel,
  workplaceLabel,
  employmentTypeLabel,
} from '@/data/index'

export function TopicDetailPanel() {
  const { activeTopicId, bookmarkedTopicIds, setActiveTopic, toggleBookmark } = useAppStore()

  if (!activeTopicId) return null

  const topic = topicById[activeTopicId]
  if (!topic) return null

  const isBookmarked = bookmarkedTopicIds.includes(topic.id)
  const company = topic.companyId ? companyById[topic.companyId] : null
  const supervisors = topic.supervisorIds.map(id => supervisorById[id]).filter(Boolean)
  const topicFields = topic.fieldIds.map(id => fieldById[id]).filter(Boolean)

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 z-40 flex h-full w-96 flex-col border-l border-border bg-background shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <div className="flex-1 min-w-0">
          <p className="ds-caption text-muted-foreground mb-1">
            {company?.name ?? supervisors.map(s => `${s.title} ${s.lastName}`).join(', ')}
          </p>
          <h2 className="ds-title-sm leading-snug">{topic.title}</h2>
        </div>
        <button
          onClick={() => setActiveTopic(null)}
          className="mt-0.5 flex-shrink-0 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {topic.degrees.map(d => (
            <Badge key={d} variant="secondary">{degreeLabel(d)}</Badge>
          ))}
          {topicFields.map(f => (
            <Badge key={f.id} variant="outline">{f.name}</Badge>
          ))}
          {topic.workplaceType && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="size-3" />
              {workplaceLabel(topic.workplaceType)}
            </Badge>
          )}
          {topic.employmentType && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Briefcase className="size-3" />
              {employmentTypeLabel(topic.employmentType)}
            </Badge>
          )}
        </div>

        {/* Source info */}
        {company && (
          <div className="rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <p className="ds-label">{company.name}</p>
            </div>
            {company.domains.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {company.domains.map(d => (
                  <Badge key={d} variant="secondary" className="ds-caption">{d}</Badge>
                ))}
              </div>
            )}
            {company.about && (
              <p className="ds-small text-muted-foreground line-clamp-3">{company.about}</p>
            )}
          </div>
        )}

        {supervisors.length > 0 && (
          <div className="rounded-xl border border-border p-4 space-y-3">
            {supervisors.map(sup => (
              <div key={sup.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-muted-foreground" />
                  <div>
                    <p className="ds-label">{sup.title} {sup.firstName} {sup.lastName}</p>
                  </div>
                </div>
                {sup.researchInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sup.researchInterests.map(r => (
                      <Badge key={r} variant="secondary" className="ds-caption">{r}</Badge>
                    ))}
                  </div>
                )}
                {sup.about && (
                  <p className="ds-small text-muted-foreground line-clamp-3">{sup.about}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <p className="ds-label">About this topic</p>
          <p className="ds-small text-muted-foreground leading-relaxed">{topic.description}</p>
        </div>
      </div>

      {/* Bookmark action */}
      <div className="border-t border-border p-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleBookmark(topic.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 ds-label transition-colors ${
            isBookmarked
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-foreground hover:bg-secondary'
          }`}
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="size-4" />
              Bookmarked
            </>
          ) : (
            <>
              <Bookmark className="size-4" />
              Bookmark this topic
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  )
}
