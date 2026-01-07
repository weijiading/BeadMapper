import { Card, CardContent } from "@/components/ui/card"

interface Testimonial {
  text: string
  author: string
  role: string
}

interface TestimonialGridProps {
  testimonials: Testimonial[]
}

export function TestimonialGrid({ testimonials }: TestimonialGridProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((item, i) => (
        <Card key={i} className="border border-slate-200">
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4 italic">"{item.text}"</p>
            <div>
              <p className="font-semibold text-slate-900">{item.author}</p>
              <p className="text-sm text-slate-500">{item.role}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
