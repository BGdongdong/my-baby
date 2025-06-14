# 统一缓存管理系统

## 🎯 解决的问题

### 旧缓存系统的问题：
1. **跨组件缓存不同步**：每个hook都有独立的缓存，数据修改后其他组件可能仍显示旧数据
2. **缓存失效机制不完善**：只有当前hook的操作才会清除缓存，无法感知外部数据变化
3. **缺乏统一管理**：重复的缓存逻辑，难以维护和调试
4. **可能导致页面不更新**：在缓存有效期内，即使服务器数据已变化，页面仍显示缓存数据

### 新系统的优势：
✅ **统一缓存管理**：所有数据使用同一个缓存管理器
✅ **跨组件同步**：任何组件的数据更新都会通知所有相关组件
✅ **智能失效机制**：支持精确失效和模式匹配失效
✅ **事件驱动更新**：缓存变化时自动通知订阅者
✅ **更好的调试体验**：统一的缓存状态监控

## 🚀 使用方法

### 1. 基本数据获取
```typescript
import { useCache } from './useCacheManager'

// 替代旧的useState + useEffect模式
const { data, loading, error, refetch } = useCache(
  'cache-key',
  async () => {
    // 数据获取逻辑
    const response = await fetch('/api/data')
    return response.json()
  },
  {
    duration: 5 * 60 * 1000, // 缓存5分钟
    autoRefresh: true, // 组件挂载时自动获取数据
    dependencies: [babyId] // 依赖变化时重新获取
  }
)
```

### 2. 数据更新与缓存失效
```typescript
import { useCacheInvalidation } from './useCacheManager'

const { invalidate, invalidatePattern, invalidateBabyData } = useCacheInvalidation()

// 创建数据后
const createRecord = async (data) => {
  const result = await fetch('/api/records', { method: 'POST', ... })
  
  // 失效相关缓存
  invalidate(`records-${babyId}`) // 失效特定缓存
  invalidateBabyData(babyId) // 失效baby相关的所有缓存
  
  return result
}
```

### 3. 现有hook的使用（已更新）
```typescript
// useBaby
const { baby, loading, error, refetch } = useBaby()

// useGrowthRecords
const { records, loading, error, refetch, createRecord } = useGrowthRecords(babyId)

// useMilestones
const { milestones, loading, error, refetch, createMilestone } = useMilestones(babyId)

// usePhotos
const { mediaItems, loading, error, fetchPhotos, uploadPhoto } = usePhotos(babyId)
```

## 🛠️ 缓存管理功能

### 精确失效
```typescript
// 失效特定缓存
invalidate('growth-records-123')
```

### 模式匹配失效
```typescript
// 失效所有baby相关缓存
invalidatePattern('baby-123')
invalidatePattern(/^growth-records-.*/)
```

### 批量失效
```typescript
// 失效特定baby的所有数据
invalidateBabyData(babyId) // 会失效：
// - baby-{babyId}
// - growth-records-{babyId}
// - milestones-{babyId}
// - photos-{babyId}
```

### 全局清除
```typescript
// 清除所有缓存
clearAll()
```

## 📊 缓存状态监控

```typescript
import { useCacheStatus } from './useCacheManager'

const { totalEntries, lastUpdated } = useCacheStatus()
```

## 🔄 数据预加载

```typescript
import { useDashboardPreloader, useSmartPreloader } from './useDataPreloader'

// Dashboard预加载
const { preloadData, isReady } = useDashboardPreloader()

// 智能预加载
const { clearInactiveCache } = useSmartPreloader(activeTab, loadedTabs)
```

## 🎯 最佳实践

### 1. 缓存键命名规范
- 使用描述性的键名：`growth-records-${babyId}`
- 保持一致的命名模式：`{resource}-{identifier}`
- 避免键名冲突

### 2. 缓存时间策略
- 频繁变化的数据：1-2分钟
- 相对稳定的数据：5-10分钟
- 静态数据：30分钟或更长

### 3. 失效策略
- 数据创建/更新/删除后立即失效相关缓存
- 使用 `invalidateBabyData` 进行批量失效
- 谨慎使用 `clearAll`，避免过度清除

### 4. 错误处理
```typescript
try {
  const result = await createRecord(data)
  // 成功后失效缓存
  invalidate(cacheKey)
} catch (error) {
  // 错误处理，不要失效缓存
  console.error('操作失败:', error)
}
```

## 🔧 迁移指南

### 从旧系统迁移
1. 移除旧的 `useState` 和 `useEffect` 数据获取逻辑
2. 使用 `useCache` 替代
3. 在数据修改操作中添加缓存失效逻辑
4. 测试跨组件的数据同步

### 兼容性
- 现有组件的API保持不变
- 逐步迁移，不需要一次性修改所有代码
- 旧的缓存系统已被注释，可以逐步移除

## 📝 示例场景

### 场景1：添加成长记录后Dashboard更新
```typescript
// 在GrowthRecords组件中
const createRecord = async (data) => {
  const result = await api.createRecord(data)
  invalidateBabyData(babyId) // Dashboard会自动更新统计数据
  return result
}
```

### 场景2：多个页面显示相同数据
```typescript
// 页面A和页面B都使用相同的数据
const { baby } = useBaby() // 两个页面会自动同步baby数据的变化
```

### 场景3：性能优化的预加载
```typescript
// 根据用户行为智能预加载
const preloader = useSmartPreloader(activeTab, loadedTabs)
// 当用户可能需要时才预加载相关数据
```

这个统一的缓存管理系统解决了原有的跨组件数据同步问题，确保了数据的一致性和页面的实时更新。 