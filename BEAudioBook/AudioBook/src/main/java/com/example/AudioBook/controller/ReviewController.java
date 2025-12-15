package com.example.AudioBook.controller;

import com.example.AudioBook.DTO.Review.ReviewRequest;
import com.example.AudioBook.entity.Review;
import com.example.AudioBook.repository.BookRepository;
import com.example.AudioBook.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:8081")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;
    @Autowired
    private BookRepository bookRepository;

    @GetMapping("/{bookId}/reviews")
    public ResponseEntity<?> getReviews(
            @PathVariable("bookId") Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Review> reviews = reviewService.getReviewsByBookId(bookId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/{bookId}/reviews")
    public Review addReview(@PathVariable("bookId") Long bookId, @RequestBody ReviewRequest reviewRequest) {
        reviewRequest.setBook_id(bookId);
        return reviewService.addReview(reviewRequest);
    }

    @DeleteMapping("reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id){
        return ResponseEntity.ok(reviewService.deleteReview(id));
    }

    @GetMapping("/statReviews")
    public ResponseEntity<?> getStatReviews(){
        return ResponseEntity.ok(reviewService.getStatReviews());
    }

    @GetMapping("/statReviewOfBook/{bookId}")
    public ResponseEntity<?> getStatReviewOfBook(@PathVariable Long bookId){
        return ResponseEntity.ok(reviewService.getStatReviewOfBook(bookId));
    }

    
}
