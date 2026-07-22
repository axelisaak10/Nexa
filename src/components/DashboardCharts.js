'use client';

import { useEffect, useRef } from 'react';

export default function DashboardCharts({ metrics }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !metrics || metrics.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 30, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Get sales data
    const salesData = metrics.map(m => Number(m.total_ventas_dia || m.total_sales || 0));
    const labels = metrics.map(m => {
      const d = new Date(m.fecha || m.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const maxSales = Math.max(...salesData, 1);
    
    // Draw grid lines
    ctx.strokeStyle = '#E0D5C9';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Y-axis labels
      ctx.fillStyle = '#6B6B6B';
      ctx.font = '11px "DM Mono", monospace';
      ctx.textAlign = 'right';
      const value = maxSales - (maxSales / 4) * i;
      ctx.fillText(`$${Math.round(value)}`, padding.left - 8, y + 4);
    }
    
    // Draw bars
    const barWidth = Math.min(chartWidth / salesData.length * 0.6, 40);
    const gap = chartWidth / salesData.length;
    
    salesData.forEach((value, i) => {
      const barHeight = (value / maxSales) * chartHeight;
      const x = padding.left + gap * i + (gap - barWidth) / 2;
      const y = padding.top + chartHeight - barHeight;
      
      // Bar gradient
      const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
      gradient.addColorStop(0, '#C85A2A');
      gradient.addColorStop(1, '#E8A07A');
      ctx.fillStyle = gradient;
      
      // Rounded top
      const radius = 3;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, padding.top + chartHeight);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();
      
      // X-axis labels
      ctx.fillStyle = '#6B6B6B';
      ctx.font = '11px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth / 2, padding.top + chartHeight + 20);
    });
    
    // Title
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '13px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Daily Sales ($)', padding.left, 18);
    
  }, [metrics]);

  return (
    <div className="dashboard-chart-container" id="sales-chart">
      <canvas
        ref={canvasRef}
        className="dashboard-chart-canvas"
        style={{ width: '100%', height: '300px' }}
      />
    </div>
  );
}
