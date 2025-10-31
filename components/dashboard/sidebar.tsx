export default function Sidebar() {
  return (
    <aside className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6">
      <div className="w-16 h-16 flex items-center justify-center mb-8">
        <div className="text-center">
          <img
            src="/logo-minedu.png"
            alt="Logo Ministerio de Educación"
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>
    </aside>
  )
}
