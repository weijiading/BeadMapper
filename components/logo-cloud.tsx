'use client'

export default function LogoCloud() {
  // 使用本地已有的SVG文件
  const logos = [
    { name: 'File', svgFile: 'file.svg' },
    { name: 'Globe', svgFile: 'globe.svg' },
    { name: 'Next', svgFile: 'next.svg' },
    { name: 'Vereel', svgFile: 'vereel.svg' },
    { name: 'Window', svgFile: 'window.svg' },
  ]

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Trusted by Leading Brands
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our size conversion technology is trusted by industry leaders worldwide
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {logos.map((logo, index) => (
          <div 
            key={logo.name} 
            className="w-32 h-16 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative group">
              {/* SVG Logo */}
              <img 
                src={`/images/${logo.svgFile}`}
                alt={logo.name}
                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
              />
              
              {/* 悬停时的文字提示 */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 附加说明 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          All logos are represented by SVG for crisp display at any size
        </p>
      </div>
    </div>
  )
}