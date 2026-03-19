import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GraphNodeProps {
  id: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
  isSelected: boolean
  isDisabled: boolean
  isTopic?: boolean
  onClick: () => void
  onShake?: () => void
}

export const nodeVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
}

export function GraphNode({
  label,
  sublabel,
  icon,
  isSelected,
  isDisabled,
  isTopic = false,
  onClick,
}: GraphNodeProps) {
  return (
    <motion.div
      variants={nodeVariants}
      onClick={isDisabled ? undefined : onClick}
      animate={{
        backgroundColor: isSelected ? 'var(--foreground)' : 'var(--card)',
        borderColor: isSelected ? 'var(--foreground)' : 'var(--border)',
        color: isSelected ? 'var(--background)' : 'var(--foreground)',
      }}
      whileHover={isDisabled ? {} : { scale: 1.02, transition: { duration: 0.12 } }}
      whileTap={isDisabled ? {} : { scale: 0.97, transition: { duration: 0.08 } }}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative flex flex-col justify-center rounded-xl border px-4 py-3 select-none',
        'w-[200px] min-h-[68px]',
        isTopic ? 'cursor-pointer' : 'cursor-pointer',
        isDisabled && 'pointer-events-none opacity-35',
        !isDisabled && 'shadow-sm'
      )}
    >
      {icon && (
        <div className="mb-1.5">
          {icon}
        </div>
      )}
      <p
        className={cn('ds-label leading-tight', isSelected ? 'text-[var(--background)]' : '')}
        style={{ color: isSelected ? 'var(--background)' : undefined }}
      >
        {label}
      </p>
      {sublabel && (
        <p
          className="ds-caption mt-0.5 leading-tight"
          style={{ color: isSelected ? 'oklch(0.7 0 0)' : 'var(--muted-foreground)' }}
        >
          {sublabel}
        </p>
      )}
    </motion.div>
  )
}

// Larger pathway node variant
interface PathwayNodeProps {
  label: string
  description: string
  icon: React.ReactNode
  isSelected: boolean
  onClick: () => void
}

export function PathwayNode({ label, description, icon, isSelected, onClick }: PathwayNodeProps) {
  return (
    <motion.div
      onClick={onClick}
      animate={{
        backgroundColor: isSelected ? 'var(--foreground)' : 'var(--card)',
        borderColor: isSelected ? 'var(--foreground)' : 'var(--border)',
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.08 } }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex w-[200px] cursor-pointer flex-col gap-2 rounded-xl border px-4 py-4 select-none shadow-sm',
      )}
    >
      <div
        className="flex size-9 items-center justify-center rounded-lg"
        style={{
          backgroundColor: isSelected ? 'oklch(0.3 0 0)' : 'var(--secondary)',
        }}
      >
        <div style={{ color: isSelected ? 'var(--background)' : 'var(--muted-foreground)' }}>
          {icon}
        </div>
      </div>
      <div>
        <p
          className="ds-label"
          style={{ color: isSelected ? 'var(--background)' : 'var(--foreground)' }}
        >
          {label}
        </p>
        <p
          className="ds-caption mt-0.5"
          style={{ color: isSelected ? 'oklch(0.7 0 0)' : 'var(--muted-foreground)' }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  )
}
