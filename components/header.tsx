import Image from "next/image"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6">
      <div className="flex items-center gap-4">
        <div className="glass-card rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <Image src="/mebel-sherdor-logo.png" width={32} height={32} alt="Mebel Sherdor" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle || "Biznes boshqaruv tizimi"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
      </div>
    </header>
  )
}
