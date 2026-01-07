"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface SizeConversionResult {
  eu: string
  uk: string
  cm: string
}

interface SizeConverterProps {
  onResultChange?: (result: SizeConversionResult) => void
}

export function SizeConverter({ onResultChange }: SizeConverterProps) {
  const [usSize, setUsSize] = useState<string>("")
  const [gender, setGender] = useState<string>("men")

  const calculate = (): SizeConversionResult => {
    const size = parseFloat(usSize)
    if (isNaN(size) || !usSize) return { eu: "-", uk: "-", cm: "-" }

    const result = gender === "men"
      ? {
          eu: (size + 30.5).toFixed(1),
          uk: (size - 1).toFixed(1),
          cm: (size + 22).toFixed(1)
        }
      : {
          eu: (size + 30).toFixed(1),
          uk: (size - 2).toFixed(1),
          cm: (size + 20.5).toFixed(1)
        }

    onResultChange?.(result)
    return result
  }

  const result = calculate()

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
        <CardTitle className="text-2xl">快速转换</CardTitle>
        <CardDescription>输入你的美码尺寸，秒得所有标准</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label className="text-base font-semibold">选择鞋款类型</Label>
          <Select onValueChange={setGender} defaultValue="men">
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="选择性别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="men">男鞋 (Men's)</SelectItem>
              <SelectItem value="women">女鞋 (Women's)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">输入美码 (US Size)</Label>
          <Input
            type="number"
            placeholder="例如: 9.5"
            value={usSize}
            onChange={(e) => setUsSize(e.target.value)}
            className="h-12 text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-slate-200">
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">欧码</div>
            <div className="text-3xl font-bold text-blue-600">{result.eu}</div>
            <div className="text-xs text-slate-400 mt-1">EU</div>
          </div>
          <div className="text-center border-l border-slate-300">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">英码</div>
            <div className="text-3xl font-bold text-blue-600">{result.uk}</div>
            <div className="text-xs text-slate-400 mt-1">UK</div>
          </div>
          <div className="text-center border-l border-slate-300">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">脚长</div>
            <div className="text-3xl font-bold text-blue-600">{result.cm}</div>
            <div className="text-xs text-slate-400 mt-1">CM</div>
          </div>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-lg transition-all">
          🎯 立即查看该尺码的热销款
        </Button>
      </CardContent>
    </Card>
  )
}
