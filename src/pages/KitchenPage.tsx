import { useState } from 'react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatRelativeTime, getStatusLabel, cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { ChefHat, Clock, CheckCircle2, Truck, ArrowRight, RefreshCw, Utensils, AlertCircle } from 'lucide-react'

const COLUMNS: { status: OrderStatus; label: string; icon: any; color: string }[] = [
  { status: 'new', label: 'Novo', icon: AlertCircle, color: 'from-blue-500 to-blue-600' },
  { status: 'preparing', label: 'Preparando', icon: ChefHat, color: 'from-amber-500 to-orange-600' },
  { status: 'ready', label: 'Pronto', icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
  { status: 'delivered', label: 'Entregue', icon: Truck, color: 'from-gray-500 to-gray-600' },
]

function getNextStatus(s: OrderStatus): OrderStatus | null {
  const f: Record<OrderStatus, OrderStatus | null> = { new: 'preparing', preparing: 'ready', ready: 'delivered', delivered: null, cancelled: null }
  return f[s]
}

export default function KitchenPage() {
  const { orders, updateOrderStatus, refreshOrders } = useRestaurant()
  const [animId, setAnimId] = useState<string | null>(null)

  const move = (id: string, next: OrderStatus) => {
    setAnimId(id)
    setTimeout(() => { updateOrderStatus(id, next); setAnimId(null) }, 300)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><ChefHat className="w-8 h-8 text-primary" />Painel da Cozinha</h1>
          <p className="text-muted-foreground mt-1">Gerencie os pedidos em tempo real</p>
        </div>
        <Button variant="outline" onClick={refreshOrders}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[calc(100vh-200px)]">
        {COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.status)
          return (
            <div key={col.status} className="flex flex-col">
              <div className={cn("flex items-center justify-between p-3 rounded-t-xl bg-gradient-to-r", col.color)}>
                <div className="flex items-center gap-2 text-white"><col.icon className="w-5 h-5" /><span className="font-semibold">{col.label}</span></div>
                <div className="w-7 h-7 rounded-full bg-white/20 text-white text-sm font-bold flex items-center justify-center">{colOrders.length}</div>
              </div>
              <div className="flex-1 bg-accent/20 rounded-b-xl p-3 space-y-3 border border-t-0 border-border/30 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colOrders.map(order => {
                  const next = getNextStatus(order.status)
                  return (
                    <Card key={order.id} className={cn("transition-all duration-300 hover:shadow-lg", animId === order.id && "scale-95 opacity-50", order.status === 'new' && "border-blue-500/30 animate-pulse-soft")}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Utensils className="w-4 h-4 text-primary" /></div>
                            <div><span className="text-sm font-bold">Mesa {order.table?.number}</span><p className="text-xs text-muted-foreground">{order.customer_name || `#${order.id.slice(-4)}`}</p></div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{formatRelativeTime(order.created_at)}</div>
                        </div>
                        <div className="space-y-1.5">
                          {order.items?.map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 rounded bg-accent text-xs font-bold flex items-center justify-center">{item.quantity}</span>
                              <span className="truncate max-w-[150px]">{item.product?.name}</span>
                            </div>
                          ))}
                        </div>
                        {order.notes && <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><p className="text-xs text-amber-400">⚠️ {order.notes}</p></div>}
                        {next && <Button size="sm" className="w-full" variant={order.status === 'new' ? 'default' : 'outline'} onClick={() => move(order.id, next)}>{getStatusLabel(next)}<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                      </CardContent>
                    </Card>
                  )
                })}
                {colOrders.length === 0 && <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50"><col.icon className="w-10 h-10 mb-2" /><p className="text-xs">Nenhum pedido</p></div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
