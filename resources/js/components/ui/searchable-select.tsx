import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type Option = { value: string; label: string }

type Props = {
  items: Option[]
  value?: string | null
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  contentClassName?: string
  searchablePlaceholder?: string
  includeAutoOption?: boolean
  autoValue?: string
}

// A small wrapper around shadcn Select that adds a search box
// inside the dropdown. Uses Input for consistent styling.
export function SearchableSelect({
  items,
  value,
  onValueChange,
  placeholder = 'Select…',
  className,
  contentClassName,
  searchablePlaceholder = 'Search…',
  includeAutoOption = true,
  autoValue = '__AUTO__',
}: Props) {
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return items
    return items.filter((i) => i.label.toLowerCase().includes(q))
  }, [items, query])

  const selectValue = value && value !== '' ? value : includeAutoOption ? autoValue : undefined

  const handleChange = (v: string) => {
    if (includeAutoOption && v === autoValue) {
      onValueChange('')
    } else {
      onValueChange(v)
    }
  }

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          'bg-white border-slate-300 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50',
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn('p-1', contentClassName)}>
        <div className="p-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchablePlaceholder}
            className="h-8"
          />
        </div>
        {includeAutoOption && (
          <SelectItem value={autoValue}>{placeholder}</SelectItem>
        )}
        {filtered.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
        {filtered.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No results</div>
        )}
      </SelectContent>
    </Select>
  )
}

