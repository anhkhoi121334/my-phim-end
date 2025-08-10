import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  }
});

const MovieSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  origin_name: String,
  thumb_url: String,
  year: Number,
  category: [CategorySchema],
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    vote_average: {
      type: Number,
      default: 0
    },
    vote_count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create indexes
MovieSchema.index({ name: 1 });
MovieSchema.index({ 'category.name': 1 });
MovieSchema.index({ 'category.slug': 1 });
MovieSchema.index({ year: -1 });
MovieSchema.index({ views: -1 });
MovieSchema.index({ 'rating.vote_average': -1 });

// Use existing model or create new one
const Movie = models.Movie || model('Movie', MovieSchema);

export default Movie; 