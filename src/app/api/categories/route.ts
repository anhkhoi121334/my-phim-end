import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Movie from '@/models/Movie';
import mongoose from 'mongoose';

interface PhimApiCategory {
  _id: string;
  name: string;
  slug: string;
}

// GET /api/categories
export async function GET() {
  try {
    // Fetch categories from phimapi.com
    const response = await fetch('https://phimapi.com/the-loai');
    const phimApiCategories: PhimApiCategory[] = await response.json();

    await connectToDatabase();

    // Get movie counts for each category from our database
    const movieCounts = await Movie.aggregate([
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.slug',
          movieCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map of slug to movie count
    const movieCountMap = new Map(
      movieCounts.map(item => [item._id, item.movieCount])
    );

    // Combine phimapi categories with movie counts
    const categories = phimApiCategories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      movieCount: movieCountMap.get(cat.slug) || 0
    }));

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories'
      },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name and slug are required'
        },
        { status: 400 }
      );
    }

    // Check if category with same name or slug exists
    const existingMovie = await Movie.findOne({
      $or: [
        { 'category.name': body.name },
        { 'category.slug': body.slug }
      ]
    });

    if (existingMovie) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category with this name or slug already exists'
        },
        { status: 400 }
      );
    }

    // Create a new category object
    const newCategory = {
      _id: body._id || new mongoose.Types.ObjectId().toString(),
      name: body.name,
      slug: body.slug,
      movieCount: 0
    };

    return NextResponse.json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create category'
      },
      { status: 500 }
    );
  }
} 