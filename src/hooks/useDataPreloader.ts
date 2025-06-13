import { useEffect, useCallback } from 'react'
import { useBaby } from './useBaby'
import { useGrowthRecords } from './useGrowthRecords'
import { useMilestones } from './useMilestones'
import { usePhotos } from './usePhotos'

interface PreloadOptions {
  enabledTabs?: string[]
  delay?: number
  priority?: 'immediate' | 'idle' | 'visible'
}

export function useDataPreloader(options: PreloadOptions = {}) {
  const { enabledTabs = ['growth', 'milestones'], delay = 1000, priority = 'idle' } = options
  
  const { baby } = useBaby()
  const growthRecords = useGrowthRecords(baby?.id)
  const milestones = useMilestones(baby?.id)
  const photos = usePhotos(baby?.id)

  const preloadData = useCallback(async () => {
    if (!baby?.id) return

    const preloadPromises: Promise<unknown>[] = []

    // 预加载成长记录
    if (enabledTabs.includes('growth')) {
      preloadPromises.push(
        growthRecords.refetch(false).catch((err: Error) => {
          console.warn('Failed to preload growth records:', err)
        })
      )
    }

    // 预加载里程碑
    if (enabledTabs.includes('milestones')) {
      preloadPromises.push(
        milestones.refetch(false).catch((err: Error) => {
          console.warn('Failed to preload milestones:', err)
        })
      )
    }

    // 预加载照片（可选，因为可能数据量较大）
    if (enabledTabs.includes('photos')) {
      preloadPromises.push(
        photos.fetchPhotos(false, baby.birthDate).catch((err: Error) => {
          console.warn('Failed to preload photos:', err)
        })
      )
    }

    // 并行预加载，但不阻塞主线程
    if (preloadPromises.length > 0) {
      try {
        await Promise.allSettled(preloadPromises)
        console.log('Data preloading completed')
      } catch (error) {
        console.warn('Some data preloading failed:', error)
      }
    }
  }, [baby?.id, baby?.birthDate, enabledTabs])

  useEffect(() => {
    if (!baby?.id) return

    const executePreload = () => {
      switch (priority) {
        case 'immediate':
          preloadData()
          break
        case 'idle':
          // 使用 requestIdleCallback 在浏览器空闲时预加载
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => preloadData(), { timeout: 5000 })
          } else {
            // 降级到 setTimeout
            setTimeout(preloadData, delay)
          }
          break
        case 'visible':
          // 使用 setTimeout 延迟预加载
          setTimeout(preloadData, delay)
          break
        default:
          setTimeout(preloadData, delay)
      }
    }

    executePreload()
  }, [baby?.id, delay, priority, preloadData])

  return {
    preloadData,
    isReady: !!baby?.id,
  }
}

// 专门为首页Dashboard设计的预加载hook
export function useDashboardPreloader() {
  return useDataPreloader({
    enabledTabs: ['growth', 'milestones'], // 不预加载photos，因为数据量可能很大
    delay: 1500, // Dashboard渲染完成后1.5秒开始预加载
    priority: 'idle',
  })
}

// 智能预加载hook - 根据用户行为模式调整
export function useSmartPreloader(activeTab: string, loadedTabs: Set<string>) {
  const { baby } = useBaby()
  
  useEffect(() => {
    if (!baby?.id) return

    // 当用户访问growth tab时，预加载milestones
    if (activeTab === 'growth' && !loadedTabs.has('milestones')) {
      setTimeout(() => {
        // 触发milestones预加载的逻辑
        console.log('Smart preloading: milestones')
      }, 2000)
    }

    // 当用户访问milestones时，预加载photos
    if (activeTab === 'milestones' && !loadedTabs.has('photos')) {
      setTimeout(() => {
        console.log('Smart preloading: photos')
      }, 2000)
    }
  }, [activeTab, baby?.id, loadedTabs])
} 