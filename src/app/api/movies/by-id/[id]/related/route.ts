import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Movie from "@/models/Movie";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Tìm phim hiện tại để lấy thể loại
    const currentMovie = await Movie.findById(params.id);

    if (!currentMovie) {
      return Response.json({ status: false, message: "Không tìm thấy phim" }, { status: 404 });
    }

    // Lấy các slug thể loại của phim hiện tại
    const categorySlugs = currentMovie.category.map((cat: any) => cat.slug);

    // Tìm phim cùng thể loại, ngoại trừ phim hiện tại
    const relatedMovies = await Movie.find({
      _id: { $ne: params.id },
      "category.slug": { $in: categorySlugs },
      status: "published"
    })
    .limit(6)
    .sort({ createdAt: -1 })
    .select('name origin_name thumb_url year category views rating');

    return Response.json({ status: true, movies: relatedMovies });
  } catch (error) {
    console.error("Lỗi khi lấy phim liên quan:", error);
    return Response.json({ status: false, error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
