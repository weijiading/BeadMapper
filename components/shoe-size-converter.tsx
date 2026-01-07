'use client'

import React, { useState, useMemo } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { SHOE_DATA } from '@/lib/shoe-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'

const categoryOptions = [
  { value: 'mens', label: 'Men' },
  { value: 'womens', label: 'Women' },
]

const brandOptions = [
  { value: 'nike', label: 'Nike' },
  { value: 'adidas', label: 'Adidas' },
]

const unitOptions = [
  { value: 'us', label: 'US' },
  { value: 'uk', label: 'UK' },
  { value: 'eu', label: 'EU' },
  { value: 'cm', label: 'CM' },
]

export default function ShoeSizeConverter() {
  const [category, setCategory] = useState<string>('mens')
  const [brand, setBrand] = useState<string>('nike')
  const [unit, setUnit] = useState<string>('us')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [openCategory, setOpenCategory] = useState(false)
  const [openBrand, setOpenBrand] = useState(false)
  const [openUnit, setOpenUnit] = useState(false)
  const [openSize, setOpenSize] = useState(false)

  const availableSizes = useMemo(() => {
    try {
      const data = SHOE_DATA[category]?.[brand]
      if (!Array.isArray(data)) return []
      return data.map((item: any) => String(item[unit]))
    } catch (error) {
      console.error('Error getting available sizes:', error)
      return []
    }
  }, [brand, category, unit])

  const sizeOptions = useMemo(() => {
    return availableSizes.map((size) => ({
      value: size,
      label: size,
    }))
  }, [availableSizes])

  const result = useMemo(() => {
    if (!selectedSize) return null
    try {
      const data = SHOE_DATA[category]?.[brand]
      if (!Array.isArray(data)) return null
      return data.find((row: any) => String(row[unit]) === selectedSize)
    } catch (error) {
      console.error('Error finding result:', error)
      return null
    }
  }, [brand, category, unit, selectedSize])

  return (
    <Card className="p-6 bg-white/50 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl flex flex-col gap-6">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Category Combobox */}
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-full justify-between bg-white"
            >
              {category ? categoryOptions.find((opt) => opt.value === category)?.label : 'Category'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categoryOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setCategory(currentValue)
                        setSelectedSize('')
                        setOpenCategory(false)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          category === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Brand Combobox */}
        <Popover open={openBrand} onOpenChange={setOpenBrand}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openBrand}
              className="w-full justify-between bg-white"
            >
              {brand ? brandOptions.find((opt) => opt.value === brand)?.label : 'Brand'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No brand found.</CommandEmpty>
                <CommandGroup>
                  {brandOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setBrand(currentValue)
                        setSelectedSize('')
                        setOpenBrand(false)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          brand === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Unit Combobox */}
        <Popover open={openUnit} onOpenChange={setOpenUnit}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openUnit}
              className="w-full justify-between bg-white"
            >
              {unit ? unitOptions.find((opt) => opt.value === unit)?.label : 'Unit'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No unit found.</CommandEmpty>
                <CommandGroup>
                  {unitOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setUnit(currentValue)
                        setSelectedSize('')
                        setOpenUnit(false)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          unit === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Size Combobox */}
        <Popover open={openSize} onOpenChange={setOpenSize}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSize}
              className="w-full justify-between bg-white"
            >
              {selectedSize ? sizeOptions.find((opt) => opt.value === selectedSize)?.label : 'Pick Size'}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No size found.</CommandEmpty>
                <CommandGroup>
                  {sizeOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setSelectedSize(currentValue === selectedSize ? '' : currentValue)
                        setOpenSize(false)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedSize === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Separator - shadcn style dashed divider */}
      <div className="w-full border-t border-dashed border-border" />

      {/* 
        修改点:
        1. 外层增加一个 'relative' 容器，为内部绝对定位的文字提供定位基准。
        2. Table 组件始终渲染，但通过 className 控制其可见性。
           - 当没有结果时，'opacity-0 invisible' 会让表格透明且不可交互，但它仍然占据着布局空间，从而撑开了父容器的高度。
        3. 内部的 TableCell 使用可选链(?.)和空值合并(??)来处理 result 为 null 的情况，防止报错，并用一个空格占位符 `\u00A0` 确保单元格被渲染。
        4. 提示文字的 div 仅在没有 result 时渲染。
           - 'absolute inset-0' 让它铺满父容器。
           - 'flex items-center justify-center' 使其在父容器中完美居中。
      */}
      <div className="relative">
        <Table className={cn(!result && 'opacity-0 invisible')}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">US</TableHead>
              <TableHead className="text-center">UK</TableHead>
              <TableHead className="text-center">EU</TableHead>
              <TableHead className="text-center">CM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold text-center">{result?.us ?? '\u00A0'}</TableCell>
              <TableCell className="font-bold text-center">{result?.uk ?? '\u00A0'}</TableCell>
              <TableCell className="font-bold text-center">{result?.eu ?? '\u00A0'}</TableCell>
              <TableCell className="font-bold text-center">{result?.cm ?? '\u00A0'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {!result && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            请选择需要的性别、品牌、尺码类型以及尺寸
          </div>
        )}
      </div>
    </Card>
  )
}