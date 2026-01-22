'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Check, X, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  isEditMode: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  children?: React.ReactNode; // For custom display
}

export function InlineTextEditor({
  value,
  onSave,
  isEditMode,
  multiline = false,
  placeholder = 'Бичих...',
  className,
  displayClassName,
  inputClassName,
  children,
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    // Only focus and move cursor to end when first entering edit mode
    if (isEditing && shouldFocusRef.current && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end only on initial focus
      const length = inputRef.current.value.length;
      if ('setSelectionRange' in inputRef.current) {
        inputRef.current.setSelectionRange(length, length);
      }
      shouldFocusRef.current = false;
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={cn('group relative', className)}>
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'min-h-[100px] resize-y',
              inputClassName
            )}
            disabled={isSaving}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={inputClassName}
            disabled={isSaving}
          />
        )}
        <div className="flex items-center gap-1 mt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 px-2"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            <span className="ml-1">Хадгалах</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-7 px-2"
          >
            <X className="h-3 w-3" />
            <span className="ml-1">Цуцлах</span>
          </Button>
          {multiline && (
            <span className="text-xs text-muted-foreground ml-2">
              Ctrl+Enter хадгалах
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer',
        isEditMode && 'hover:bg-muted/50 rounded-md transition-colors',
        className
      )}
      onClick={() => {
        if (isEditMode) {
          shouldFocusRef.current = true;
          setIsEditing(true);
        }
      }}
    >
      {children || (
        <span className={displayClassName}>
          {value || <span className="text-muted-foreground italic">{placeholder}</span>}
        </span>
      )}
      {isEditMode && !isEditing && (
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              shouldFocusRef.current = true;
              setIsEditing(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Component for editing arrays of items inline
interface InlineArrayEditorProps<T> {
  items: T[];
  onSave: (items: T[]) => Promise<void>;
  isEditMode: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEditItem: (
    item: T,
    index: number,
    onChange: (newItem: T) => void,
    onRemove: () => void
  ) => React.ReactNode;
  createEmpty: () => T;
  className?: string;
}

export function InlineArrayEditor<T>({
  items,
  onSave,
  isEditMode,
  renderItem,
  renderEditItem,
  createEmpty,
  className,
}: InlineArrayEditorProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<T[]>(items);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditItems(items);
  }, [items]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editItems);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
      setEditItems(items);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditItems(items);
    setIsEditing(false);
  };

  const handleItemChange = (index: number, newItem: T) => {
    const newItems = [...editItems];
    newItems[index] = newItem;
    setEditItems(newItems);
  };

  const handleRemove = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setEditItems([...editItems, createEmpty()]);
  };

  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {editItems.map((item, index) =>
          renderEditItem(
            item,
            index,
            (newItem) => handleItemChange(index, newItem),
            () => handleRemove(index)
          )
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="h-8"
          >
            + Нэмэх
          </Button>
        </div>
        <div className="flex items-center gap-1 pt-2 border-t">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Хадгалах
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Цуцлах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative',
        isEditMode && 'hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors cursor-pointer',
        className
      )}
      onClick={() => isEditMode && setIsEditing(true)}
    >
      {items.map((item, index) => renderItem(item, index))}
      {isEditMode && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
