import StaticPage from '@/components/StaticPage';

export default function AboutPage() {
  return (
    <StaticPage title="Giới thiệu về MyPhim">
      <div className="space-y-6">
        <p>
          MyPhim là nền tảng xem phim trực tuyến hàng đầu, cung cấp kho phim đa dạng và phong phú với chất lượng cao. 
          Chúng tôi cam kết mang đến cho người xem những trải nghiệm giải trí tuyệt vời nhất với giao diện thân thiện, 
          dễ sử dụng và tốc độ tải nhanh.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Điểm nổi bật</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Kho phim đồ sộ với nhiều thể loại: phim lẻ, phim bộ, phim chiếu rạp, hoạt hình...</li>
          <li>Cập nhật nhanh chóng các phim mới với chất lượng cao</li>
          <li>Hỗ trợ xem phim trên nhiều thiết bị: máy tính, điện thoại, tablet</li>
          <li>Giao diện người dùng thân thiện, dễ sử dụng</li>
          <li>Tốc độ tải nhanh, ổn định</li>
          <li>Hoàn toàn miễn phí</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Cam kết của chúng tôi</h2>
        <p>
          MyPhim cam kết không ngừng cải thiện và nâng cao chất lượng dịch vụ, mang đến cho người xem những 
          trải nghiệm giải trí tốt nhất. Chúng tôi luôn lắng nghe ý kiến đóng góp của người dùng để hoàn thiện 
          sản phẩm ngày một tốt hơn.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">Liên hệ</h2>
        <p>
          Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, đừng ngần ngại liên hệ với chúng tôi qua:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email: support@myphim.com</li>
          <li>Hotline: 1900 xxxx</li>
          <li>Địa chỉ: Số xx, Đường xxx, Quận/Huyện xxx, Thành phố xxx</li>
        </ul>
      </div>
    </StaticPage>
  );
} 