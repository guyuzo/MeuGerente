import { Badge } from '../../ui/Badge'
import { STATUS_META, ATRASADO_META } from './constants'
import { isAtrasado } from './utils'

export function StatusBadge({ item, hojeISO }) {
  const meta = isAtrasado(item, hojeISO) ? ATRASADO_META : STATUS_META[item.status]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
