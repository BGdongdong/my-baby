'use client'

import { useState, useEffect } from 'react'
import { useBaby } from '@/hooks/useBaby'
import { useGrowthRecords } from '@/hooks/useGrowthRecords'
import { useMilestones } from '@/hooks/useMilestones'
import Image from 'next/image'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardProps {
  setActiveTab: (tab: string) => void
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { baby, loading: babyLoading } = useBaby()
  const { records } = useGrowthRecords(baby?.id)
  const { milestones, loading: milestonesLoading } = useMilestones(baby?.id)

  const [currentAge, setCurrentAge] = useState('')

  // Calculate age when baby data is available
  useEffect(() => {
    if (baby?.birthDate) {
      const birth = new Date(baby.birthDate)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - birth.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 30) {
        setCurrentAge(`${diffDays}天`)
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        const days = diffDays % 30
        setCurrentAge(`${months}个月${days}天`)
      } else {
        const years = Math.floor(diffDays / 365)
        const months = Math.floor((diffDays % 365) / 30)
        setCurrentAge(`${years}岁${months}个月`)
      }
    }
  }, [baby?.birthDate])

  // Get latest growth record
  const latestRecord = records?.[0] // Records are sorted by date desc
  
  // Get recent milestones (latest 3)
  const recentMilestones = milestones?.slice(0, 3) || []

  // Prepare chart data
  const chartData = records?.map(record => ({
    date: new Date(record.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    fullDate: record.date,
    体重: record.weight || null,
    身高: record.height || null,
  })).reverse() || [] // 反转数组以按时间正序显示

  // 计算Y轴的动态范围
  const calculateAxisDomain = (dataKey: '体重' | '身高', buffer = 0.1) => {
    const values = chartData
      .map(item => item[dataKey])
      .filter(value => value !== null && value !== undefined) as number[]
    
    if (values.length === 0) return ['dataMin', 'dataMax']
    
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue
    
    // 如果数据范围很小，给一个最小缓冲区
    const minBuffer = Math.max(range * buffer, 0.5)
    
    return [
      Math.max(0, minValue - minBuffer), // 确保不为负数
      maxValue + minBuffer
    ]
  }

  const weightDomain = calculateAxisDomain('体重', 0.15)
  const heightDomain = calculateAxisDomain('身高', 0.05)

  if (babyLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!baby) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👶</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">欢迎使用宝宝成长记录</h2>
        <p className="text-gray-600 mb-6">开始记录宝宝的成长足迹吧！</p>
        <button 
          onClick={() => setActiveTab('baby')}
          className="btn-primary"
        >
          添加宝宝信息
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 统一的顶部卡片网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {/* 宝宝信息卡片 - 占据更多空间 */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="card p-4 h-full bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 min-h-[60px] md:min-h-[80px] lg:min-h-[100px]">
              <div className="flex items-center space-x-4 h-full">
                <div className="w-20 h-20 flex-shrink-0">
                  {baby.avatar ? (
                    <Image
                      src={baby.avatar}
                      alt="宝宝头像"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-2 border-pink-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl">
                      {baby.gender === 'boy' ? '👦' : '👧'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-800 truncate mb-1">{baby.name}</h1>
                  <p className="text-gray-600 text-base mb-1">{currentAge}</p>
                  <p className="text-sm text-gray-500 truncate mb-2">
                    出生于 {new Date(baby.birthDate).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => setActiveTab('baby')}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    编辑信息 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 体重卡片 */}
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 min-h-[60px] md:min-h-[80px] lg:min-h-[100px]">
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl mb-3">
                ⚖️
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">最新体重</h3>
              <p className="text-base font-bold text-gray-800">{latestRecord?.weight ? `${latestRecord.weight} kg` : '暂无数据'}</p>
              <button 
                onClick={() => setActiveTab('growth')}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium mt-1"
              >
                查看成长记录 →
              </button>
            </div>
          </div>

          {/* 身高卡片 */}
          <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 min-h-[60px] md:min-h-[80px] lg:min-h-[100px]">
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xl mb-3">
                📏
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">最新身高</h3>
              <p className="text-base font-bold text-gray-800">{latestRecord?.height ? `${latestRecord.height} cm` : '暂无数据'}</p>
              
            </div>
          </div>

          {/* 里程碑数卡片 */}
          <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 min-h-[60px] md:min-h-[80px] lg:min-h-[100px]">
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl mb-3">
                🏆
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">里程碑数</h3>
              <p className="text-base font-bold text-gray-800">{milestones?.length || 0} 个</p>
              <button 
                onClick={() => setActiveTab('milestones')}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium mt-1"
              >
                查看里程碑 →
              </button>
            </div>
          </div>

          {/* 新增：图片数量卡片 */}
          <div className="card p-4 bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200 min-h-[60px] md:min-h-[80px] lg:min-h-[100px]">
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white text-xl mb-3">
                📸
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">图片数量</h3>
              <p className="text-base font-bold text-gray-800">{baby._count?.mediaItems || 0} 张</p>
              <button 
                onClick={() => setActiveTab('photos')}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium mt-1"
              >
                查看相册 →
              </button>
            </div>
          </div>
        </div>

        {/* 下方左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左下角：最近里程碑 */}
          <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 min-h-[400px]">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              最近里程碑
            </h3>
            {milestonesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
                <p className="text-base text-gray-600">加载中...</p>
              </div>
            ) : recentMilestones.length > 0 ? (
              <div className="space-y-3 mb-4 flex-1">
                {recentMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start space-x-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                    <span className="text-2xl">🎯</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-base mb-1">{milestone.title}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                      {milestone.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {milestone.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-amber-200/70 text-amber-800 px-2 py-1 rounded-full">
                              #{tag}
                            </span>
                          ))}
                          {milestone.tags.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">+{milestone.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 flex-1 flex flex-col justify-center">
                <span className="text-4xl mb-4 block">🏆</span>
                <p className="text-base mb-2">还没有记录里程碑</p>
                <p className="text-sm text-gray-400">记录宝宝的重要成长时刻</p>
              </div>
            )}
            <button 
              onClick={() => setActiveTab('milestones')}
              className="w-full btn-primary bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 py-3"
            >
              {recentMilestones.length > 0 ? '查看全部里程碑' : '记录第一个里程碑'}
            </button>
          </div>

          {/* 右下角：成长记录图表 */}
          <div className="card p-6 bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 border-2 border-emerald-300 min-h-[400px] flex flex-col shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-2xl">📈</span>
              成长趋势图表
            </h3>
            {chartData.length > 0 ? (
              <div className="flex-1">
                <div className="h-80 bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-white/60 shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#34d399" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#374151', fontWeight: '500' }}
                        stroke="#6b7280"
                        strokeWidth={2}
                      />
                      <YAxis 
                        yAxisId="weight"
                        orientation="left"
                        domain={weightDomain}
                        tick={{ fontSize: 12, fill: '#374151', fontWeight: '500' }}
                        stroke="#0891b2"
                        strokeWidth={2}
                        label={{ value: '体重(kg)', angle: -90, position: 'insideLeft', style: { fontSize: '13px', fill: '#0891b2', fontWeight: 'bold' } }}
                      />
                      <YAxis 
                        yAxisId="height"
                        orientation="right"
                        domain={heightDomain}
                        tick={{ fontSize: 12, fill: '#374151', fontWeight: '500' }}
                        stroke="#059669"
                        strokeWidth={2}
                        label={{ value: '身高(cm)', angle: 90, position: 'insideRight', style: { fontSize: '13px', fill: '#059669', fontWeight: 'bold' } }}
                      />
                      <Tooltip 
                        labelFormatter={(label) => `📅 日期: ${label}`}
                        formatter={(value: unknown, name: string) => [
                          (typeof value === 'number' && value !== null) ? `${value} ${name === '体重' ? 'kg' : 'cm'}` : '无数据',
                          name === '体重' ? '⚖️ 体重' : '📏 身高'
                        ]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '2px solid #10b981',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '500',
                          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          paddingTop: '10px'
                        }} 
                        iconType="rect"
                      />
                      <Line
                        yAxisId="weight"
                        type="monotone"
                        dataKey="体重"
                        stroke="#0891b2"
                        strokeWidth={4}
                        dot={{ fill: '#0891b2', strokeWidth: 3, r: 6, stroke: '#ffffff' }}
                        activeDot={{ r: 8, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 3 }}
                        connectNulls={false}
                      />
                      <Line
                        yAxisId="height"
                        type="monotone"
                        dataKey="身高"
                        stroke="#059669"
                        strokeWidth={4}
                        dot={{ fill: '#059669', strokeWidth: 3, r: 6, stroke: '#ffffff' }}
                        activeDot={{ r: 8, fill: '#059669', stroke: '#ffffff', strokeWidth: 3 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* 添加一些统计信息 */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">记录天数</span>
                      <span className="text-lg font-bold text-blue-600">{chartData.length} 天</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">最新记录</span>
                      <span className="text-lg font-bold text-green-600">
                        {new Date(chartData[chartData.length - 1]?.fullDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-white/60 shadow-inner">
                  <div className="mb-6">
                    <span className="text-6xl block mb-2">📊</span>
                    <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded mx-auto"></div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">开始记录成长数据</h4>
                  <p className="text-gray-600 text-base mb-2">还没有成长记录</p>
                  <p className="text-sm text-gray-500">添加至少2条记录即可查看美丽的成长趋势图</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 