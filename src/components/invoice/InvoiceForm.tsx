import { Plus, Trash2, Lock, Sparkles } from 'lucide-react'
import { type InvoiceData, type LineItem, CURRENCIES } from '../../types/invoice'

interface InvoiceFormProps {
  invoice: InvoiceData
  onChange: (data: InvoiceData) => void
  isPro?: boolean
  onUpgrade?: (p?: 'pro' | 'agency') => void
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b" style={{ borderColor: '#f0ece8' }}>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9c8572' }}>{title}</h3>
      {children}
    </div>
  )
}

function InputField({
  label, value, onChange, type = 'text', placeholder = '', className = ''
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium" style={{ color: '#9c8572' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2"
        style={{
          borderColor: '#e8e0d8',
          background: '#faf9f7',
          color: '#1a1208',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'hsl(16 95% 52%)'
          e.target.style.boxShadow = '0 0 0 3px hsl(16 95% 52% / 0.15)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e8e0d8'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

export default function InvoiceForm({ invoice, onChange, isPro = false, onUpgrade }: InvoiceFormProps) {
  const update = (fields: Partial<InvoiceData>) => onChange({ ...invoice, ...fields })

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
    }
    update({ lineItems: [...invoice.lineItems, newItem] })
  }

  const updateLineItem = (id: string, fields: Partial<LineItem>) => {
    update({
      lineItems: invoice.lineItems.map((item) =>
        item.id === id ? { ...item, ...fields } : item
      ),
    })
  }

  const removeLineItem = (id: string) => {
    if (invoice.lineItems.length === 1) return
    update({ lineItems: invoice.lineItems.filter((item) => item.id !== id) })
  }

  return (
    <div>
      {/* Invoice Meta */}
      <FormSection title="Invoice Details">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Invoice Number"
            value={invoice.invoiceNumber}
            onChange={(v) => update({ invoiceNumber: v })}
            placeholder="INV-001"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: '#9c8572' }}>Currency</label>
            <select
              value={invoice.currency}
              onChange={(e) => update({ currency: e.target.value })}
              className="px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{
                borderColor: '#e8e0d8',
                background: '#faf9f7',
                color: '#1a1208',
                fontFamily: 'inherit',
              }}
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <InputField
            label="Issue Date"
            value={invoice.issueDate}
            onChange={(v) => update({ issueDate: v })}
            type="date"
          />
          <InputField
            label="Due Date"
            value={invoice.dueDate}
            onChange={(v) => update({ dueDate: v })}
            type="date"
          />
        </div>
      </FormSection>

      {/* From */}
      <FormSection title="From (You)">
        <div className="space-y-3">
          <InputField
            label="Your Name / Company"
            value={invoice.fromName}
            onChange={(v) => update({ fromName: v })}
            placeholder="Acme Studio"
          />
          <InputField
            label="Email"
            value={invoice.fromEmail}
            onChange={(v) => update({ fromEmail: v })}
            type="email"
            placeholder="hello@acmestudio.com"
          />
          <InputField
            label="Address"
            value={invoice.fromAddress}
            onChange={(v) => update({ fromAddress: v })}
            placeholder="123 Main St, City, Country"
          />
        </div>
      </FormSection>

      {/* To */}
      <FormSection title="Bill To (Client)">
        <div className="space-y-3">
          <InputField
            label="Client Name / Company"
            value={invoice.toName}
            onChange={(v) => update({ toName: v })}
            placeholder="Client Corp Inc."
          />
          <InputField
            label="Client Email"
            value={invoice.toEmail}
            onChange={(v) => update({ toEmail: v })}
            type="email"
            placeholder="billing@clientcorp.com"
          />
          <InputField
            label="Client Address"
            value={invoice.toAddress}
            onChange={(v) => update({ toAddress: v })}
            placeholder="456 Business Ave, City, Country"
          />
        </div>
      </FormSection>

      {/* Line Items */}
      <FormSection title="Line Items">
        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium" style={{ color: '#9c8572' }}>
          <span className="col-span-6">Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-3 text-right">Rate</span>
          <span className="col-span-1" />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {invoice.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-6 px-2.5 py-2 rounded-xl text-sm border outline-none"
                style={{
                  borderColor: '#e8e0d8',
                  background: '#faf9f7',
                  color: '#1a1208',
                  fontFamily: 'inherit',
                }}
                placeholder="Service description"
                value={item.description}
                onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                onFocus={(e) => { e.target.style.borderColor = 'hsl(16 95% 52%)'; e.target.style.boxShadow = '0 0 0 3px hsl(16 95% 52% / 0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e0d8'; e.target.style.boxShadow = 'none' }}
              />
              <input
                type="number"
                min="0"
                step="1"
                className="col-span-2 px-2 py-2 rounded-xl text-sm border text-center outline-none"
                style={{
                  borderColor: '#e8e0d8',
                  background: '#faf9f7',
                  color: '#1a1208',
                  fontFamily: 'inherit',
                }}
                value={item.quantity}
                onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                onFocus={(e) => { e.target.style.borderColor = 'hsl(16 95% 52%)'; e.target.style.boxShadow = '0 0 0 3px hsl(16 95% 52% / 0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e0d8'; e.target.style.boxShadow = 'none' }}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="col-span-3 px-2 py-2 rounded-xl text-sm border text-right outline-none"
                style={{
                  borderColor: '#e8e0d8',
                  background: '#faf9f7',
                  color: '#1a1208',
                  fontFamily: 'inherit',
                }}
                placeholder="0.00"
                value={item.rate || ''}
                onChange={(e) => updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                onFocus={(e) => { e.target.style.borderColor = 'hsl(16 95% 52%)'; e.target.style.boxShadow = '0 0 0 3px hsl(16 95% 52% / 0.15)' }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e0d8'; e.target.style.boxShadow = 'none' }}
              />
              <button
                onClick={() => removeLineItem(item.id)}
                disabled={invoice.lineItems.length === 1}
                className="col-span-1 flex items-center justify-center p-1.5 rounded-lg transition-colors"
                style={{
                  color: invoice.lineItems.length === 1 ? '#d4c9be' : '#9c8572',
                  cursor: invoice.lineItems.length === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addLineItem}
          className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-all hover:border-solid"
          style={{
            borderColor: 'hsl(16 95% 52%)',
            color: 'hsl(16 95% 52%)',
          }}
        >
          <Plus size={15} />
          Add line item
        </button>
      </FormSection>

      {/* Totals */}
      <FormSection title="Totals">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Tax Rate (%)"
            value={invoice.taxRate}
            onChange={(v) => update({ taxRate: parseFloat(v) || 0 })}
            type="number"
            placeholder="0"
          />
          <InputField
            label="Discount ($)"
            value={invoice.discountAmount}
            onChange={(v) => update({ discountAmount: parseFloat(v) || 0 })}
            type="number"
            placeholder="0.00"
          />
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection title="Notes & Payment Terms">
        <textarea
          value={invoice.notes}
          onChange={(e) => update({ notes: e.target.value })}
          rows={3}
          placeholder="Payment due within 30 days. Thank you for your business!"
          className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
          style={{
            borderColor: '#e8e0d8',
            background: '#faf9f7',
            color: '#1a1208',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'hsl(16 95% 52%)'
            e.target.style.boxShadow = '0 0 0 3px hsl(16 95% 52% / 0.15)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e8e0d8'
            e.target.style.boxShadow = 'none'
          }}
        />
      </FormSection>

      {/* Branding — Pro only */}
      <FormSection title="Branding">
        {isPro ? (
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Logo Initials" value={invoice.logoText} onChange={(v) => update({ logoText: v.slice(0, 3).toUpperCase() })} placeholder="YS" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: '#9c8572' }}>Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={invoice.accentColor.startsWith('hsl') ? '#f94e10' : invoice.accentColor} onChange={(e) => update({ accentColor: e.target.value })} className="w-10 h-10 rounded-xl border cursor-pointer" style={{ borderColor: '#e8e0d8', padding: '2px' }} />
                <span className="text-xs" style={{ color: '#9c8572' }}>Brand color</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'hsl(16 60% 88%)', background: 'hsl(16 95% 98%)' }}>
            <div className="flex items-center gap-3">
              <Lock size={15} style={{ color: 'hsl(16 95% 52%)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1a1208' }}>Custom branding</p>
                <p className="text-xs" style={{ color: '#9c8572' }}>Logo, brand colors — Pro only</p>
              </div>
            </div>
            <button onClick={() => onUpgrade?.('pro')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'hsl(16 95% 52%)' }}>
              <Sparkles size={11} />Upgrade
            </button>
          </div>
        )}
      </FormSection>

      {/* Bottom padding for mobile */}
      <div className="h-8" />
    </div>
  )
}
