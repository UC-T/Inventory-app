import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Package, Plus, X, Loader2 } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger 
} from '@/components/ui/sheet';
import './AddAssetPanel.css';

export default function AddAssetPanel({ onAssetAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://127.0.0.1:5000/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        reset();
        setIsOpen(false);
        if (onAssetAdded) onAssetAdded();
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="btn-primary">
          <Plus size={16} className="mr-2" /> Add New Asset
        </button>
      </SheetTrigger>
      
      <SheetContent className="asset-panel-content">
        <SheetHeader className="asset-panel-header">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Add Inventory Item
          </SheetTitle>
          <SheetDescription>
            Enter the details for the new asset.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="asset-form">
          <div className="form-section">
            <label className="form-label">Item Name</label>
            <input 
              {...register("name", { required: true })} 
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Hikvision Turret Camera"
            />
          </div>

          <div className="form-row">
            <div className="form-section">
              <label className="form-label">SKU / ID</label>
              <input 
                {...register("sku", { required: true })} 
                className="form-input"
                placeholder="AST-001"
              />
            </div>
            <div className="form-section">
              <label className="form-label">Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                {...register("price", { required: true })} 
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Quantity</label>
            <input 
              type="number" 
              {...register("quantity", { required: true, min: 1 })} 
              className="form-input"
              defaultValue="1"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Asset"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}