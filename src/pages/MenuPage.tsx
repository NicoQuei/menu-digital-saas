import { useState } from 'react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import {
  Plus, Edit2, Trash2, Search, FolderOpen, Package,
  GripVertical, Star, Eye, EyeOff, ImagePlus,
} from 'lucide-react'
import type { Category, Product } from '@/types'

export default function MenuPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct } = useRestaurant()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [prodForm, setProdForm] = useState({
    name: '', description: '', price: '', category_id: '', image_url: '', is_available: true, is_featured: false,
  })

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !selectedCategory || p.category_id === selectedCategory
    return matchSearch && matchCategory
  })

  const openCategoryDialog = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat)
      setCatForm({ name: cat.name, description: cat.description || '' })
    } else {
      setEditingCategory(null)
      setCatForm({ name: '', description: '' })
    }
    setCategoryDialog(true)
  }

  const saveCategoryForm = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, { name: catForm.name, description: catForm.description || null })
    } else {
      addCategory({
        restaurant_id: 'demo-restaurant',
        name: catForm.name,
        description: catForm.description || null,
        sort_order: categories.length + 1,
        is_active: true,
      })
    }
    setCategoryDialog(false)
  }

  const openProductDialog = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod)
      setProdForm({
        name: prod.name,
        description: prod.description || '',
        price: prod.price.toString(),
        category_id: prod.category_id,
        image_url: prod.image_url || '',
        is_available: prod.is_available,
        is_featured: prod.is_featured,
      })
    } else {
      setEditingProduct(null)
      setProdForm({
        name: '', description: '', price: '',
        category_id: categories[0]?.id || '',
        image_url: '', is_available: true, is_featured: false,
      })
    }
    setProductDialog(true)
  }

  const saveProductForm = () => {
    const data = {
      restaurant_id: 'demo-restaurant',
      name: prodForm.name,
      description: prodForm.description || null,
      price: parseFloat(prodForm.price) || 0,
      category_id: prodForm.category_id,
      image_url: prodForm.image_url || null,
      is_available: prodForm.is_available,
      is_featured: prodForm.is_featured,
      sort_order: products.length + 1,
    }
    if (editingProduct) {
      updateProduct(editingProduct.id, data)
    } else {
      addProduct(data)
    }
    setProductDialog(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cardápio</h1>
          <p className="text-muted-foreground mt-1">Gerencie categorias e produtos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCategoryDialog()}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
          <Button onClick={() => openProductDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {categories.map(cat => (
          <Card key={cat.id} className="hover-lift">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.category_id === cat.id).length} produtos
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCategoryDialog(cat)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCategory(cat.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden hover-lift group">
            <div className="relative aspect-[4/3] bg-accent overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              {product.is_featured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-amber-500/90 text-white border-0">
                    <Star className="w-3 h-3 mr-1" /> Destaque
                  </Badge>
                </div>
              )}
              {!product.is_available && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="destructive">Indisponível</Badge>
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button size="icon" variant="secondary" className="h-8 w-8 bg-card/80 backdrop-blur-sm" onClick={() => openProductDialog(product)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 bg-card/80 backdrop-blur-sm text-destructive" onClick={() => deleteProduct(product.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categories.find(c => c.id === product.category_id)?.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {search ? 'Tente outro termo de busca' : 'Adicione seu primeiro produto'}
          </p>
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Atualize os dados da categoria' : 'Crie uma nova categoria para organizar seu cardápio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ex: Entradas" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Descrição opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancelar</Button>
            <Button onClick={saveCategoryForm} disabled={!catForm.name}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Atualize os dados do produto' : 'Adicione um novo item ao cardápio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} placeholder="Nome do produto" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} placeholder="Descrição do produto" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço *</Label>
                <Input type="number" step="0.01" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <select
                  value={prodForm.category_id}
                  onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <div className="flex gap-2">
                <Input value={prodForm.image_url} onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })} placeholder="https://..." className="flex-1" />
                <Button variant="outline" size="icon">
                  <ImagePlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={prodForm.is_available} onChange={(e) => setProdForm({ ...prodForm, is_available: e.target.checked })} className="rounded" />
                <span className="text-sm">Disponível</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={prodForm.is_featured} onChange={(e) => setProdForm({ ...prodForm, is_featured: e.target.checked })} className="rounded" />
                <span className="text-sm">Destaque</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog(false)}>Cancelar</Button>
            <Button onClick={saveProductForm} disabled={!prodForm.name || !prodForm.price || !prodForm.category_id}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
