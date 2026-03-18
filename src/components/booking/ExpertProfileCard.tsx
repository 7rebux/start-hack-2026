import { Clock, Video } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Expert, Company, Field } from "@/types/booking"

interface ExpertProfileCardProps {
  expert: Expert
  company: Company
  fields: Field[]
}

export function ExpertProfileCard({ expert, company, fields }: ExpertProfileCardProps) {
  const initials = expert.firstName[0] + expert.lastName[0]

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar + name */}
      <div className="flex flex-col gap-3">
        <Avatar size="lg" className="size-16">
          <AvatarFallback className="ds-title-sm">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="ds-title-md">{expert.firstName} {expert.lastName}</h1>
          <p className="ds-small text-muted-foreground">{expert.title}</p>
          <p className="ds-small text-muted-foreground">{company.name}</p>
        </div>
      </div>

      {/* Booking meta */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 ds-small text-muted-foreground">
          <Clock className="size-4 shrink-0" />
          <span>30 minutes</span>
        </div>
        <div className="flex items-center gap-2 ds-small text-muted-foreground">
          <Video className="size-4 shrink-0" />
          <span>Video call</span>
        </div>
      </div>

      {/* AI interview callout */}
      {expert.offerInterviews && (
        <div className="rounded-lg border border-ai bg-blue-50/50 px-4 py-3">
          <p className="ds-label text-ai-solid">Open to interviews</p>
          <p className="ds-caption text-muted-foreground mt-0.5">
            This expert is happy to chat with students about thesis topics, career paths, and opportunities.
          </p>
        </div>
      )}

      {/* About */}
      {expert.about && (
        <div>
          <p className="ds-label mb-1">About</p>
          <p className="ds-small text-muted-foreground">{expert.about}</p>
        </div>
      )}

      {/* Field badges */}
      {fields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <Badge key={field.id} variant="secondary">{field.name}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}
