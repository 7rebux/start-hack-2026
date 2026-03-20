import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/useAppStore'
import { universities, programsForUniversity, universityById, fields, degreeLabel } from '@/data/index'
import { suggestFields } from '@/lib/suggestFields'
import studyondLogo from '@/assets/studyond.svg'
import heroBg from '@/assets/hero.png'

export function OnboardingPage() {
  const {
    selectedUniversityId,
    selectedProgramId,
    setUniversityId,
    setProgramId,
    enterGraph,
    suggestionsLoading,
    setSuggestedFieldIds,
    setSuggestionsLoading,
  } = useAppStore()

  const filteredPrograms = selectedUniversityId
    ? programsForUniversity(selectedUniversityId)
    : []

  const canProceed = !!selectedUniversityId && !!selectedProgramId

  async function handleProgramChange(programId: string) {
    setProgramId(programId)
    if (!selectedUniversityId) return

    const program = filteredPrograms.find(p => p.id === programId)
    if (!program) return

    setSuggestionsLoading(true)
    try {
      const universityName = universityById[selectedUniversityId]?.name ?? selectedUniversityId
      const ids = await suggestFields(
        program.name,
        degreeLabel(program.degree),
        universityName,
        fields.map(f => f.name),
        fields.map(f => f.id),
      )
      setSuggestedFieldIds(ids)
    } catch {
      setSuggestedFieldIds([])
    } finally {
      setSuggestionsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
      />

      {/* Logo top-left */}
      <div className="absolute left-6 top-6">
        <img src={studyondLogo} alt="Studyond" className="h-6" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md space-y-8"
      >
        {/* Heading */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            <span className="ds-caption">Switzerland · Thesis Discovery</span>
          </div>
          <h1 className="ds-title-xl">
            Find your{' '}
            <span className="text-ai">perfect thesis</span>
          </h1>
          <p className="ds-body text-muted-foreground">
            Tell us where you study and we'll build a personalised graph of thesis opportunities just for you.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* University */}
          <div className="space-y-2">
            <Label htmlFor="university" className="ds-label">
              Your university
            </Label>
            <Select
              value={selectedUniversityId ?? ''}
              onValueChange={setUniversityId}
            >
              <SelectTrigger id="university" className="h-11 w-full">
                <SelectValue placeholder="Select your university…" />
              </SelectTrigger>
              <SelectContent>
                {universities.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Study programme — revealed after university selection */}
          <AnimatePresence>
            {selectedUniversityId && (
              <motion.div
                key="program-select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                <Label htmlFor="program" className="ds-label flex items-center gap-2">
                  Your study programme
                  {suggestionsLoading && (
                    <Sparkles className="size-3.5 animate-pulse text-amber-500" />
                  )}
                </Label>
                <Select
                  value={selectedProgramId ?? ''}
                  onValueChange={handleProgramChange}
                >
                  <SelectTrigger id="program" className="h-11 w-full">
                    <SelectValue placeholder="Select your programme…" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPrograms.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span>{p.name}</span>
                        <span className="ml-2 text-muted-foreground uppercase ds-caption">
                          {p.degree}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Button
                size="lg"
                className="w-full h-12 rounded-xl text-base font-medium"
                onClick={enterGraph}
              >
                Explore thesis graph
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer hint */}
        <p className="ds-caption text-center text-muted-foreground/60">
          Navigate the graph to discover supervisors, companies, and thesis topics.
        </p>
      </motion.div>
    </div>
  )
}
