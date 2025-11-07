<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Statistics } from '@/interfaces/Statistics'

interface Props {
  statistics: Statistics
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

// Generate chart data based on time period
const generateChartData = () => {
  const { timePeriod, totalOrderedPlans, startDate, endDate } = props.statistics
  
  // Parse dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Determine number of data points based on time period
  let months: string[] = []
  let dataPoints: number[] = []
  
  if (timePeriod === '3 Months') {
    // 3 months: Aug, Sep, Oct (example)
    months = generateMonthLabels(start, end, 3)
    dataPoints = distributeDataPoints(totalOrderedPlans, 3)
  } else if (timePeriod === '6 Months') {
    months = generateMonthLabels(start, end, 6)
    dataPoints = distributeDataPoints(totalOrderedPlans, 6)
  } else if (timePeriod === '12 Months') {
    months = generateMonthLabels(start, end, 12)
    dataPoints = distributeDataPoints(totalOrderedPlans, 12)
  }
  
  return { months, dataPoints }
}

// Generate month labels
const generateMonthLabels = (start: Date, end: Date, count: number): string[] => {
  const months: string[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  for (let i = 0; i < count; i++) {
    const date = new Date(start)
    date.setMonth(start.getMonth() + i)
    months.push(monthNames[date.getMonth()])
  }
  
  return months
}

// Distribute data points (simulated growth curve)
const distributeDataPoints = (total: number, count: number): number[] => {
  const dataPoints: number[] = []
  
  // Create a growth curve effect
  for (let i = 0; i < count; i++) {
    // Exponential growth simulation
    const ratio = Math.pow((i + 1) / count, 2)
    const value = Math.round(total * ratio)
    dataPoints.push(value)
  }
  
  return dataPoints
}

// Create chart
const createChart = () => {
  if (!chartCanvas.value) return
  
  const { months, dataPoints } = generateChartData()
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  // Simple canvas-based line chart (without external library)
  drawLineChart(ctx, months, dataPoints)
}

// Draw line chart using Canvas API
const drawLineChart = (ctx: CanvasRenderingContext2D, labels: string[], data: number[]) => {
  const canvas = chartCanvas.value
  if (!canvas) return
  
  const width = canvas.width
  const height = canvas.height
  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  // Find max value for scaling
  const maxValue = Math.max(...data, 1)
  const yScale = chartHeight / maxValue
  const xScale = chartWidth / (labels.length - 1)
  
  // Draw grid lines
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    
    // Y-axis labels
    const value = Math.round(maxValue - (maxValue / 5) * i)
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(value.toString(), padding - 10, y + 4)
  }
  
  // Draw line
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = padding + index * xScale
    const y = height - padding - value * yScale
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Draw data points
  data.forEach((value, index) => {
    const x = padding + index * xScale
    const y = height - padding - value * yScale
    
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // Draw X-axis labels
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  
  labels.forEach((label, index) => {
    const x = padding + index * xScale
    ctx.fillText(label, x, height - padding + 20)
  })
  
  // Draw Y-axis label
  ctx.save()
  ctx.translate(15, height / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#374151'
  ctx.font = '13px sans-serif'
  ctx.fillText('Number of Insurance Plans Ordered', 0, 0)
  ctx.restore()
  
  // Draw X-axis label
  ctx.fillStyle = '#374151'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Time (Months)', width / 2, height - 10)
  
  // Draw legend
  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(width - 200, 20, 15, 15)
  ctx.fillStyle = '#374151'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Insurance Plans Ordered', width - 180, 32)
}

// Watch for changes
watch(() => props.statistics, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  // Set canvas size
  if (chartCanvas.value) {
    chartCanvas.value.width = 960
    chartCanvas.value.height = 400
  }
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      Insurance Plans Ordered Over Time
      <span class="text-sm font-normal text-gray-600 ml-2">
        ({{ statistics.timePeriod }}, {{ statistics.service === 'ALL_SERVICES' ? 'All Services' : statistics.service }})
      </span>
    </h3>
    
    <div class="mt-4 overflow-x-auto">
      <canvas
        ref="chartCanvas"
        class="w-full"
        style="max-width: 100%; height: 400px;"
      ></canvas>
    </div>
  </div>
</template>

<style scoped>
canvas {
  display: block;
  margin: 0 auto;
}
</style>
