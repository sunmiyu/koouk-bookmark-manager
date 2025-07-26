interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const sections = [
    { id: 'todos', label: 'Todos' },
    { id: 'videos', label: 'Videos' },
    { id: 'images', label: 'Images' },
    { id: 'notes', label: 'Notes' }
  ]

  return (
    <nav className="flex gap-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}