import StaticPage from '@/components/StaticPage';

export default function TermsPage() {
  return (
    <StaticPage title="Điều khoản sử dụng">
      <div className="space-y-6">
        <p>
          Vui lòng đọc kỹ các điều khoản sử dụng sau đây trước khi sử dụng dịch vụ của MyPhim. 
          Việc sử dụng dịch vụ của chúng tôi đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với các điều khoản này.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Điều khoản chung</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>MyPhim cung cấp dịch vụ xem phim trực tuyến miễn phí cho người dùng.</li>
          <li>Người dùng phải từ 13 tuổi trở lên để sử dụng dịch vụ.</li>
          <li>Chúng tôi có quyền thay đổi, chỉnh sửa hoặc ngừng cung cấp dịch vụ mà không cần thông báo trước.</li>
          <li>Người dùng không được sử dụng dịch vụ cho mục đích thương mại hoặc bất hợp pháp.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Quyền sở hữu trí tuệ</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Tất cả nội dung trên MyPhim đều được bảo vệ bởi luật bản quyền.</li>
          <li>Người dùng không được sao chép, phân phối, hoặc sử dụng bất kỳ nội dung nào mà không có sự cho phép.</li>
          <li>Logo, thương hiệu và các tài sản trí tuệ khác là tài sản độc quyền của MyPhim.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Trách nhiệm người dùng</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Không chia sẻ tài khoản hoặc thông tin đăng nhập với người khác.</li>
          <li>Không tải lên hoặc chia sẻ nội dung vi phạm bản quyền hoặc pháp luật.</li>
          <li>Không sử dụng các công cụ tự động hoặc bot để truy cập dịch vụ.</li>
          <li>Không thực hiện các hành vi có thể gây hại cho hệ thống hoặc người dùng khác.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Giới hạn trách nhiệm</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>MyPhim không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ.</li>
          <li>Chúng tôi không đảm bảo dịch vụ sẽ không bị gián đoạn hoặc không có lỗi.</li>
          <li>Người dùng tự chịu trách nhiệm về việc sử dụng dịch vụ và nội dung họ truy cập.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Thay đổi điều khoản</h2>
        <p>
          MyPhim có quyền thay đổi các điều khoản này vào bất kỳ lúc nào. Chúng tôi sẽ thông báo về những thay đổi 
          quan trọng qua email hoặc thông báo trên website. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng 
          nghĩa với việc bạn chấp nhận các điều khoản mới.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Liên hệ</h2>
        <p>
          Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email: legal@myphim.com</li>
          <li>Hotline: 1900 xxxx</li>
        </ul>

        <p className="mt-8 text-sm text-gray-400">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>
    </StaticPage>
  );
} 