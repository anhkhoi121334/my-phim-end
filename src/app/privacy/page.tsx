import StaticPage from '@/components/StaticPage';

export default function PrivacyPage() {
  return (
    <StaticPage title="Chính sách bảo mật">
      <div className="space-y-6">
        <p>
          Tại MyPhim, chúng tôi coi trọng quyền riêng tư của người dùng và cam kết bảo vệ thông tin cá nhân của bạn. 
          Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Thông tin chúng tôi thu thập</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Thông tin cơ bản: tên, email khi bạn đăng ký tài khoản</li>
          <li>Thông tin thiết bị: loại thiết bị, hệ điều hành, trình duyệt</li>
          <li>Dữ liệu sử dụng: lịch sử xem, tương tác với nội dung</li>
          <li>Thông tin vị trí (nếu bạn cho phép)</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Mục đích sử dụng thông tin</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Cung cấp và cải thiện dịch vụ xem phim</li>
          <li>Cá nhân hóa trải nghiệm người dùng</li>
          <li>Gửi thông báo về nội dung mới và cập nhật</li>
          <li>Phân tích và nghiên cứu để cải thiện dịch vụ</li>
          <li>Bảo vệ an ninh và ngăn chặn gian lận</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Bảo mật thông tin</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Sử dụng công nghệ mã hóa tiên tiến để bảo vệ dữ liệu</li>
          <li>Giới hạn quyền truy cập thông tin cho nhân viên</li>
          <li>Thường xuyên đánh giá và cập nhật biện pháp bảo mật</li>
          <li>Không chia sẻ thông tin với bên thứ ba khi chưa được phép</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Quyền của người dùng</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Quyền truy cập và chỉnh sửa thông tin cá nhân</li>
          <li>Quyền yêu cầu xóa thông tin</li>
          <li>Quyền từ chối nhận thông báo marketing</li>
          <li>Quyền khiếu nại về việc xử lý dữ liệu</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Cookie và công nghệ theo dõi</h2>
        <p>
          Chúng tôi sử dụng cookie và các công nghệ tương tự để cải thiện trải nghiệm người dùng và phân tích 
          việc sử dụng dịch vụ. Bạn có thể kiểm soát việc sử dụng cookie thông qua cài đặt trình duyệt.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Thay đổi chính sách</h2>
        <p>
          Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được thông báo trên website 
          và/hoặc qua email. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận 
          chính sách mới.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Liên hệ về vấn đề bảo mật</h2>
        <p>
          Nếu bạn có bất kỳ câu hỏi hoặc lo ngại nào về chính sách bảo mật, vui lòng liên hệ:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email: privacy@myphim.com</li>
          <li>Hotline: 1900 xxxx</li>
        </ul>

        <p className="mt-8 text-sm text-gray-400">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>
    </StaticPage>
  );
} 