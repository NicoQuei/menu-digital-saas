import { useMemo } from 'react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime, getStatusLabel } from '@/lib/utils'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Users,
} from 'lucide-react'

export default function DashboardPage() {
  const { orders, products, tables, restaurant } = useRestaurant()

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders.filter(o => new Date(o.created_at) >= today)
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
    const activeOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing').length
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    return {
      totalOrders: orders.length,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
      activeOrders,
      avgOrderValue,
      occupiedTables: tables.filter(t => t.is_occupied).length,
      totalTables: tables.length,
      totalProducts: products.length,
    }
  }, [orders, tables, products])

  const recentOrders = orders.slice(0, 5)

  const statCards = [
    {
      title: 'Receita Hoje',
      value: formatCurrency(stats.todayRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      shadowColor: 'shadow-green-500/20',
    },
    {
      title: 'Pedidos Hoje',
      value: stats.todayOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'from-purple-500 to-violet-600',
      shadowColor: 'shadow-purple-500/20',
    },
    {
      title: 'Pedidos Ativos',
      value: stats.activeOrders.toString(),
      change: 'Em tempo real',
      trend: 'neutral',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(stats.avgOrderValue),
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      shadowColor: 'shadow-blue-500/20',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do {restaurant?.name || 'seu restaurante'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover-lift overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-400" />}
                    {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                    <span className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-400' : 
                      stat.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadowColor}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Utensils className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {order.customer_name || `Pedido #${order.id.slice(-4)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mesa {order.table?.number} • {formatRelativeTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      order.status === 'new' ? 'default' :
                      order.status === 'preparing' ? 'warning' :
                      order.status === 'ready' ? 'success' : 'secondary'
                    }>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Status das Mesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold">{stats.occupiedTables}/{stats.totalTables}</span>
                <span className="text-sm text-muted-foreground">ocupadas</span>
              </div>
              <div className="w-full bg-accent rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${(stats.occupiedTables / Math.max(stats.totalTables, 1)) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {tables.slice(0, 8).map((table) => (
                  <div
                    key={table.id}
                    className={`flex items-center justify-center h-10 rounded-lg text-xs font-bold transition-all ${
                      table.is_occupied
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-accent text-muted-foreground'
                    }`}
                  >
                    {table.number}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
              <p className="text-sm text-muted-foreground mt-1">itens no cardápio</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
