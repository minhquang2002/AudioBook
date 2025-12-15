package com.example.AudioBook.repository;

import com.example.AudioBook.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review,Long> {
    List<Review> findByBookId(Long bookId);
    Page<Review> findByBookId(Long bookId, Pageable pageable);
    Object deleteByBookId(Long id);
}
