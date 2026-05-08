import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Restaurant, Category, Product, Table, Order } from '@/types'

// Demo data
const DEMO_RESTAURANT: Restaurant = {
  id: 'demo-restaurant',
  name: 'Bistrô Digital',
  slug: 'bistro-digital',
  description: 'Restaurante premium com cardápio digital',
  logo_url: null,
  cover_url: null,
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 99999-9999',
  owner_id: 'demo-user-id',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', restaurant_id: 'demo-restaurant', name: 'Entradas', description: 'Aperitivos e entradas', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2', restaurant_id: 'demo-restaurant', name: 'Pratos Principais', description: 'Nossos melhores pratos', sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-3', restaurant_id: 'demo-restaurant', name: 'Sobremesas', description: 'Doces e sobremesas', sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-4', restaurant_id: 'demo-restaurant', name: 'Bebidas', description: 'Bebidas e drinks', sort_order: 4, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-5', restaurant_id: 'demo-restaurant', name: 'Combos', description: 'Combos especiais', sort_order: 5, is_active: true, created_at: new Date().toISOString() },
]

const DEMO_PRODUCTS: Product[] = [
  { id: 'prod-1', restaurant_id: 'demo-restaurant', category_id: 'cat-1', name: 'Bruschetta Italiana', description: 'Pão italiano crocante com tomate fresco, manjericão e azeite extra virgem', price: 28.90, image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-2', restaurant_id: 'demo-restaurant', category_id: 'cat-1', name: 'Carpaccio de Salmão', description: 'Fatias finas de salmão fresco com alcaparras e molho de limão siciliano', price: 42.90, image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-3', restaurant_id: 'demo-restaurant', category_id: 'cat-1', name: 'Ceviche Premium', description: 'Peixe branco marinado em limão com cebola roxa, coentro e pimenta', price: 38.90, image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-4', restaurant_id: 'demo-restaurant', category_id: 'cat-2', name: 'Filé Mignon ao Molho Madeira', description: 'Filé mignon grelhado com molho madeira, arroz branco e legumes salteados', price: 78.90, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-5', restaurant_id: 'demo-restaurant', category_id: 'cat-2', name: 'Salmão Grelhado', description: 'Salmão grelhado com risoto de limão siciliano e aspargos', price: 72.90, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-6', restaurant_id: 'demo-restaurant', category_id: 'cat-2', name: 'Risoto de Cogumelos', description: 'Risoto cremoso com mix de cogumelos frescos e parmesão', price: 56.90, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-7', restaurant_id: 'demo-restaurant', category_id: 'cat-2', name: 'Picanha na Brasa', description: 'Picanha premium grelhada na brasa com farofa, vinagrete e arroz', price: 89.90, image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-8', restaurant_id: 'demo-restaurant', category_id: 'cat-3', name: 'Petit Gâteau', description: 'Bolinho de chocolate quente com sorvete de baunilha artesanal', price: 32.90, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-9', restaurant_id: 'demo-restaurant', category_id: 'cat-3', name: 'Cheesecake de Frutas Vermelhas', description: 'Cheesecake cremoso com calda de frutas vermelhas frescas', price: 28.90, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-10', restaurant_id: 'demo-restaurant', category_id: 'cat-4', name: 'Suco Natural', description: 'Suco natural de laranja, abacaxi, manga ou morango', price: 14.90, image_url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-11', restaurant_id: 'demo-restaurant', category_id: 'cat-4', name: 'Caipirinha Artesanal', description: 'Caipirinha de limão, maracujá ou frutas vermelhas', price: 24.90, image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-12', restaurant_id: 'demo-restaurant', category_id: 'cat-4', name: 'Vinho Tinto Reserva', description: 'Taça de vinho tinto reserva selecionado pelo sommelier', price: 35.90, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop', is_available: true, is_featured: false, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-13', restaurant_id: 'demo-restaurant', category_id: 'cat-5', name: 'Combo Executivo', description: 'Prato principal + bebida + sobremesa com 15% de desconto', price: 59.90, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', is_available: true, is_featured: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const DEMO_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `table-${i + 1}`,
  restaurant_id: 'demo-restaurant',
  number: i + 1,
  name: `Mesa ${i + 1}`,
  qr_code_url: null,
  is_active: true,
  is_occupied: i < 4,
  created_at: new Date().toISOString(),
}))

