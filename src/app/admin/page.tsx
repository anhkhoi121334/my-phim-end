'use client';

import React, { useState, useEffect } from 'react';
import { FaUsers, FaFilm, FaEye, FaStar, FaChartLine, FaGlobe, FaMobile, FaDesktop } from 'react-icons/fa';

// Định nghĩa các interface cho dữ liệu
interface User {
  name: string;
  email: string;
  date: string;
}

interface Movie {
  title: string;
  category: string;
  views: string;
}

interface TrafficSource {
  name: string;
  percentage: number;
}

interface DeviceType {
  name: string;
  percentage: number;
}

interface SystemStatus {
  serverLoad: number;
  diskUsage: number;
  memoryUsage: number;
}

interface AnalyticsData {
  summary: {
    totalUsers: string;
    totalMovies: string;
    totalViews: string;
    averageRating: string;
  };
  trafficChart: {
    days: string[];
    dailyData: number[];
  };
  trafficSources: TrafficSource[];
  deviceTypes: DeviceType[];
  recentUsers: User[];
  topMovies: Movie[];
  todayVisits: string;
  systemStatus: SystemStatus;
}

// Summary card component
const SummaryCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-zinc-800 rounded-lg shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Recent users component
const RecentUsers = ({ users = [] }: { users: User[] }) => (
  <div className="bg-zinc-800 rounded-lg shadow-lg p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
            <th className="py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
            <th className="py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Registered</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="border-b border-zinc-700">
              <td className="py-3 text-sm text-white">{user.name}</td>
              <td className="py-3 text-sm text-white">{user.email}</td>
              <td className="py-3 text-sm text-gray-400">{user.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Recent movies component
const RecentMovies = ({ movies = [] }: { movies: Movie[] }) => (
  <div className="bg-zinc-800 rounded-lg shadow-lg p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Recent Movies</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
            <th className="py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
            <th className="py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Views</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie, index) => (
            <tr key={index} className="border-b border-zinc-700">
              <td className="py-3 text-sm text-white">{movie.title}</td>
              <td className="py-3 text-sm text-white">{movie.category}</td>
              <td className="py-3 text-sm text-gray-400">{movie.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Biểu đồ lưu lượng website
const TrafficChart = ({ days = [], dailyData = [] }: { days: string[], dailyData: number[] }) => {
  // Tìm giá trị lớn nhất để tính toán chiều cao theo tỷ lệ phần trăm
  const maxValue = Math.max(...dailyData);
  
  return (
    <div className="flex items-end justify-between h-64 mt-4">
      {dailyData.map((value, index) => (
        <div key={index} className="flex flex-col items-center w-1/7">
          <div 
            className="w-12 bg-red-600 rounded-t-md transition-all hover:bg-red-500"
            style={{ height: `${(value / maxValue) * 100}%` }}
          ></div>
          <div className="text-xs text-gray-400 mt-2">{days[index]}</div>
          <div className="text-xs text-white">{value}</div>
        </div>
      ))}
    </div>
  );
};

// Nguồn lưu lượng
const TrafficSources = ({ sources = [] }: { sources: TrafficSource[] }) => {
  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold text-white mb-3">Nguồn lưu lượng</h4>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">{source.name}</span>
              <span className="text-sm text-gray-400">{source.percentage}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div className={`${getColorByIndex(index)} h-2 rounded-full`} style={{ width: `${source.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hàm trả về màu dựa trên chỉ số
const getColorByIndex = (index: number): string => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
  return colors[index % colors.length];
};

// Loại thiết bị
const DeviceTypes = ({ devices = [] }: { devices: DeviceType[] }) => {
  const icons = [
    <FaMobile className="text-white" key="mobile" />,
    <FaDesktop className="text-white" key="desktop" />,
    <FaGlobe className="text-white" key="tablet" />
  ];
  
  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold text-white mb-3">Thiết bị truy cập</h4>
      <div className="grid grid-cols-3 gap-4">
        {devices.map((device, index) => (
          <div key={index} className="bg-zinc-700 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              {icons[index % icons.length]}
            </div>
            <div className="text-white text-lg font-bold">{device.percentage}%</div>
            <div className="text-gray-400 text-xs">{device.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics');
        
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu phân tích');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAnalyticsData(data.data);
        } else {
          throw new Error(data.message || 'Lỗi không xác định');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phân tích:', err);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
    
    // Tự động làm mới dữ liệu mỗi 5 phút
    const refreshInterval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800 rounded-lg p-6 text-center">
        <div className="text-red-500 text-xl mb-2">Lỗi</div>
        <p className="text-white">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-zinc-800 rounded-lg p-6 text-center">
        <p className="text-white">Không có dữ liệu phân tích</p>
      </div>
    );
  }

  const { 
    summary, 
    trafficChart, 
    trafficSources, 
    deviceTypes, 
    recentUsers, 
    topMovies, 
    todayVisits,
    systemStatus 
  } = analyticsData;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Users"
          value={summary.totalUsers}
          icon={<FaUsers className="text-white text-xl" />}
          color="bg-blue-600"
        />
        <SummaryCard
          title="Total Movies"
          value={summary.totalMovies}
          icon={<FaFilm className="text-white text-xl" />}
          color="bg-green-600"
        />
        <SummaryCard
          title="Total Views"
          value={summary.totalViews}
          icon={<FaEye className="text-white text-xl" />}
          color="bg-yellow-600"
        />
        <SummaryCard
          title="Average Rating"
          value={summary.averageRating}
          icon={<FaStar className="text-white text-xl" />}
          color="bg-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentUsers users={recentUsers} />
        <RecentMovies movies={topMovies} />
      </div>

      {/* Phần phân tích lưu lượng website */}
      <div className="bg-zinc-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Phân tích lưu lượng website</h3>
          <div className="flex items-center">
            <FaChartLine className="text-red-500 mr-2" />
            <span className="text-sm text-white">Lượt truy cập hôm nay: <span className="text-red-500 font-bold">{todayVisits}</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Xu hướng truy cập tuần này</h4>
            <TrafficChart days={trafficChart.days} dailyData={trafficChart.dailyData} />
          </div>
          
          <div>
            <TrafficSources sources={trafficSources} />
            <DeviceTypes devices={deviceTypes} />
          </div>
        </div>
      </div>

      <div className="bg-zinc-800 rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Server Load</span>
              <span className="text-sm text-gray-400">{systemStatus.serverLoad}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemStatus.serverLoad}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Disk Usage</span>
              <span className="text-sm text-gray-400">{systemStatus.diskUsage}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${systemStatus.diskUsage}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Memory Usage</span>
              <span className="text-sm text-gray-400">{systemStatus.memoryUsage}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemStatus.memoryUsage}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 