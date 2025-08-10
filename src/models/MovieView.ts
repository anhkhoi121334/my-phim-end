import mongoose from 'mongoose';

const movieViewSchema = new mongoose.Schema({
  movieId: {
    type: String, // Chấp nhận ID dạng chuỗi
    required: true,
    validate: {
      validator: function(v: string) {
        return typeof v === 'string' && v.length > 0;
      },
      message: 'movieId phải là một chuỗi hợp lệ'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Không bắt buộc vì có thể xem phim không cần đăng nhập
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

// Index để tối ưu truy vấn
movieViewSchema.index({ movieId: 1, viewedAt: -1 });
movieViewSchema.index({ userId: 1, viewedAt: -1 });

const MovieView = mongoose.models.MovieView || mongoose.model('MovieView', movieViewSchema);

export default MovieView; 