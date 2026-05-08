import { useState, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { formatCurrency, cn } from '@/lib/utils'
import type { Product, CartItem } from '@/types'
import {
  ShoppingBag, Plus, Minus, X, Send, Search,
  Star, Clock, MapPin, ChevronDown, Flame, Check,
} from 'lucide-react'

// Demo data inline for the public page
const DEMO_CATS = [
  { id: 'cat-1', name: 'Entradas', emoji: '🥗' },
  { id: 'cat-2', name: 'Pratos Principais', emoji: '🍽️' },
  { id: 'cat-3', name: 'Sobremesas', emoji: '🍰' },
  { id: 'cat-4', name: 'Bebidas', emoji: '🍹' },
  { id: 'cat-5', name: 'Combos', emoji: '🔥' },
]

const DEMO_PRODS: Product[] = [
  { id: 'p1', restaurant_id: 'r', category_id: 'cat-1', name: 'Bruschetta Italiana', description: 'Pão italiano crocante com tomate fresco, manjericão e azeite extra virgem', price: 28.90, image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'p2', restaurant_id: 'r', category_id: 'cat-1', name: 'Carpaccio de Salmão', description: 'Fatias finas de salmão fresco com alcaparras e molho de limão siciliano', price: 42.90, image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'p3', restaurant_id: 'r', category_id: 'cat-1', name: 'Ceviche Premium', description: 'Peixe branco marinado em limão com cebola roxa e coentro', price: 38.90, image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 3, created_at: '', updated_at: '' },
  { id: 'p4', restaurant_id: 'r', category_id: 'cat-2', name: 'Filé Mignon ao Molho Madeira', description: 'Filé mignon grelhado com molho madeira, arroz e legumes', price: 78.90, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'p5', restaurant_id: 'r', category_id: 'cat-2', name: 'Salmão Grelhado', description: 'Salmão grelhado com risoto de limão siciliano e aspargos', price: 72.90, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'p6', restaurant_id: 'r', category_id: 'cat-2', name: 'Risoto de Cogumelos', description: 'Risoto cremoso com mix de cogumelos frescos e parmesão', price: 56.90, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 3, created_at: '', updated_at: '' },
  { id: 'p7', restaurant_id: 'r', category_id: 'cat-2', name: 'Picanha na Brasa', description: 'Picanha premium grelhada na brasa com farofa e vinagrete', price: 89.90, image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 4, created_at: '', updated_at: '' },
  { id: 'p8', restaurant_id: 'r', category_id: 'cat-3', name: 'Petit Gâteau', description: 'Bolinho de chocolate quente com sorvete de baunilha artesanal', price: 32.90, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'p9', restaurant_id: 'r', category_id: 'cat-3', name: 'Cheesecake', description: 'Cheesecake cremoso com calda de frutas vermelhas frescas', price: 28.90, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'p10', restaurant_id: 'r', category_id: 'cat-4', name: 'Suco Natural', description: 'Laranja, abacaxi, manga ou morango', price: 14.90, image_url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'p11', restaurant_id: 'r', category_id: 'cat-4', name: 'Caipirinha Artesanal', description: 'Limão, maracujá ou frutas vermelhas', price: 24.90, image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'p12', restaurant_id: 'r', category_id: 'cat-5', name: 'Combo Executivo', description: 'Prato principal + bebida + sobremesa com 15% off', price: 59.90, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: '', updated_at: '' },
]

export default function PublicMenuPage() {
  const { slug, tableNumber } = useParams()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [orderSent, setOrderSent] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)

  const products = DEMO_PRODS
  const categories = DEMO_CATS

  const featured = products.filter(p => p.is_featured)

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const mc = !activeCategory || p.category_id === activeCategory
    return ms && mc && p.is_available
  })

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

  const sendOrder = () => {
    setOrderSent(true)
    setTimeout(() => { setCart([]); setCartOpen(false); setOrderSent(false) }, 3000)
  }

  const getCartQty = (productId: string) => cart.find(i => i.product.id === productId)?.quantity || 0

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        <div className="h-48 sm:h-56 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200')] bg-cover bg-center opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary shadow-xl shadow-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold">Bistrô Digital</h1>
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
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Featured */}
        {!search && !activeCategory && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" /> Destaques
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {featured.map(p => {
                const qty = getCartQty(p.id)
                return (
                  <div key={p.id} className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-md transition-all group">
                    <div className="relative h-28 overflow-hidden">
                      <img src={p.image_url!} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
        {(activeCategory ? [categories.find(c => c.id === activeCategory)!] : categories).map(cat => {
          if (!cat) return null
          const catProducts = filtered.filter(p => p.category_id === cat.id)
          if (catProducts.length === 0) return null
          return (
            <div key={cat.id}>
              <h2 className="text-lg font-bold mb-3">{cat.emoji} {cat.name}</h2>
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
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
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
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border/50 max-h-[85vh] flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" />Sua Sacola</h2>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {orderSent ? (
                <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <Check className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Pedido Enviado!</h3>
                  <p className="text-muted-foreground mt-2 text-center">Seu pedido foi enviado para a cozinha. Acompanhe o status na mesa.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seu nome</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Como devemos chamar você?"
                      className="w-full h-10 px-3 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                      {item.product.image_url && <img src={item.product.image_url} className="w-14 h-14 rounded-lg object-cover" alt="" />}
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
                </>
              )}
            </div>

            {!orderSent && cart.length > 0 && (
              <div className="p-4 border-t border-border/30 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">{formatCurrency(cartTotal)}</span></div>
                <button
                  onClick={sendOrder}
                  className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-base shadow-xl shadow-purple-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Pedido • {formatCurrency(cartTotal)}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
