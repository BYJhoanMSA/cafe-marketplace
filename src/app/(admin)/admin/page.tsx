// src/app/(admin)/admin/page.tsx
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react'
import { getDashboardStats, getRecentOrders } from '@/server/actions/admin/dashboard.actions'
import { StatCard } from '@/components/admin/StatCard'
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable'
import { formatPrice } from '@/lib/utils'

export const metadata = {
  title: 'Dashboard | Panel Admin',
}

export default async function DashboardPage() {
  const statsRes = await getDashboardStats()
  const ordersRes = await getRecentOrders()

  const stats = statsRes.success && statsRes.data ? statsRes.data : {
    totalRevenue: 0,
    pendingOrdersCount: 0,
    activeProductsCount: 0,
    newUsersCount: 0,
  }

  const recentOrders = ordersRes.success && ordersRes.data ? ordersRes.data : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
          Resumen General
        </h1>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)' }}>
          Bienvenido al panel de control de tu Marketplace.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 'var(--space-4)' 
      }}>
        <StatCard 
          title="Ingresos Totales" 
          value={formatPrice(stats.totalRevenue, 'USD')}
          icon={<DollarSign size={24} />}
          trend={{ value: '0% (MVP)', isPositive: true }}
        />
        <StatCard 
          title="Pedidos Pendientes" 
          value={stats.pendingOrdersCount}
          icon={<ShoppingBag size={24} />}
        />
        <StatCard 
          title="Productos Activos" 
          value={stats.activeProductsCount}
          icon={<Package size={24} />}
        />
        <StatCard 
          title="Nuevos Clientes (30d)" 
          value={stats.newUsersCount}
          icon={<Users size={24} />}
        />
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  )
}