const generateDemoOrders = (): Order[] => {
  const statuses: Array<'new' | 'preparing' | 'ready' | 'delivered'> = ['new', 'preparing', 'ready', 'delivered']
  return Array.from({ length: 8 }, (_, i) => {
    const status = statuses[i % 4]
    const tableIndex = i % 4
    const items = [
      { id: `item-${i}-1`, order_id: `order-${i}`, product_id: DEMO_PRODUCTS[i % DEMO_PRODUCTS.length].id, quantity: 1 + (i % 3), unit_price: DEMO_PRODUCTS[i % DEMO_PRODUCTS.length].price, notes: null, product: DEMO_PRODUCTS[i % DEMO_PRODUCTS.length] },
      { id: `item-${i}-2`, order_id: `order-${i}`, product_id: DEMO_PRODUCTS[(i + 3) % DEMO_PRODUCTS.length].id, quantity: 1, unit_price: DEMO_PRODUCTS[(i + 3) % DEMO_PRODUCTS.length].price, notes: i % 2 === 0 ? 'Sem cebola' : null, product: DEMO_PRODUCTS[(i + 3) % DEMO_PRODUCTS.length] },
    ]
    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    const minutesAgo = i * 12 + Math.floor(Math.random() * 10)
    return {
      id: `order-${i}`,
      restaurant_id: 'demo-restaurant',
      table_id: DEMO_TABLES[tableIndex].id,
      customer_name: ['João', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Julia', 'Lucas', 'Laura'][i],
      status,
      notes: i === 0 ? 'Alergia a glúten' : null,
      total,
      created_at: new Date(Date.now() - minutesAgo * 60000).toISOString(),
      updated_at: new Date(Date.now() - (minutesAgo - 5) * 60000).toISOString(),
      table: DEMO_TABLES[tableIndex],
      items,
    }
  })
}

interface RestaurantContextType {
  restaurant: Restaurant | null
  categories: Category[]
  products: Product[]
  tables: Table[]
  orders: Order[]
  loading: boolean
  setRestaurant: (r: Restaurant) => void
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  setTables: React.Dispatch<React.SetStateAction<Table[]>>
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addProduct: (prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addTable: (table: Omit<Table, 'id' | 'created_at'>) => void
  updateTable: (id: string, data: Partial<Table>) => void
  deleteTable: (id: string) => void
  updateOrderStatus: (orderId: string, status: string) => void
  refreshOrders: () => void
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined)

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (isDemo) {
      setRestaurant(DEMO_RESTAURANT)
      setCategories(DEMO_CATEGORIES)
      setProducts(DEMO_PRODUCTS)
      setTables(DEMO_TABLES)
      setOrders(generateDemoOrders())
      setLoading(false)
      return
    }

    loadRestaurantData()
  }, [user, isDemo])

  // Realtime subscription for orders
  useEffect(() => {
    if (!restaurant || isDemo) return

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurant.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          loadOrderWithItems(payload.new.id)
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [restaurant, isDemo])


  const loadRestaurantData = async () => {
    try {
      let { data: rest, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle()
      
      if (!rest && !error) {
        const { data: newRest, error: createError } = await supabase
          .from('restaurants')
          .insert({
            name: 'Meu Restaurante Digital',
            slug: `restaurante-${user!.id.slice(0, 5)}`,
            owner_id: user!.id,
            is_active: true
          })
          .select()
          .single()
        
        if (createError) throw createError
        rest = newRest
      }
      
      if (rest) {
        setRestaurant(rest)
        const [cats, prods, tbls, ords] = await Promise.all([
          supabase.from('categories').select('*').eq('restaurant_id', rest.id).order('sort_order'),
          supabase.from('products').select('*, category:categories(*)').eq('restaurant_id', rest.id).order('sort_order'),
          supabase.from('tables').select('*').eq('restaurant_id', rest.id).order('number'),
          supabase.from('orders').select('*, table:tables(*), items:order_items(*, product:products(*))').eq('restaurant_id', rest.id).order('created_at', { ascending: false }).limit(50),
        ])
        setCategories(cats.data || [])
        setProducts(prods.data || [])
        setTables(tbls.data || [])
        setOrders(ords.data || [])
      }
    } catch (err) {
      console.error('Error loading restaurant data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadOrderWithItems = async (orderId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*, table:tables(*), items:order_items(*, product:products(*))')
      .eq('id', orderId)
      .single()
    if (data) {
      setOrders(prev => [data, ...prev])
    }
  }

  const addCategory = (cat: Omit<Category, 'id' | 'created_at'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}`, created_at: new Date().toISOString() }
    setCategories(prev => [...prev, newCat])
    if (!isDemo) {
      supabase.from('categories').insert(cat).then()
    }
  }

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    if (!isDemo) {
      supabase.from('categories').update(data).eq('id', id).then()
    }
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    setProducts(prev => prev.filter(p => p.category_id !== id))
    if (!isDemo) {
      supabase.from('categories').delete().eq('id', id).then()
    }
  }

  const addProduct = (prod: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const newProd: Product = { ...prod, id: `prod-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    setProducts(prev => [...prev, newProd])
    if (!isDemo) {
      supabase.from('products').insert(prod).then()
    }
  }

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
    if (!isDemo) {
      supabase.from('products').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).then()
    }
  }

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    if (!isDemo) {
      supabase.from('products').delete().eq('id', id).then()
    }
  }

  const addTable = (table: Omit<Table, 'id' | 'created_at'>) => {
    const newTable: Table = { ...table, id: `table-${Date.now()}`, created_at: new Date().toISOString() }
    setTables(prev => [...prev, newTable])
    if (!isDemo) {
      supabase.from('tables').insert(table).then()
    }
  }

  const updateTable = (id: string, data: Partial<Table>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    if (!isDemo) {
      supabase.from('tables').update(data).eq('id', id).then()
    }
  }

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id))
    if (!isDemo) {
      supabase.from('tables').delete().eq('id', id).then()
    }
  }

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any, updated_at: new Date().toISOString() } : o))
    if (!isDemo) {
      supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).then()
    }
  }

  const refreshOrders = () => {
    if (isDemo) {
      setOrders(generateDemoOrders())
    } else {
      loadRestaurantData()
    }
  }

  return (
    <RestaurantContext.Provider value={{
      restaurant, categories, products, tables, orders, loading,
      setRestaurant, setCategories, setProducts, setTables, setOrders,
      addCategory, updateCategory, deleteCategory,
      addProduct, updateProduct, deleteProduct,
      addTable, updateTable, deleteTable,
      updateOrderStatus, refreshOrders,
    }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider')
  return context
}
