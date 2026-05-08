import { useState } from 'react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, getStatusLabel, cn } from '@/lib/utils'
import { Search, Filter, ClipboardList, Utensils, Clock } from 'lucide-react'
import type { OrderStatus } from '@/types'

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useRestaurant()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = orders.filter(o => {
    const ms = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.table?.number.toString().includes(search)
    const sf = statusFilter === 'all' || o.status === statusFilter
    return ms && sf
  })

  const statusBadge = (s: string) => {
    const v: Record<string, 'default' | 'warning' | 'success' | 'secondary'> = { new: 'default', preparing: 'warning', ready: 'success', delivered: 'secondary' }
    return v[s] || 'secondary'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold">Pedidos</h1><p className="text-muted-foreground mt-1">Histórico e gerenciamento de pedidos</p></div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por cliente ou mesa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'new', 'preparing', 'ready', 'delivered'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className="whitespace-nowrap">
              {s === 'all' ? 'Todos' : getStatusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.customer_name || `Pedido #${order.id.slice(-4)}`}</span>
                      <Badge variant={statusBadge(order.status)}>{getStatusLabel(order.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Mesa {order.table?.number} • {formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.items?.length} itens</p>
                  </div>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      className="h-9 rounded-lg border border-input bg-background/50 px-2 text-sm"
                    >
                      <option value="new">Novo</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Pronto</option>
                      <option value="delivered">Entregue</option>
                    </select>
                  )}
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-2">
                  {order.items.map(item => (
                    <span key={item.id} className="text-xs bg-accent rounded-lg px-2 py-1">{item.quantity}x {item.product?.name}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16"><ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Nenhum pedido encontrado</p></div>
        )}
      </div>
    </div>
  )
}
