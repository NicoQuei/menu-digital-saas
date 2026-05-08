import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import type { Product, Category, Restaurant, CartItem } from '@/types'
import {
  ShoppingBag, Plus, Minus, X, Send, Search,
  Star, Clock, Flame, Check, AlertCircle, Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PublicMenuPage() {
  const { slug, tableNumber } = useParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [orderSent, setOrderSent] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMenuData()
  }, [slug])

  const loadMenuData = async () => {
    try {
      setLoading(true)
      // 1. Buscar restaurante pelo slug
      const { data: rest, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()

      if (restError || !rest) {
        setError(true)
        return
      }

      setRestaurant(rest)

      // 2. Buscar categorias e produtos
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('*').eq('restaurant_id', rest.id).eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').eq('restaurant_id', rest.id).eq('is_available', true).order('sort_order')
      ])

      setCategories(cats.data || [])
      setProducts(prods.data || [])
    } catch (err) {
      console.error('Error loading menu:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const featured = useMemo(() => products.filter(p => p.is_featured), [products])

  const filtered = useMemo(() => products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const mc = !activeCategory || p.category_id === activeCategory
    return ms && mc
  }), [products, search, activeCategory])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1, notes: '' }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === productId)
      if (existing && existing.quantity > 1) return prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
      return prev.filter(i => i.product.id !== productId)
    })
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const sendOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    try {
      setIsSending(true)
      
      // 1. Buscar a mesa real se tiver número da mesa
      let tableId = null
      if (tableNumber && restaurant) {
        const { data: table } = await supabase
          .from('tables')
          .select('id')
          .eq('restaurant_id', restaurant.id)
          .eq('number', parseInt(tableNumber))
          .single()
        tableId = table?.id
      }

      // 2. Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant!.id,
          table_id: tableId,
          customer_name: customerName,
          total: cartTotal,
          status: 'new'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 3. Criar os itens do pedido
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        notes: item.notes
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      setOrderSent(true)
      setTimeout(() => { 
        setCart([]); 
        setCartOpen(false); 
        setOrderSent(false);
        setCustomerName('')
      }, 4000)
    } catch (err) {
      console.error('Error sending order:', err)
      toast.error('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setIsSending(false)
    }
  }

  const getCartQty = (productId: string) => cart.find(i => i.product.id === productId)?.quantity || 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-xs">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold">Restaurante não encontrado</h1>
          <p className="text-muted-foreground mt-2">O link que você acessou parece estar incorreto ou o restaurante não está ativo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        <div className="h-48 sm:h-56 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 relative overflow-hidden">
          {restaurant.cover_url ? (
            <img src={restaurant.cover_url} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
          ) : (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200')] bg-cover bg-center opacity-20" />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary shadow-xl shadow-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary">
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Flame className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />4.8</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />30-45 min</span>
                  {tableNumber && <span className="flex items-center gap-1 text-primary font-medium">Mesa {tableNumber}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/50 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none" ref={categoriesRef}>
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
              !activeCategory ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            🔥 Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                activeCategory === cat.id ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured */}
        {!search && !activeCategory && featured.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" /> Destaques
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {featured.map(p => {
                const qty = getCartQty(p.id)
                return (
                  <div key={p.id} className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-md transition-all group">
                    <div className="relative h-28 overflow-hidden bg-accent/20">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem foto</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-primary">{formatCurrency(p.price)}</span>
                        {qty > 0 ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => removeFromCart(p.id)} className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold w-4 text-center">{qty}</span>
                            <button onClick={() => addToCart(p)} className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(p)} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 active:scale-90 transition-transform">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Product List */}
        {categories.map(cat => {
          const catProducts = filtered.filter(p => p.category_id === cat.id)
          if (catProducts.length === 0) return null
          return (
            <div key={cat.id}>
              <h2 className="text-lg font-bold mb-3">{cat.name}</h2>
              <div className="space-y-3">
                {catProducts.map(p => {
                  const qty = getCartQty(p.id)
                  return (
                    <div key={p.id} className="flex gap-3 p-3 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-all group">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-base font-bold text-primary">{formatCurrency(p.price)}</span>
                          {qty > 0 ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(p.id)} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 active:scale-90 transition-all"><Minus className="w-4 h-4" /></button>
                              <span className="text-sm font-bold w-5 text-center">{qty}</span>
                              <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 active:scale-90 transition-all"><Plus className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(p)} className="h-8 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all">
                              Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                      {p.image_url && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-accent/20">
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl gradient-primary text-white shadow-2xl shadow-purple-500/30 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{cartCount}</div>
                <span className="font-semibold">Ver sacola</span>
              </div>
              <span className="font-bold text-lg">{formatCurrency(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setCartOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border/50 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" />Sua Sacola</h2>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {orderSent ? (
                <div className="flex flex-col items-center justify-center py-12 animate-fade-in text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <Check className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Pedido Enviado!</h3>
                  <p className="text-muted-foreground mt-2">Seu pedido foi enviado para a cozinha. Agora é só aguardar!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium">Seu nome</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Como devemos chamar você?"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/10">
                        {item.product.image_url ? (
                          <img src={item.product.image_url} className="w-14 h-14 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center text-[10px]">Sem foto</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-sm font-bold text-primary">{formatCurrency(item.product.price * item.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-7 rounded-full bg-accent flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item.product)} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!orderSent && cart.length > 0 && (
              <div className="p-4 border-t border-border/30 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total do pedido</span><span className="font-bold text-lg">{formatCurrency(cartTotal)}</span></div>
                <button
                  onClick={sendOrder}
                  disabled={isSending}
                  className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-base shadow-xl shadow-purple-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSending ? 'Enviando...' : `Confirmar Pedido`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
