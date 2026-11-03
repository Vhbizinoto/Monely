export default function Card({ children, className = '', hover = true, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`bg-card rounded-2xl p-6 border border-gray-800 ${
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
