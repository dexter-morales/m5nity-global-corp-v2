import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { currency, Product } from './ProductCard'
import React from 'react'
import { Trash2, CreditCard } from 'lucide-react'

export type CartItem = { product: Product; quantity: number }

type Props = {
  items: CartItem[]
  onUpdateQty: (productId: number, qty: number) => void
  onRemove: (productId: number) => void
  onClear: () => void
  onCheckout: () => void
  total: number
  disabled?: boolean
  className?: string
  state?: 'idle' | 'processing' | 'success'
}

const CartPanel: React.FC<Props> = ({ items, onUpdateQty, onRemove, onClear, onCheckout, total, disabled, className, state = 'idle' }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <Card className={`flex h-full flex-col rounded-2xl shadow-sm ${className ?? ''}`}>
      <CardHeader className="p-4">
        <div className="text-lg font-semibold text-slate-800">Cart</div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No items yet. Add products from the catalog.</p>) : (
          items.map(({ product, quantity }) => (
            <div key={product.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 transition-all duration-200 ease-out">
              <div>
                <div className="text-sm font-medium text-slate-800">{product.name}</div>
                <div className="text-xs text-slate-500">{product.sku}</div>
              </div>
              <div className="text-right text-sm text-slate-600">{currency(product.price)}</div>
              <div>
                <Input
                  type="number"
                  min={0}
                  value={quantity}
                  className="w-20 text-right"
                  onChange={(e) => {
                    const val = parseInt(e.target.value || '0', 10)
                    onUpdateQty(product.id, isNaN(val) ? 0 : val)
                  }}
                />
              </div>
              <div className="text-right text-sm font-semibold text-slate-800">{currency(product.price * quantity)}</div>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-white p-4">
        <div className="text-lg font-semibold text-slate-800">Total: {currency(total)}</div>
        <div className="flex gap-2">
          <Button variant="destructive" className="gap-2" onClick={onClear} disabled={disabled || items.length === 0}>
            <Trash2 className="size-4" /> Clear Cart
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={disabled || items.length === 0}>
                <CreditCard className="size-4" /> {state === 'processing' ? 'Processing…' : state === 'success' ? 'Success' : 'Proceed to Payment'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-slate-600">
                You are about to charge a total of <span className="font-semibold text-slate-800">{currency(total)}</span>.
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)} disabled={disabled}>Cancel</Button>
                <Button onClick={() => { setOpen(false); onCheckout(); }} disabled={disabled}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CartPanel
