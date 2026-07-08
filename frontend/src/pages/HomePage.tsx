import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const modules = [
  {
    icon: '🍳',
    title: 'Cooking',
    description: 'Recipes & meal planning',
    path: '/recipes',
  },
]

function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Homelab</h1>
        <p>Your personal home platform</p>
      </div>
      <div className={styles.grid}>
        {modules.map((mod) => (
          <Link key={mod.path} to={mod.path} className={styles.card}>
            <span className={styles.icon}>{mod.icon}</span>
            <p className={styles.cardTitle}>{mod.title}</p>
            <p className={styles.cardDescription}>{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
