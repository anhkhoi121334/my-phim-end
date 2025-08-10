import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Movie from '@/models/Movie';

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if another category with same name or slug exists
    const existingMovie = await Movie.findOne({
      'category._id': { $ne: params.id },
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

    // Update all movies that have this category
    await Movie.updateMany(
      { 'category._id': params.id },
      {
        $set: {
          'category.$.name': body.name,
          'category.$.slug': body.slug
        }
      }
    );

    // Get the updated category with movie count
    const movieCount = await Movie.countDocuments({
      'category._id': params.id
    });

    const updatedCategory = {
      _id: params.id,
      name: body.name,
      slug: body.slug,
      movieCount
    };

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update category'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Remove the category from all movies
    const result = await Movie.updateMany(
      { 'category._id': params.id },
      { $pull: { category: { _id: params.id } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found or no movies were using this category'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category removed from all movies successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete category'
      },
      { status: 500 }
    );
  }
} 