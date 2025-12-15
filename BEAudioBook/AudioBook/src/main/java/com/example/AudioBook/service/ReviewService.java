package com.example.AudioBook.service;

import com.example.AudioBook.DTO.Review.ReviewRequest;
import com.example.AudioBook.DTO.Review.ReviewStat;
import com.example.AudioBook.entity.Review;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ReviewService {
    Page<Review> getReviewsByBookId(Long bookId, int page, int size);
    Review addReview(ReviewRequest reviewRequest);
    String deleteReview(Long id);
    ReviewStat getStatReviews();
    ReviewStat getStatReviewOfBook(Long bookId);
}
