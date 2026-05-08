import { useState } from 'react'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Plus, Edit2, Trash2, QrCode, Grid3X3, Users } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { Table } from '@/types'

export default function TablesPage() {
  const { tables, restaurant, addTable, updateTable, deleteTable } = useRestaurant()
  const [dialog, setDialog] = useState(false)
  const [qrDialog, setQrDialog] = useState(false)
  const [editing, setEditing] = useState<Table | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [form, setForm] = useState({ number: '', name: '' })

  const openDialog = (t?: Table) => {
    if (t) { setEditing(t); setForm({ number: t.number.toString(), name: t.name }) }
    else { setEditing(null); setForm({ number: (tables.length + 1).toString(), name: `Mesa ${tables.length + 1}` }) }
    setDialog(true)
  }

  const save = () => {
    const data = { restaurant_id: restaurant?.id || 'demo-restaurant', number: parseInt(form.number), name: form.name, qr_code_url: null, is_active: true, is_occupied: false }
    if (editing) updateTable(editing.id, data)
    else addTable(data)
    setDialog(false)
  }

  const menuUrl = (table: Table) => {
    // Se estiver na Vercel, usa o domínio atual, caso contrário tenta pegar do env ou localhost
    const baseUrl = window.location.origin
    return `${baseUrl}/r/${restaurant?.slug || 'demo'}/mesa/${table.number}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mesas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as mesas e QR Codes</p>
        </div>
        <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Nova Mesa</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map(table => (
          <Card key={table.id} className={cn("hover-lift cursor-pointer transition-all", table.is_occupied && "border-primary/50 bg-primary/5")}>
            <CardContent className="p-4 text-center space-y-3">
              <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold transition-colors", table.is_occupied ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground")}>
                {table.number}
              </div>
              <div>
                <p className="font-medium text-sm">{table.name}</p>
                <Badge variant={table.is_occupied ? 'default' : 'secondary'} className="mt-1 text-xs">
                  {table.is_occupied ? 'Ocupada' : 'Livre'}
                </Badge>
              </div>
              <div className="flex gap-1 justify-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedTable(table); setQrDialog(true) }}>
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(table)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTable(table.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Mesa' : 'Nova Mesa'}</DialogTitle>
            <DialogDescription>Configure os dados da mesa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Número</Label><Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog} onOpenChange={setQrDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>{selectedTable?.name} - QR Code</DialogTitle>
            <DialogDescription>Escaneie para acessar o cardápio</DialogDescription>
          </DialogHeader>
          {selectedTable && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG value={menuUrl(selectedTable)} size={200} level="H" />
              </div>
              <p className="text-xs text-muted-foreground break-all">{menuUrl(selectedTable)}</p>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(menuUrl(selectedTable))}>Copiar link</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
