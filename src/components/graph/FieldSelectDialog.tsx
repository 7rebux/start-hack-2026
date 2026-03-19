import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fields, topicsForField } from '@/data/index'
import { useAppStore } from '@/store/useAppStore'
import { groupTopicsWithAI } from '@/lib/groupTopicsWithAI'

interface FieldSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FieldSelectDialog({ open, onOpenChange }: FieldSelectDialogProps) {
  const store = useAppStore()

  async function handleSelectField(fieldId: string) {
    onOpenChange(false)

    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    // Create the field node immediately (shows with loading spinner)
    store.addFieldEntry(fieldId, field.name)

    try {
      const topics = topicsForField(fieldId)
      const rawGroups = await groupTopicsWithAI(topics, field.name)
      // Prefix group IDs with fieldId to ensure uniqueness across multiple fields
      const groups = rawGroups.map((g, i) => ({ ...g, id: `${fieldId}-${i}` }))
      store.setFieldEntryGroups(fieldId, groups)
    } catch (err) {
      console.error('Failed to group topics:', err)
      store.setFieldEntryGroups(fieldId, [])
    } finally {
      store.setFieldEntryLoading(fieldId, false)
    }
  }

  // Filter out already-added fields
  const addedFieldIds = store.fieldEntries.map(e => e.fieldId)
  const availableFields = fields.filter(f => !addedFieldIds.includes(f.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a field of interest</DialogTitle>
        </DialogHeader>
        {availableFields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">All fields have been added.</p>
        ) : (
          <div className="flex flex-col gap-1 mt-2">
            {availableFields.map(field => (
              <button
                key={field.id}
                onClick={() => handleSelectField(field.id)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
              >
                {field.name}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
