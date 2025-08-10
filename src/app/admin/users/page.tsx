'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [seedLoading, setSeedLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        role: role !== 'all' ? role : '',
      });

      console.log('Fetching users with params:', queryParams.toString());
      const response = await fetch(`/api/users?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      // Chuyển đổi dữ liệu nếu cần
      const formattedUsers = data.users.map((user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        role: string;
        createdAt: string;
      }) => ({
        ...user,
        // Đảm bảo createdAt là string để hiển thị
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()
      }));
      
      setUsers(formattedUsers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setUsers([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, role, pagination.limit]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Làm mới danh sách
      fetchUsers();
      alert('Đã xóa người dùng thành công');
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Đã xảy ra lỗi khi xóa người dùng');
    }
  };

  // Hàm tạo dữ liệu mẫu
  const handleSeedData = async () => {
    if (!confirm('Bạn có chắc chắn muốn tạo dữ liệu mẫu?')) return;
    
    try {
      setSeedLoading(true);
      const response = await fetch('/api/users/seed');
      
      if (!response.ok) {
        throw new Error('Failed to seed data');
      }
      
      const result = await response.json();
      alert(`Thành công: ${result.message}`);
      
      // Làm mới danh sách
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi tạo dữ liệu mẫu:', error);
      alert('Đã xảy ra lỗi khi tạo dữ liệu mẫu');
    } finally {
      setSeedLoading(false);
    }
  };

  // Hàm định dạng ngày tháng an toàn
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Không có dữ liệu';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Không có dữ liệu';
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Không có dữ liệu';
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <button 
          onClick={handleSeedData}
          disabled={seedLoading}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {seedLoading ? 'Đang tạo...' : 'Tạo dữ liệu mẫu'}
        </button>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded bg-white"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-2 border border-gray-300 rounded bg-white"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {/* Bảng người dùng */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-3 text-left text-gray-600">Ảnh</th>
              <th className="p-3 text-left text-gray-600">Tên</th>
              <th className="p-3 text-left text-gray-600">Email</th>
              <th className="p-3 text-left text-gray-600">Vai trò</th>
              <th className="p-3 text-left text-gray-600">Ngày tạo</th>
              <th className="p-3 text-left text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <Image
                      src={user.image || '/default-avatar.png'}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = '/default-avatar.png';
                      }}
                    />
                  </td>
                  <td className="p-3 text-gray-700">{user.name}</td>
                  <td className="p-3 text-gray-700">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {!loading && users.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-600">
            Tổng số: {pagination.total} người dùng
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 bg-white text-gray-700"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-gray-600">
              Trang {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 bg-white text-gray-700"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Debug info - Xóa sau khi hoàn thành */}
      {/* <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <pre className="text-xs mt-2 overflow-auto max-h-40">
          {JSON.stringify({users, pagination}, null, 2)}
        </pre>
      </div> */}
    </div>
  );
} 